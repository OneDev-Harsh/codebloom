import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Project } from '../types'
import {
  ArrowBigDownDashIcon,
  EyeOffIcon,
  EyeIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  MessageSquareIcon,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import VisualBuilder from '@/components/VisualBuilder'

const Projects = () => {

  const {data: session, isPending} = authClient.useSession() 

  const { projectId } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(true)
  const [device, setDevice] = useState<'desktop' | 'phone' | 'tablet'>('desktop')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [revisionDraft, setRevisionDraft] = useState('')

  const [improvingPage, setImprovingPage] = useState(false)

  const [isVisualBuilder, setIsVisualBuilder] = useState(false)
  const [componentTree, setComponentTree] = useState<any | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  const previewRef = useRef<ProjectPreviewRef>(null)

  const fetchProject = async () => {
    try {
      const {data} = await api.get(`/api/user/project/${projectId}`)
      setProject(data.project)
      setIsGenerating(data.project.current_code ? false : true)
      setLoading(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const togglePublish = async () => {
    try {
      const {data} = await api.get(`/api/user/publish-toggle/${projectId}`)
      toast.success(data.message)
      setProject((prev) => prev ? ({...prev, isPublished: !prev.isPublished}) : null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code
    if (!code) {
      if(isGenerating) {
        return
      }
      return
    }
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = `${project?.name || 'website'}.html`
    document.body.appendChild(element)
    element.click()
  }

  const saveProject = async () => {
    if (isVisualBuilder) {
      if (!componentTree) return

      try {
        setIsSaving(true)

        const { data } = await api.post(
          "/api/project/components-to-html",
          { 
            tree: componentTree,
            originalHtml: project?.current_code
          }
        )

        await api.put(`/api/project/save/${projectId}`, {
          code: data.html,
        })

        toast.success("Visual changes saved")
        setIsVisualBuilder(false)
        fetchProject()

      } catch (err) {
        toast.error("Failed to save visual changes")
      } finally {
        setIsSaving(false)
      }

      return
    }

    // Existing save logic
    if (!previewRef.current) return
    const code = previewRef.current.getCode()
    if (!code) return
    setIsSaving(true)
    try {
      const { data } = await api.put(`/api/project/save/${projectId}`, { code })
      toast.success(data.message)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if(session?.user){
      fetchProject()
    } else if(!isPending && !session?.user){
      navigate("/")
      toast("You need to be signed in to view your projects")
    }
  })

  useEffect(() => {
    if(project && !project.current_code){
      const intervalId = setInterval(fetchProject, 10000)
      return () => clearInterval(intervalId)
    }
  }, [project])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2Icon className="size-6 animate-spin text-indigo-400" />
      </div>
    )
  }

  const handleImprovePage = async () => {
    if (improvingPage) return

    try {
      setImprovingPage(true)

      const { data } = await api.post('/api/ai/improve-page', {
        code: project?.current_code,
      })

      if (data?.suggestion) {
        setRevisionDraft(
          `Apply the following improvements to the page:\n\n${data.suggestion}`
        )
      }
    } catch (error) {
      console.error('Improve page error:', error)
    } finally {
      setImprovingPage(false)
    }
  }

  return project ? (
    <div className="flex flex-col h-screen bg-black text-white">

      {/* BUILDER NAVBAR */}
      <div className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-slate-800 bg-black/70 backdrop-blur z-30">

        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <img
            src="/favicon.svg"
            alt="logo"
            className="h-6 cursor-pointer shrink-0"
            onClick={() => navigate('/')}
          />

          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[140px] sm:max-w-[240px]">
              {project.name}
            </p>
            <p className="text-xs text-slate-400">
              Previewing last saved version
            </p>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="ml-2 rounded-md p-2 hover:bg-white/10 transition sm:hidden"
          >
            {isMenuOpen ? (
              <MessageSquareIcon size={18} />
            ) : (
              <XIcon size={18} />
            )}
          </button>
        </div>

        {/* CENTER – DEVICE SWITCHER */}
        <div className="hidden sm:flex items-center gap-1 rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setDevice('phone')}
            className={`p-2 rounded-md transition ${
              device === 'phone'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SmartphoneIcon size={16} />
          </button>

          <button
            onClick={() => setDevice('tablet')}
            className={`p-2 rounded-md transition ${
              device === 'tablet'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TabletIcon size={16} />
          </button>

          <button
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded-md transition ${
              device === 'desktop'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LaptopIcon size={16} />
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={async () => {
              if (isVisualBuilder) {
                setIsVisualBuilder(false)
                return
              }

              if (!project?.current_code) {
                toast.error("No code to convert")
                return
              }

              try {
                setIsConverting(true)

                const { data } = await api.post(
                  "/api/project/html-to-components",
                  { html: project.current_code }
                )

                setComponentTree(data.tree)
                setIsVisualBuilder(true)

                toast.success("Visual Builder enabled")
              } catch (err) {
                toast.error("Failed to open Visual Builder")
              } finally {
                setIsConverting(false)
              }
            }}
            disabled={isConverting}
            className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 transition disabled:opacity-50"
          >
            {isConverting ? (
              <Loader2Icon size={16} className="animate-spin" />
            ) : (
              <span></span>
            )}
            <span className="hidden sm:inline">
              {isVisualBuilder ? "Exit Builder" : "Visual Builder"}
            </span>
          </button>
          <button
            onClick={saveProject}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-white/5 px-2 sm:px-3 py-1.5 text-sm hover:bg-white/10 transition disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2Icon className="animate-spin" size={16} />
            ) : (
              <SaveIcon size={16} />
            )}
            <span className="hidden sm:inline">Save</span>
          </button>

          <Link
            target="_blank"
            to={`/preview/${projectId}`}
            className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 transition"
          >
            <FullscreenIcon size={16} />
            <span className="hidden sm:inline">Preview</span>
          </Link>

          <button
            onClick={downloadCode}
            className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 transition"
          >
            <ArrowBigDownDashIcon size={16} />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={togglePublish}
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-[#CB52D4] to-indigo-600 px-3 py-1.5 text-sm hover:opacity-90 transition"
          >
            {project.isPublished ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            <span className="hidden sm:inline">
              {project.isPublished ? 'Unpublish' : 'Publish'}
            </span>
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* SIDEBAR */}
        <Sidebar
          draft={revisionDraft}
          setDraft={setRevisionDraft}
          isMenuOpen={isMenuOpen}
          project={project}
          setProject={(p) => setProject(p)}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          onImprovePage={handleImprovePage}
          improvingPage={improvingPage}
        />

        {/* PREVIEW CANVAS */}
        <div className="flex-1 relative overflow-hidden">
          {isVisualBuilder && componentTree ? (
            <VisualBuilder
              tree={componentTree}
              setTree={setComponentTree}
            />
          ) : (
            <ProjectPreview
              ref={previewRef}
              project={project}
              isGenerating={isGenerating}
              device={device}
              setRevisionDraft={setRevisionDraft}
            />
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-screen text-slate-400">
      Project not found!
    </div>
  )
}

export default Projects
