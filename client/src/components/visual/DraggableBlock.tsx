import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import React from "react"

type DraggableBlockProps = {
  id: string
  disabled?: boolean
  children: React.ReactNode
}

const DraggableBlock = ({ id, disabled, children }: DraggableBlockProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  )
}

export default DraggableBlock
