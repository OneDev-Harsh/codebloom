import { useDroppable } from "@dnd-kit/core"
import React from "react"

type DroppableContainerProps = {
  id: string
  disabled?: boolean
  children: React.ReactNode
}

const DroppableContainer = ({
  id,
  disabled,
  children,
}: DroppableContainerProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      className={`relative ${
        isOver && !disabled ? "ring-2 ring-indigo-500/60" : ""
      }`}
    >
      {children}
    </div>
  )
}

export default DroppableContainer
