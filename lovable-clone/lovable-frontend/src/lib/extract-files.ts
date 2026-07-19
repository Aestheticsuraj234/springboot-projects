export function extractFilesFromContent(content: string): Record<string, string> {
  const files: Record<string, string> = {}
  const regex = /```([^\n]*)\n([\s\S]*?)```/g
  let match: RegExpExecArray | null
  let index = 0

  while ((match = regex.exec(content)) !== null) {
    const language = match[1]?.trim().toLowerCase() ?? 'txt'
    const code = match[2].trim()
    if (!code) continue

    const extension =
      language === 'tsx'
        ? 'tsx'
        : language === 'typescript' || language === 'ts'
          ? 'ts'
          : language === 'jsx'
            ? 'jsx'
            : language === 'javascript' || language === 'js'
              ? 'js'
              : language === 'css'
                ? 'css'
                : language === 'html'
                  ? 'html'
                  : language === 'json'
                    ? 'json'
                    : 'txt'

    const filename = index === 0 ? `App.${extension}` : `component-${index}.${extension}`
    files[filename] = code
    index += 1
  }

  if (Object.keys(files).length === 0) {
    files['App.jsx'] = `export default function App() {\n  return (\n    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>\n      <h1>Generated Preview</h1>\n      <pre>${content.replace(/`/g, '')}</pre>\n    </div>\n  )\n}\n`
  }

  return files
}
