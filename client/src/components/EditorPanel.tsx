import api from '@/configs/axios'
import { diffStyles, diffText } from '@/lib/utils'
import { X } from 'lucide-react'
import React, { useEffect, useState } from 'react'

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
  setRevisionDraft: (text: string) => void
}

interface AISuggestion {
  id: string
  label: string
  summary: string
  why: string
  changes: {
    text?: string
    styles?: Record<string, string>
  }
}

const EditorPanel = ({ selectedElement, onUpdate, onClose, setRevisionDraft }: EditorPanelProps) => {
  const [values, setValues] = useState(selectedElement)

  const [mode, setMode] = useState<'edit' | 'explain' | 'suggest'>('edit')
  const [explanation, setExplanation] = useState<string | null>(null)
  const [explaining, setExplaining] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showWhy, setShowWhy] = useState(false)

  if (!selectedElement || !values) return null

  const handleChange = (field: string, value: string) => {
    const newValues = { ...values, [field]: value }
    if (field in values.styles) {
      newValues.styles = { ...values.styles, [field]: value }
    }
    setValues(newValues)
    onUpdate({ [field]: value })
  }

  const handleStyleChange = (styleName: string, value: string) => {
    const newStyles = { ...values.styles, [styleName]: value }
    setValues({ ...values, styles: newStyles })
    onUpdate({ styles: { [styleName]: value } })
  }

  const explainElement = async () => {
    try {
      setExplaining(true)
      setExplanation(null)

      const { data } = await api.post('/api/ai/explain-section', {
        tagName: selectedElement.tagName,
        className: selectedElement.className,
        text: selectedElement.text,
        styles: selectedElement.styles,
      })

      setExplanation(data.explanation)
    } catch {
      setExplanation('Failed to explain this section.')
    } finally {
      setExplaining(false)
    }
  }

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true)
      setSuggestions([])
      setActiveSuggestionId(null)

      const { data } = await api.post('/api/ai/suggest-improvements', {
        tagName: selectedElement.tagName,
        text: selectedElement.text,
        styles: selectedElement.styles,
        intent: 'Improve visual clarity and usability',
      })

      if (!Array.isArray(data?.suggestions)) {
        return
      }

      // 🔥 NORMALIZE RESPONSE
      const normalizedSuggestions: AISuggestion[] = data.suggestions.map(
        (s: any, index: number) => ({
          id: String(s.id ?? index),
          label: s.label ?? `Suggestion ${index + 1}`,
          summary: s.summary ?? '',
          why: s.why ?? '',
          changes: {
            text:
              typeof s.changes?.text === 'string'
                ? s.changes.text
                : undefined,
            styles:
              s.changes?.styles && typeof s.changes.styles === 'object'
                ? s.changes.styles
                : undefined,
          },
        })
      )

      setSuggestions(normalizedSuggestions)
      setActiveSuggestionId(normalizedSuggestions[0]?.id ?? null)
    } catch (e: any) {
      console.error('Suggest API error:', e?.response?.data || e)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleModeChange = (m: 'edit' | 'explain' | 'suggest') => {
    setMode(m)

    if (m === 'explain' && !explanation) {
      explainElement()
    }

    if (m === 'suggest') {
      fetchSuggestions()
    }
  }

  const active = suggestions.find(s => s.id === activeSuggestionId)

  useEffect(() => {
    setValues(selectedElement)
    setSuggestions([])
    setActiveSuggestionId(null)
    setShowWhy(false)
  }, [selectedElement])

  const buildRevisionPrompt = (suggestion: AISuggestion) => {
    const lines: string[] = []

    // 1️⃣ Structured text change (if present)
    if (
      typeof suggestion.changes?.text === 'string' &&
      suggestion.changes.text.trim().length > 0
    ) {
      lines.push(`Update the text to:\n"${suggestion.changes.text.trim()}"`)
    }

    // 2️⃣ Structured style changes (if present)
    if (suggestion.changes?.styles) {
      const entries = Object.entries(suggestion.changes.styles)
        .filter(([_, v]) => typeof v === 'string' && v.trim().length > 0)

      for (const [key, value] of entries) {
        lines.push(`Set ${key} to ${value}`)
      }
    }

    // 3️⃣ 🔥 FALLBACK — semantic revision (THIS FIXES YOUR ISSUE)
    if (lines.length === 0) {
      lines.push(suggestion.summary)

      if (suggestion.why) {
        lines.push(`Reason: ${suggestion.why}`)
      }
    }

    return `
    Apply the following improvements to the selected section:

    ${lines.map(l => `- ${l}`).join('\n')}
    `.trim()
  }



  return (
    <div className="absolute top-4 right-4 z-30 w-[340px] rounded-xl border border-slate-800 bg-black/90 shadow-xl text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-white/5">
        <div className="flex gap-2">
          {['edit', 'explain', 'suggest'].map(m => (
            <button
              key={m}
              onClick={() => handleModeChange(m as any)}
              className={`px-2 py-1 text-xs rounded-md ${
                mode === m
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'suggest' ? 'Improve' : m}
            </button>
          ))}
        </div>

        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="max-h-[70vh] overflow-y-auto px-4 py-4 text-sm">
        {mode === 'edit' && (
          <>
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
          </>
        )}

        {mode === 'explain' && (
          <>
            {explaining && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500/40 border-t-indigo-500" />
                Explaining this section…
              </div>
            )}

            {!explaining && explanation && (
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 leading-relaxed">
                {explanation}
              </div>
            )}
          </>
        )}

        {/* SUGGEST */}
        {mode === 'suggest' && (
          <>
            {loadingSuggestions && <p className="text-slate-400">Generating suggestions…</p>}

            {!loadingSuggestions && suggestions.length === 0 && (
              <div className="space-y-2">
                <p className="text-slate-500">
                  No suggestions generated.
                </p>
                <button
                  onClick={fetchSuggestions}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingSuggestions && active && (
              <div className="space-y-3">
                <p className="text-slate-300">{active.summary}</p>

                {/* TEXT DIFF */}
                {active.changes.text && (
                  <div className="rounded-md bg-black/40 p-2">
                    {diffText(values.text, active.changes.text).map((p, i) => (
                      <span
                        key={i}
                        className={
                          p.added
                            ? 'bg-green-500/20 text-green-300'
                            : p.removed
                            ? 'bg-red-500/20 text-red-300 line-through'
                            : ''
                        }
                      >
                        {p.value}
                      </span>
                    ))}
                  </div>
                )}

                {/* STYLE DIFF */}
                {active.changes.styles && (
                  <div className="rounded-md bg-black/40 p-2 space-y-1 text-xs">
                    {diffStyles(values.styles, active.changes.styles).map(
                      ([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-400">{k}</span>
                          <span className="text-red-400">{values.styles[k]}</span>
                          <span>→</span>
                          <span className="text-green-400">{v}</span>
                        </div>
                      )
                    )}
                  </div>
                )}

                <button
                  onClick={() => setShowWhy(v => !v)}
                  className="text-xs text-indigo-400"
                >
                  Why?
                </button>

                {showWhy && <p className="text-xs text-slate-400">{active.why}</p>}

                <button
                  onClick={() => {
                    if (!active) return
                    const prompt = buildRevisionPrompt(active)
                    setRevisionDraft(prompt)
                    onClose()
                  }}
                  className="w-full rounded-md bg-indigo-500 py-2 text-xs hover:bg-indigo-600"
                >
                  Send to Sidebar
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

export default EditorPanel
