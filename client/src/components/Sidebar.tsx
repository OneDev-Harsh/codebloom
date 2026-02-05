import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Message, Project, Version } from '../types'
import { BotIcon, EyeIcon, Loader2Icon, SendIcon, UserIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { PAGE_TEMPLATES } from '@/constants/pageTemplates'

interface SidebarProps {
  isMenuOpen: boolean
  project: Project
  setProject: (project: Project) => void
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
  draft: string
  setDraft: (value: string) => void
  onImprovePage: () => void
  improvingPage: boolean
}

const Sidebar = ({ isMenuOpen, project, setProject, isGenerating, setIsGenerating, draft, setDraft, onImprovePage, improvingPage }: SidebarProps) => {

  const messageRef = useRef<HTMLDivElement | null>(null)
  
  const input = draft
  const setInput = setDraft

  const [showTemplates, setShowTemplates] = useState(false)


  const fetchProject = async () => {
    try {
      const {data} = await api.get(`/api/user/project/${project.id}`)
      setProject(data.project)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const handleRollback = async (versionId: string) => {
    try {
      const confirm = window.confirm('Are you sure you want to roll back to this version?')
      if(!confirm) return
      setIsGenerating(true)

      const {data} = await api.get(`/api/project/rollback/${project.id}/${versionId}`)
      const {data: data2} = await api.get(`/api/user/project/${project.id}`)

      toast.success(data.message)
      setProject(data2.project)
      setIsGenerating(false)
    } catch (error: any) {
      setIsGenerating(false)
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const handleRevisions = async (e: FormEvent) =>{
    e.preventDefault()
    let interval: number | undefined
    try {
      setIsGenerating(true)
      interval = setInterval(() => {
        fetchProject()
      }, 10000)
      const message = input
      setInput('')
      const {data} = await api.post(`/api/project/revision/${project.id}`, 
        {message})
        fetchProject()
        toast.success(data.message)
        clearInterval(interval)
        setIsGenerating(false)
    } catch (error: any) {
      setIsGenerating(false)
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
      clearInterval(interval)
    }
  }

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [project.conversation.length, isGenerating])

  const applyTemplate = async (templateId: string) => {
    if (isGenerating) return

    try {
      setIsGenerating(true)

      // Close modal immediately for better UX
      setShowTemplates(false)

      const { data } = await api.post('/api/ai/apply-template', {
        projectId: project.id,
        templateId
      })

      toast.success(data?.message || 'Template applied')

      // Fetch updated project AFTER AI finishes
      await fetchProject()

    } catch (error: any) {
      console.error(error)
      toast.error(
        error?.response?.data?.message || 'Failed to apply template'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (isGenerating) {
      setShowTemplates(false)
    }
  }, [isGenerating])

  return (
    <div
      className={`
        h-full flex flex-col
        border-r border-slate-800
        bg-black/60 backdrop-blur
        transition-all duration-300
        ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : 'w-full sm:w-80'}
      `}
    >
      <div className="flex flex-col h-full">

        <div className="relative px-4 py-3 border-b border-slate-800 bg-black/70">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-300">
              AI Assistant
            </h2>
            
            <button
              onClick={onImprovePage}
              disabled={improvingPage}
              className={`
                relative group
                inline-flex items-center gap-2
                rounded-md px-4 py-1.5 text-xs font-medium
                transition
                duration-200
                ease-out
                overflow-hidden
                ${
                  improvingPage
                    ? 'bg-indigo-500/20 text-indigo-300 cursor-not-allowed'
                    : `
                      text-indigo-200
                      bg-[length:200%_200%]
                      bg-gradient-to-r from-indigo-500/25 via-purple-500/30 to-indigo-500/25
                      animate-ai-breathe
                      hover:animate-none
                      hover:bg-indigo-600/30
                      hover:shadow-[0_4px_14px_rgba(99,102,241,0.35)]
                      active:scale-[0.98]
                    `
                }
              `}
            >
              {improvingPage ? (
                <>
                  <Loader2Icon size={14} className="animate-spin" />
                  Improving…
                </>
              ) : (
                <>✨ Improve Page</>
              )}
            </button>

          </div>
        </div>

        {/* MESSAGE AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">

          {[...project.conversation, ...project.versions]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((message) => {
              const isMessage = 'content' in message

              if (isMessage) {
                const msg = message as Message
                const isUser = msg.role === 'user'

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                        <BotIcon size={16} />
                      </div>
                    )}

                    <div
                      className={`
                        max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed
                        ${isUser
                          ? 'bg-gradient-to-r from-[#CB52D4] to-indigo-600 text-white'
                          : 'bg-white/5 text-slate-300'}
                      `}
                    >
                      {msg.content}
                    </div>

                    {isUser && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300">
                        <UserIcon size={16} />
                      </div>
                    )}
                  </div>
                )
              } else {
                const ver = message as Version

                return (
                  <div
                    key={ver.id}
                    className="rounded-xl border border-slate-800 bg-white/5 px-4 py-3 text-xs text-slate-400 space-y-2"
                  >
                    <div>
                      <p className="font-medium text-slate-300">
                        Code updated
                      </p>
                      <span>
                        {new Date(ver.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-3">
                      {project.current_version_index === ver.id ? (
                        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-400">
                          Current version
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRollback(ver.id)}
                          className="rounded-md bg-white/10 px-3 py-1 hover:bg-white/20 transition"
                        >
                          Roll back
                        </button>
                      )}

                      <Link
                        target="_blank"
                        to={`/preview/${project.id}/${ver.id}`}
                        className="flex items-center gap-1 hover:text-white transition"
                      >
                        <EyeIcon size={14} />
                        Preview
                      </Link>
                    </div>
                  </div>
                )
              }
            })}

          {/* GENERATING STATE */}
          {isGenerating && (
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                <BotIcon size={16} />
              </div>

              <div className="flex items-center gap-1 rounded-2xl bg-white/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          <div ref={messageRef} />
        </div>

        {/* INPUT AREA */}
        <form
          onSubmit={handleRevisions}
          className="
            border-t border-slate-800
            bg-black/70
            p-3
          "
        >
          <div
            className="
              rounded-xl
              border border-slate-800
              bg-black/80
              p-3
              space-y-3
            "
          >
            {/* TEMPLATE PICKER */}
            <div className="relative">
              <button
                disabled={isGenerating}
                type="button"
                onClick={() => setShowTemplates(true)}
                className="
                  inline-flex items-center gap-1.5
                  text-xs font-medium
                  text-indigo-400
                  hover:text-indigo-300
                  transition
                  disabled:opacity-50
                "
              >
                Browse templates
              </button>

              {showTemplates && (
                <div
                  className="
                    absolute left-0 right-0 z-20 mt-2
                    rounded-lg
                    border border-slate-800
                    bg-black/90
                    shadow-xl
                    p-1
                    space-y-1
                  "
                >
                  {PAGE_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => applyTemplate(template.id)}
                      className="
                        w-full rounded-md
                        px-3 py-2
                        text-left
                        transition
                        hover:bg-white/10
                        disabled:opacity-50
                      "
                    >
                      <p className="text-sm font-medium text-slate-200">
                        {template.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TEXTAREA + SEND */}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
                placeholder="Describe changes or add new features..."
                disabled={isGenerating}
                className="
                  flex-1 resize-none
                  rounded-lg
                  bg-white/5
                  px-4 py-3
                  text-sm text-white
                  placeholder-slate-400
                  outline-none
                  focus:ring-2 focus:ring-indigo-500/60
                  transition
                  disabled:opacity-60
                "
              />

              <button
                type="submit"
                disabled={isGenerating || !input.trim()}
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-gradient-to-r from-[#CB52D4] to-indigo-600
                  text-white
                  shadow-[0_6px_20px_-8px_rgba(99,102,241,0.8)]
                  transition
                  hover:opacity-90
                  active:scale-95
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {isGenerating ? (
                  <Loader2Icon size={16} className="animate-spin" />
                ) : (
                  <SendIcon size={16} />
                )}
              </button>
            </div>
          </div>
        </form>

      </div>

      {showTemplates && (
  <div
    className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-black/70 backdrop-blur-sm
      animate-fade-in
    "
    onClick={() => setShowTemplates(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        w-[420px] max-w-[92vw]
        max-h-[85vh]
        rounded-2xl
        border border-slate-800
        bg-black/90
        shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)]
        p-5
        flex flex-col
        animate-scale-in
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">
          Choose a page template
        </h3>

        <button
          onClick={() => setShowTemplates(false)}
          className="
            rounded-md p-1
            text-slate-400
            hover:text-white
            hover:bg-white/10
            transition
          "
        >
          ✕
        </button>
      </div>

      {/* TEMPLATE LIST */}
      <div
        className="
          relative
          flex-1
          overflow-y-auto
          pr-1
          space-y-3
          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-slate-700/60
          hover:scrollbar-thumb-slate-600
        "
      >
        {/* TOP FADE */}
        <div className="pointer-events-none sticky top-0 h-6 bg-gradient-to-b from-black/90 to-transparent z-10" />

        {PAGE_TEMPLATES.map(template => (
          <button
            key={template.id}
            disabled={isGenerating}
            onClick={() => applyTemplate(template.id)}
            className="
              w-full
              rounded-2xl
              border border-slate-800
              bg-gradient-to-br from-white/5 to-white/[0.02]
              p-4
              text-left
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-indigo-500/40
              hover:bg-indigo-500/10
              hover:shadow-[0_12px_40px_-12px_rgba(99,102,241,0.6)]
              active:scale-[0.98]
              disabled:opacity-50
              group
            "
          >
            {/* PREVIEW */}
            <div
              className="
                mb-3 h-24 w-full
                rounded-xl
                bg-gradient-to-br from-slate-800 to-slate-900
                border border-slate-700/50
                flex items-center justify-center
                text-xs text-slate-500
                group-hover:text-indigo-300
                transition
              "
            >
              Template Preview
            </div>

            {/* TEXT */}
            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition">
              {template.name}
            </p>
            <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-300 transition">
              {template.description}
            </p>
          </button>
        ))}

        {/* BOTTOM FADE */}
        <div className="pointer-events-none sticky bottom-0 h-6 bg-gradient-to-t from-black/90 to-transparent z-10" />
      </div>
    </div>
  </div>
)}


    </div>
  )
}

export default Sidebar
