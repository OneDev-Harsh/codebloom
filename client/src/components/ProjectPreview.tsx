import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Project } from '../types'
import { iframeScript } from '../assets/assets'
import EditorPanel from './EditorPanel'
import GenerationLoader from './GenerationLoader'

export interface ProjectPreviewRef {
  getCode: () => string | undefined
}

export interface ProjectPreviewProps {
  project: Project
  isGenerating: boolean
  device?: 'phone' | 'tablet' | 'desktop'
  showEditorPanel?: boolean
  setRevisionDraft: (text: string) => void
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(
  ({ project, isGenerating, setRevisionDraft, device = 'desktop', showEditorPanel = true }, ref) => {

    const [selectedElement, setSelectedElement] = useState<any>(null)

    const iframeRef = useRef<HTMLIFrameElement>(null)

    const resolutions = {
      phone: 'w-[412px]',
      tablet: 'w-[768px]',
      desktop: 'w-full max-w-full'
    }

    useImperativeHandle(ref, () => ({
      getCode: () => {
        const doc = iframeRef.current?.contentDocument
        if (!doc) return undefined

        doc.querySelectorAll('.ai-selected-element, [data-ai-selected]').forEach((el) => {
          el.classList.remove('ai-selected-element'),
          el.removeAttribute('data-ai-selected'),
          (el as HTMLElement).style.outline = ''
        })

        const previewStyle = doc.getElementById('ai-preview-style')
        if (previewStyle) {
          previewStyle.remove()
        }

        const previewScript = doc.getElementById('ai-preview-script')
        if (previewScript) {
          previewScript.remove()
        }

        const html = doc.documentElement.outerHTML;
        return html
      }}))

    const injectPreview = (html: string) => {
      if (!html) return ''

      const brandingBadge = `
        <a
          href="https://codebloom.ai"
          target="_blank"
          style="
            position:fixed;
            bottom:16px;
            right:16px;
            z-index:9999;
            font-size:12px;
            font-family:system-ui,-apple-system,BlinkMacSystemFont;
            color:#ffffffcc;
            background:rgba(0,0,0,0.6);
            backdrop-filter:blur(8px);
            padding:6px 10px;
            border-radius:999px;
            text-decoration:none;
            border:1px solid rgba(255,255,255,0.2);
          "
        >
          Built with <strong>CodeBloom</strong>
        </a>
      `

      // Build everything we want to inject
      let injection = ''

      if (showEditorPanel) {
        injection += iframeScript
      }

      injection += brandingBadge

      // SINGLE body injection (this is the fix)
      if (html.includes('</body>')) {
        return html.replace('</body>', `${injection}</body>`)
      }

      // Fallback if body tag is missing
      return html + injection
    }

    const handleUpdate = (updates: any) => {
      if(iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT', payload: updates }, '*')
      }
    }

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'ELEMENT_SELECTED') {
          setSelectedElement(event.data.payload) 
        } else if (event.data.type === 'CLEAR_SELECTION') {
          setSelectedElement(null)
        }
      }
      window.addEventListener('message', handleMessage)
      return () => {
        window.removeEventListener('message', handleMessage)
      }
    }, [])

    return (
  <div className="flex h-full w-full items-start justify-start bg-[#0B0B10] overflow-auto">
    {project.current_code ? (
      <div
        className={`
          relative
          ${resolutions[device]}
          transition-all duration-300
          h-full
          rounded-lg
          bg-white
          shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_-25px_rgba(0,0,0,0.9)]
        `}
      >
        {/* IFRAME */}
        <iframe
          ref={iframeRef}
          srcDoc={injectPreview(project.current_code)}
          className="w-full h-full rounded-lg bg-white"
        />
        {showEditorPanel && selectedElement && (
          <EditorPanel selectedElement={selectedElement} onUpdate={handleUpdate} setRevisionDraft={setRevisionDraft} onClose={() => {
            setSelectedElement(null)
            if(iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage({ type: 'CLEAR_SELECTION_REQUEST' }, '*')
            }
          }
          } />
        )}
      </div>
    ) : isGenerating && (
      <GenerationLoader />
    )}
  </div>
)
  }
)

export default ProjectPreview
