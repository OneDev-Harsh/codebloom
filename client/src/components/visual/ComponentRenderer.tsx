import { useState } from "react"
import DraggableBlock from "./DraggableBlock"
import DroppableContainer from "./DroppableContainer"
import { canHaveChildren, isDraggable } from "./editorRules"

type ComponentNode = {
  id: string
  type: "page" | "section" | "container" | "text" | "image" | "button"
  props?: {
    text?: string
    src?: string
    href?: string
  }
  styles?: Record<string, string>
  children?: ComponentNode[]
}

type Props = {
  node: ComponentNode
  selectedId: string | null
  onSelect: (id: string) => void
}

const ComponentRenderer = ({ node, selectedId, onSelect }: Props) => {
  const [isHovered, setIsHovered] = useState(false)
  const isSelected = selectedId === node.id

  const editorStyle: React.CSSProperties = {
    ...node.styles,

    /* spacing */
    padding: node.type === "text" ? "6px 4px" : "14px",
    margin: "10px 0",

    /* shape */
    borderRadius: "14px",

    /* visuals */
    background: isSelected
      ? "linear-gradient(180deg, rgba(99,102,241,0.12), rgba(99,102,241,0.05))"
      : isHovered
      ? "rgba(255,255,255,0.03)"
      : "rgba(255,255,255,0.015)",

    outline: isSelected
      ? "2px solid rgba(99,102,241,0.9)"
      : isHovered
      ? "1px solid rgba(255,255,255,0.25)"
      : "1px dashed rgba(255,255,255,0.12)",

    boxShadow: isSelected
      ? "0 0 0 4px rgba(99,102,241,0.15), 0 20px 40px -20px rgba(0,0,0,0.9)"
      : isHovered
      ? "0 10px 30px -20px rgba(0,0,0,0.8)"
      : "none",

    cursor: isDraggable(node.type) ? "grab" : "default",
    transition:
      "all 220ms cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(node.id)
  }

  const interactionProps = {
    style: editorStyle,
    onClick: handleClick,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  }

  /* ───────────────────────── PAGE ROOT ───────────────────────── */

  if (node.type === "page") {
    return (
      <div className="space-y-6">
        {node.children?.map((child) => (
          <ComponentRenderer
            key={child.id}
            node={child}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    )
  }

  /* ───────────────────── SECTION / CONTAINER ─────────────────── */

  if (node.type === "section" || node.type === "container") {
    return (
      <DroppableContainer
        id={node.id}
        disabled={!canHaveChildren(node.type)}
      >
        <DraggableBlock
          id={node.id}
          disabled={!isDraggable(node.type)}
        >
          <div {...interactionProps}>
            <EditorBadge label={node.type} />

            <div className="mt-3 space-y-3">
              {node.children?.map((child) => (
                <ComponentRenderer
                  key={child.id}
                  node={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        </DraggableBlock>
      </DroppableContainer>
    )
  }

  /* ───────────────────────── TEXT ───────────────────────── */

  if (node.type === "text") {
    return (
      <DraggableBlock id={node.id}>
        <p {...interactionProps} className="text-sm text-slate-200">
          <EditorBadge label="text" />
          {node.props?.text || "Text"}
        </p>
      </DraggableBlock>
    )
  }

  /* ───────────────────────── BUTTON ───────────────────────── */

  if (node.type === "button") {
    return (
      <DraggableBlock id={node.id}>
        <button
          {...interactionProps}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600/90 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition"
        >
          <EditorBadge label="button" />
          {node.props?.text || "Button"}
        </button>
      </DraggableBlock>
    )
  }

  /* ───────────────────────── IMAGE ───────────────────────── */

  if (node.type === "image") {
    return (
      <DraggableBlock id={node.id}>
        <div {...interactionProps}>
          <EditorBadge label="image" />
          <img
            src={node.props?.src}
            alt=""
            className="mt-2 w-full rounded-xl pointer-events-none"
          />
        </div>
      </DraggableBlock>
    )
  }

  return null
}

/* ───────────────────── EDITOR-ONLY BADGE ───────────────────── */

const EditorBadge = ({ label }: { label: string }) => (
  <div
    className="
      absolute -top-2 left-4
      rounded-full
      bg-black/70
      px-3 py-0.5
      text-[10px] font-semibold uppercase tracking-wide
      text-slate-300
      backdrop-blur
      border border-white/10
      shadow-lg
      pointer-events-none
    "
  >
    {label}
  </div>
)

export default ComponentRenderer
