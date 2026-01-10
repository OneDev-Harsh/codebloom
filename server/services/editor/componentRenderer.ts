import type { ComponentNode } from "../../types/componentTree.js"

export const renderTreeToHtml = (node: ComponentNode): string => {
  if (!node) return ""

  const children = (node.children || [])
    .map(renderTreeToHtml)
    .join("")

  const style = node.styles
    ? ` style="${Object.entries(node.styles)
        .map(([k, v]) => `${k}:${v}`)
        .join(";")}"`
    : ""

  switch (node.type) {
    case "page":
      return children

    case "section":
      return `<section${style}>${children}</section>`

    case "container":
      return `<div${style}>${children}</div>`

    case "text":
      return `<p${style}>${node.props?.text || ""}</p>`

    case "image":
      return `<img src="${node.props?.src || ""}"${style} />`

    case "button":
      return node.props?.href
        ? `<a href="${node.props.href}"${style}>${node.props.text}</a>`
        : `<button${style}>${node.props?.text || ""}</button>`

    default:
      return ""
  }
}