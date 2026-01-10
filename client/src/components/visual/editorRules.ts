export const canHaveChildren = (type: string) =>
  type === "page" || type === "section" || type === "container"

export const isDraggable = (type: string) =>
  type !== "page"
