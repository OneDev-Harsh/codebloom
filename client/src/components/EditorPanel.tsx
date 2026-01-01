import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface EditorPanelProps {
  selectedElement: {
    tagName: string
    className: string
    text: string
    styles: {
      padding: string
      margin: string
      backgroundColor: string
      color: string
      fontSize: string
      [key: string]: string
    } | null
  }
  onUpdate: (updates: any) => void
  onClose: () => void
}

const EditorPanel = ({ selectedElement, onUpdate, onClose }: EditorPanelProps) => {
  const [values, setValues] = useState(selectedElement)

  useEffect(() => {
    setValues(selectedElement)
  }, [selectedElement])

  if (!selectedElement || !values) return null

  const handleChange = (field: string, value: string) => {
    const newValues = { ...values, [field]: value }
    setValues(newValues)
    onUpdate({ [field]: value })
  }

  const handleStyleChange = (styleName: string, value: string) => {
    setValues({ ...values})
    onUpdate({ styles: { [styleName]: value } })
  }

  return (
    <div
      className="
        absolute top-4 right-4 z-30
        w-[320px]
        rounded-xl
        border border-slate-800
        bg-black/85 backdrop-blur
        shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]
        text-white
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-white/5">
        <h3 className="text-sm font-semibold tracking-tight">
          Edit Element
        </h3>

        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="max-h-[70vh] overflow-y-auto px-4 py-4 space-y-5 text-sm">

        {/* TEXT */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Text Content</label>
          <textarea
            value={values.text}
            onChange={(e) => handleChange('text', e.target.value)}
            className="
              w-full min-h-[70px] resize-none
              rounded-lg bg-white/5 px-3 py-2
              text-white outline-none
              focus:ring-2 ring-indigo-500 transition
            "
          />
        </div>

        {/* CLASS */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Class Name</label>
          <input
            type="text"
            value={values.className || ''}
            onChange={(e) => handleChange('className', e.target.value)}
            className="
              w-full rounded-lg bg-white/5 px-3 py-2
              text-white outline-none
              focus:ring-2 ring-indigo-500 transition
            "
          />
        </div>

        {/* SPACING */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400">Padding</label>
            <input
              type="text"
              value={values.styles?.padding || ''}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              className="mt-1 w-full rounded-md bg-white/5 px-2 py-1.5 text-white outline-none focus:ring-2 ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Margin</label>
            <input
              type="text"
              value={values.styles?.margin || ''}
              onChange={(e) => handleStyleChange('margin', e.target.value)}
              className="mt-1 w-full rounded-md bg-white/5 px-2 py-1.5 text-white outline-none focus:ring-2 ring-indigo-500"
            />
          </div>
        </div>

        {/* FONT */}
        <div>
          <label className="text-xs text-slate-400">Font Size</label>
          <input
            type="text"
            value={values.styles?.fontSize || ''}
            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 px-3 py-2 text-white outline-none focus:ring-2 ring-indigo-500"
          />
        </div>

        {/* COLORS */}
<div className="space-y-2">
  <h4 className="text-xs font-medium text-slate-400 tracking-wide">
    Colors
  </h4>

  <div className="grid grid-cols-2 gap-3">
    {/* BACKGROUND */}
    <div className="space-y-1.5">
      <label className="text-[11px] text-slate-500">Background</label>

      <div className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1.5 border border-slate-800 hover:border-slate-700 transition">
        <input
          type="color"
          value={
            values.styles?.backgroundColor?.startsWith('#')
              ? values.styles.backgroundColor
              : '#ffffff'
          }
          onChange={(e) =>
            handleStyleChange('backgroundColor', e.target.value)
          }
          className="h-6 w-6 cursor-pointer rounded border-none bg-transparent"
        />

        <span className="text-[11px] text-slate-400 truncate">
          {values.styles?.backgroundColor || 'transparent'}
        </span>
      </div>
    </div>

    {/* TEXT */}
    <div className="space-y-1.5">
      <label className="text-[11px] text-slate-500">Text</label>

      <div className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1.5 border border-slate-800 hover:border-slate-700 transition">
        <input
          type="color"
          value={
            values.styles?.color?.startsWith('#')
              ? values.styles.color
              : '#ffffff'
          }
          onChange={(e) =>
            handleStyleChange('color', e.target.value)
          }
          className="h-6 w-6 cursor-pointer rounded border-none bg-transparent"
        />

        <span className="text-[11px] text-slate-400 truncate">
          {values.styles?.color || 'inherit'}
        </span>
      </div>
    </div>
  </div>
</div>


      </div>
    </div>
  )
}

export default EditorPanel
