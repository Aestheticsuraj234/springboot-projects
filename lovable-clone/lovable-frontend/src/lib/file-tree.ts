export type TreeItem = string | [string, ...TreeItem[]]

interface TreeNode {
  [key: string]: TreeNode | null
}

function buildChildren(node: TreeNode): TreeItem[] {
  const folders: TreeItem[] = []
  const leaves: TreeItem[] = []

  for (const [key, value] of Object.entries(node)) {
    if (value === null) {
      leaves.push(key)
    } else {
      folders.push([key, ...buildChildren(value)])
    }
  }

  return [...folders, ...leaves]
}

export function convertFilesToTreeItems(files: Record<string, string>): TreeItem[] {
  const tree: TreeNode = {}

  for (const filePath of Object.keys(files).sort()) {
    const parts = filePath.split('/')
    let current = tree

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part] as TreeNode
    }

    current[parts[parts.length - 1]] = null
  }

  return buildChildren(tree)
}
