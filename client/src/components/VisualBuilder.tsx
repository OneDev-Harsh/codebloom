import { useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import ComponentRenderer from "./visual/ComponentRenderer"
import { moveNode } from "./visual/treeUtils"

type Props = {
  tree: any
  setTree: (t: any) => void
}

const VisualBuilder = ({ tree, setTree }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return
    if (active.id === over.id) return

    setTree((prevTree: any) =>
      moveNode(prevTree, active.id as string, over.id as string)
    )
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full w-full overflow-auto bg-slate-900 p-6">
        <ComponentRenderer
          node={tree}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </DndContext>
  )
}

export default VisualBuilder
