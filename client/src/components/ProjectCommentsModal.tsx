import { useEffect, useState } from "react"
import { XIcon } from "lucide-react"
import api from "@/configs/axios"
import { toast } from "sonner"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    name: string
  }
}

interface Props {
  projectId: string
  projectName: string
  onClose: () => void
}

const ProjectCommentsModal = ({ projectId, projectName, onClose }: Props) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchComments = async () => {
    try {
      const { data } = await api.get(
        `/api/project/${projectId}/comments`
      )
      setComments(data.comments)
    } catch {
      toast.error("Failed to load comments")
    }
  }

  const postComment = async () => {
    if (!input.trim()) return

    try {
      setLoading(true)
      const { data } = await api.post(
        `/api/project/${projectId}/comment`,
        { content: input }
      )

      setComments((prev) => [data.comment, ...prev])
      setInput("")
    } catch {
      toast.error("Failed to post comment")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-lg
          rounded-2xl
          border border-slate-800
          bg-[#0B0B10]
          shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]
          animate-in fade-in zoom-in
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-white truncate">
            Comments — {projectName}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-4">
          {comments.length === 0 && (
            <p className="text-sm text-slate-500">
              No comments yet. Be the first.
            </p>
          )}

          {comments.map((c) => (
            <div key={c.id} className="space-y-1">
              <p className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">
                  {c.user.name}
                </span>{" "}
                • {new Date(c.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-slate-200">
                {c.content}
              </p>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="border-t border-slate-800 px-5 py-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a comment…"
              className="
                flex-1
                rounded-md
                bg-white/5
                px-3 py-2
                text-sm text-white
                outline-none
                focus:ring-2 ring-indigo-500
              "
            />
            <button
              onClick={postComment}
              disabled={loading}
              className="
                rounded-md
                bg-indigo-600
                px-4 py-2
                text-sm
                hover:opacity-90
                disabled:opacity-50
              "
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCommentsModal
