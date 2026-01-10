import type { ComponentNode } from "../types/componentTree.js"

export const validateComponentTree = (node: ComponentNode) => {
  if (!node || typeof node !== "object") {
    throw new Error("Invalid node")
  }

  if (!node.id || !node.type) {
    throw new Error("Missing required fields")
  }

  if (node.children) {
    node.children.forEach(validateComponentTree)
  }
}