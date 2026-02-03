import React, { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2Icon, GlobeIcon, HeartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/configs/axios";
import { toast } from "sonner";
import LikeBurst from "@/effects/LikeBurst";

const Community = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [burstId, setBurstId] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const {data} = await api.get('/api/project/published')
      setProjects(data.projects)
      setLoading(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const toggleLike = async (
    e: React.MouseEvent,
    projectId: string
  ) => {
    e.stopPropagation()

    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likesCount: p.likesCount + (p.likedByMe ? -1 : 1),
            }
          : p
      )
    )

    setBurstId(projectId)
    setTimeout(() => setBurstId(null), 400)

    try {
      const { data } = await api.post(
        `/api/user/projects/${projectId}/like`
      )

      setProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? {
                ...p,
                likedByMe: data.liked,
                likesCount: data.likesCount,
              }
            : p
        )
      )
    } catch {
      toast.error("Failed to update like")
      fetchProjects() // fallback sync
    }
  }

  useEffect(() => {
    fetchProjects()
  }, []);

  return (
    <div className="px-4 md:px-16 lg:px-24 xl:px-32 py-12 text-white">
      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2Icon className="size-6 animate-spin text-indigo-400" />
        </div>
      )}

      {/* CONTENT */}
      {!loading && projects.length > 0 && (
        <div className="space-y-10">
          {/* HEADER */}
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight">
              Community Showcase
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Explore websites created by the CodeBloom community.
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  window.open(`/view/${project.id}`, "_blank", "noopener,noreferrer");
                }}
                className="group cursor-pointer rounded-2xl border border-slate-800
                           bg-gradient-to-b from-white/[0.06] to-white/[0.02]
                           p-4 transition
                           hover:border-indigo-500/50
                           hover:shadow-[0_12px_45px_-18px_rgba(99,102,241,0.45)]"
              >
                {/* PREVIEW */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black border border-slate-800">
                  {project.current_code ? (
                    <div className="absolute inset-0 origin-top-left scale-[0.25] pointer-events-none">
                      <iframe
                        srcDoc={project.current_code}
                        className="h-[400%] w-[400%]"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No Preview Available
                    </div>
                  )}

                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                </div>

                {/* INFO */}
                <div className="mt-4 space-y-2">
                  <h2 className="text-sm font-semibold tracking-tight truncate">
                    {project.name}
                  </h2>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {project.initial_prompt}
                  </p>

                  <div className="flex items-center justify-between pt-3">
                    {/* AUTHOR */}
                    <span className="text-xs text-slate-500">
                      by{" "}
                      <span className="text-slate-300 font-medium">
                        {project.user?.name ?? "Anonymous"}
                      </span>
                    </span>

                    <button
                      onClick={(e) => toggleLike(e, project.id)}
                      className={`
                        relative
                        flex items-center gap-1.5
                        rounded-full px-2.5 py-1
                        text-xs
                        transition
                        ${
                          project.likedByMe
                            ? "bg-red-500/10 text-red-400"
                            : "bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                        }
                      `}
                    >
                      {/* BURST */}
                      {burstId === project.id && project.likedByMe && <LikeBurst />}

                      <HeartIcon
                        size={13}
                        className={`
                          transition-transform
                          ${project.likedByMe ? "fill-red-500 scale-110" : ""}
                          active:scale-125
                        `}
                      />

                      <span>{project.likesCount}</span>
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[65vh] text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Nothing here yet
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-sm">
            Be the first to share a project with the community.
          </p>
        </div>
      )}
    </div>
  );
};

export default Community;
