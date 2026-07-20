import type { Fragment } from '@/types/api'

const JSON_NODE_ARTIFACT_KEYS = new Set([
  'array',
  'bigDecimal',
  'bigInteger',
  'binary',
  'boolean',
  'containerNode',
  'double',
  'empty',
  'float',
  'floatingPointNumber',
  'int',
  'integralNumber',
  'long',
  'missingNode',
  'nodeType',
  'null',
  'number',
  'object',
  'pojo',
  'short',
  'textual',
  'valueNode',
])

function isLikelySourceFile(path: string): boolean {
  if (JSON_NODE_ARTIFACT_KEYS.has(path)) {
    return false
  }

  return path.includes('.') || path.includes('/')
}

export function parseFragmentFiles(files: Fragment['files'] | undefined): Record<string, string> {
  if (!files || typeof files !== 'object') {
    return {}
  }

  const parsed = Object.fromEntries(
    Object.entries(files)
      .filter(([path]) => isLikelySourceFile(path))
      .map(([path, value]) => [
        path.replace(/^\//, ''),
        typeof value === 'string' ? value : JSON.stringify(value, null, 2),
      ]),
  )

  return parsed
}
