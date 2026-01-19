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

  const smoothTransition = "all 260ms cubic-bezier(0.16, 1, 0.3, 1)";


  const editorStyle: React.CSSProperties = {
    ...node.styles,

    /* layout */
    padding: node.type === "text" ? "8px 6px" : "18px",
    margin: "14px 0",
    borderRadius: "18px",

    /* background */
    background: isSelected
      ? "linear-gradient(180deg, rgba(99,102,241,0.18), rgba(99,102,241,0.06))"
      : isHovered
      ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
      : "rgba(255,255,255,0.02)",

    /* border */
    border: isSelected
      ? "1px solid rgba(99,102,241,0.9)"
      : isHovered
      ? "1px solid rgba(255,255,255,0.35)"
      : "1px solid rgba(255,255,255,0.12)",

    /* depth */
    boxShadow: isSelected
      ? `
        0 0 0 4px rgba(99,102,241,0.18),
        0 30px 80px -35px rgba(0,0,0,0.95)
      `
      : isHovered
      ? "0 18px 45px -28px rgba(0,0,0,0.85)"
      : "0 6px 16px -14px rgba(0,0,0,0.7)",

    /* motion */
    transform: isHovered && !isSelected ? "translateY(-2px)" : "translateY(0)",
    transition: smoothTransition,

    cursor: isDraggable(node.type) ? "grab" : "default",
    position: "relative",
    backdropFilter: "blur(10px)",
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

            <div className="mt-4 space-y-4 pl-4 border-l border-white/10">
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
          className="inline-flex items-center justify-center
          rounded-xl
          bg-gradient-to-r from-indigo-600 to-fuchsia-600
          px-5 py-2.5
          text-sm font-medium text-white
          shadow-[0_12px_35px_-12px_rgba(99,102,241,0.8)]
          hover:opacity-90
          active:scale-[0.97]
          transition"
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
      absolute -top-3 left-5
      rounded-full
      bg-gradient-to-r from-indigo-500/80 to-fuchsia-500/80
      px-3 py-0.5
      text-[10px] font-semibold uppercase tracking-wide
      text-white
      shadow-[0_8px_30px_-10px_rgba(99,102,241,0.9)]
      backdrop-blur-md
      pointer-events-none
    "
  >
    {label}
  </div>
)

export default ComponentRenderer
