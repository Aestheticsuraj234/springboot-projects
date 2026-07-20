const FILE_NAME_PATTERN = /^[\w./-]+\.\w+$/
const FENCED_BLOCK = /```([^`\n]*)\n?([\s\S]*?)```/g
const REACT_COMPONENT = /(import\s+React[\s\S]*?export\s+default\s+App\s*;?)/i
const CSS_BLOCK = /(\.[A-Za-z][\w-]*\s*\{[\s\S]*?\}(?:\s*(?:\.[A-Za-z][\w-]*|input|button|ul|li|h1)[\s\S]*?\{[\s\S]*?\})*)/

function extensionFromLanguage(language: string): string {
  switch (language.toLowerCase()) {
    case 'tsx':
      return 'tsx'
    case 'typescript':
    case 'ts':
      return 'ts'
    case 'jsx':
      return 'jsx'
    case 'javascript':
    case 'js':
      return 'js'
    case 'css':
      return 'css'
    case 'html':
      return 'html'
    case 'json':
      return 'json'
    default:
      return 'txt'
  }
}

function parseFilenameFromHeader(header: string): string | null {
  const trimmed = header.trim()
  if (!trimmed) return null

  if (FILE_NAME_PATTERN.test(trimmed)) {
    return trimmed
  }

  for (const part of trimmed.split(/\s+/)) {
    const cleaned = part.replace(/^["'`]|["'`]$/g, '')
    if (FILE_NAME_PATTERN.test(cleaned)) {
      return cleaned
    }
  }

  const labeled = trimmed.match(/(?:filename|file)[=:\s]+["']?([\w./-]+\.\w+)/i)
  if (labeled?.[1]) {
    return labeled[1]
  }

  return null
}

function parseFilenameFromCode(code: string): string | null {
  const firstLine = code.split('\n')[0]?.trim() ?? ''
  const commentMatch =
    firstLine.match(/^\/\/\s*([\w./-]+\.\w+)\s*$/) ??
    firstLine.match(/^\/\*\s*([\w./-]+\.\w+)\s*\*\/$/)

  return commentMatch?.[1] ?? null
}

function defaultFilename(language: string, index: number): string {
  const extension = extensionFromLanguage(language)

  if (index === 0 && (extension === 'jsx' || extension === 'tsx')) {
    return `App.${extension}`
  }

  if (extension === 'css') {
    return index <= 1 ? 'App.css' : `styles-${index}.css`
  }

  return `file-${index}.${extension}`
}

function dedupeFilename(files: Record<string, string>, filename: string, index: number): string {
  if (!files[filename]) return filename
  const dot = filename.lastIndexOf('.')
  if (dot >= 0) {
    return `${filename.slice(0, dot)}-${index}${filename.slice(dot)}`
  }
  return `${filename}-${index}`
}

function extractFromFences(content: string): Record<string, string> {
  const files: Record<string, string> = {}
  let match: RegExpExecArray | null
  let index = 0

  while ((match = FENCED_BLOCK.exec(content)) !== null) {
    const header = match[1]?.trim() ?? ''
    let code = match[2]?.trim() ?? ''
    if (!code) continue

    const language = header.split(/\s+/)[0]?.toLowerCase() ?? 'txt'
    let filename =
      parseFilenameFromHeader(header) ??
      parseFilenameFromCode(code) ??
      defaultFilename(language, index)

    if (parseFilenameFromCode(code) && code.split('\n')[0]?.trim().startsWith('//')) {
      code = code.split('\n').slice(1).join('\n').trim()
    }

    if (!code) continue

    filename = dedupeFilename(files, filename, index)
    files[filename] = code
    index += 1
  }

  return files
}

function normalizeMessyContent(content: string): string {
  return content
    .replace(/```/g, '\n```')
    .replace(/(?<![.\w])(javascript|jsx|css|typescript)(?![.\w])/gi, '\n```$1\n')
    .replace(/importReact/g, 'import React')
    .replace(/from'react'/g, "from 'react'")
    .replace(/from"react"/g, 'from "react"')
    .replace(/functionApp/g, 'function App')
    .replace(/exportdefaultApp/g, 'export default App')
    .replace(/(import)([A-Z])/g, '$1 $2')
    .replace(/(from)(['"])/g, '$1 $2')
    .replace(/(function)([A-Z])/g, '$1 $2')
    .replace(/(export)(default)/g, '$1 $2')
    .replace(/(default)(App)/g, '$1 $2')
}

function extractFromHeuristics(content: string): Record<string, string> {
  const normalized = normalizeMessyContent(content)
  const files: Record<string, string> = {}
  const reactMatch = normalized.match(REACT_COMPONENT)
  if (reactMatch?.[1]) {
    files['App.jsx'] = reactMatch[1]
  }

  const cssMatch = normalized.match(CSS_BLOCK)
  if (cssMatch?.[1]) {
    const cssFile = normalized.includes('App.css') ? 'App.css' : 'styles.css'
    files[cssFile] = cssMatch[1]
  }

  return files
}

export function hasExtractableCode(content: string): boolean {
  FENCED_BLOCK.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = FENCED_BLOCK.exec(content)) !== null) {
    if (match[2]?.trim()) return true
  }

  return REACT_COMPONENT.test(normalizeMessyContent(content))
}

export function extractFilesFromContent(content: string): Record<string, string> {
  const normalized = normalizeMessyContent(content)
  const fromFences = extractFromFences(normalized)
  if (Object.keys(fromFences).length > 0) {
    return fromFences
  }
  return extractFromHeuristics(content)
}

export function buildFragmentTitle(files: Record<string, string>): string {
  const names = Object.keys(files)
  const appFile = names.find((name) => /^App\.(jsx|tsx)$/i.test(name))
  if (appFile) return 'Generated App Preview'

  const firstComponent = names.find((name) => /\.(jsx|tsx)$/i.test(name))
  if (firstComponent) {
    return firstComponent.replace(/\.(jsx|tsx)$/i, '')
  }

  return 'Generated Preview'
}
