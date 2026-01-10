type ComponentNode = {
  id: string
  type: string
  children?: ComponentNode[]
}

/**
 * Removes a node from the tree and returns it
 */
export function removeNode(
  tree: ComponentNode,
  id: string
): ComponentNode | null {
  if (!tree.children) return null

  const index = tree.children.findIndex(c => c.id === id)
  if (index !== -1) {
    return tree.children.splice(index, 1)[0]
  }

  for (const child of tree.children) {
    const removed = removeNode(child, id)
    if (removed) return removed
  }

  return null
}

/**
 * Inserts a node as a child of targetId
 */
export function insertNode(
  tree: ComponentNode,
  targetId: string,
  node: ComponentNode
): boolean {
  if (tree.id === targetId) {
    tree.children = tree.children || []
    tree.children.push(node)
    return true
  }

  if (!tree.children) return false

  for (const child of tree.children) {
    if (insertNode(child, targetId, node)) return true
  }

  return false
}

/**
 * Moves node from one place to another
 */
export function moveNode(
  tree: ComponentNode,
  activeId: string,
  overId: string
): ComponentNode {
  const cloned = structuredClone(tree)

  const node = removeNode(cloned, activeId)
  if (!node) return tree

  insertNode(cloned, overId, node)

  return cloned
}
