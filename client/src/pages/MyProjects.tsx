import React, { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2Icon, PlusIcon, TrashIcon, GlobeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const MyProjects = () => {

  const {data: session, isPending} = authClient.useSession()
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const deleteProject = async (projectId: string) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this project?')
      if(!confirm) return
      const {data} = await api.delete(`/api/project/${projectId}`)
      toast.success(data.message)
      fetchProjects()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  };

  const fetchProjects = async () => {
    try {
      const {data} = await api.get('/api/user/projects')
      setProjects(data.projects)
      setLoading(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  useEffect(() => {
    if(session?.user && !isPending){
      fetchProjects()
    } else if (!isPending && !session?.user){
      navigate('/')
      toast('You must be logged in to view your projects')
    }
  }, [session?.user]);

  return (
    <div className="px-4 md:px-16 lg:px-24 xl:px-32 py-12 text-white">
      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2Icon className="size-6 animate-spin text-indigo-400" />
        </div>
      )}

      {/* PROJECTS */}
      {!loading && projects.length > 0 && (
        <div className="space-y-8">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              My Projects
            </h1>

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 rounded-md bg-gradient-to-r from-[#CB52D4] to-indigo-600 px-4 py-2 text-sm font-medium hover:opacity-90 transition"
            >
              <PlusIcon size={18} />
              Create New
            </button>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group relative cursor-pointer rounded-2xl border border-slate-800 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 transition hover:border-indigo-500/50 hover:shadow-[0_10px_40px_-15px_rgba(99,102,241,0.45)]"
              >
                {/* DELETE BUTTON — FIXED */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                  }}
                  className="
                    absolute right-3 top-3 z-20
                    rounded-lg bg-black/70 p-2
                    text-red-400 backdrop-blur
                    opacity-0 scale-95
                    transition-all duration-200
                    hover:bg-red-500 hover:text-white
                    group-hover:opacity-100 group-hover:scale-100
                  "
                  aria-label="Delete project"
                >
                  <TrashIcon size={16} />
                </button>

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

                  {/* PREVIEW OVERLAY */}
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

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                    <span>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 flex items-center gap-4"
                  >
                    <button
                      onClick={() => navigate(`/preview/${project.id}`)}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="text-xs font-medium text-slate-300 hover:text-white transition"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => window.open(project.websiteUrl, "_blank")}
                      className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white transition"
                    >
                      Website
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[65vh] text-center">
          <div className="rounded-full bg-white/5 p-4 mb-4">
            <PlusIcon className="text-indigo-400" size={28} />
          </div>

          <h1 className="text-xl font-semibold tracking-tight">
            Your first website is 1 prompt away.
            Most users publish their first site in under 3 minutes.
          </h1>

          <p className="mt-2 text-sm text-slate-400 max-w-sm">
            Start by creating your first project. Your generated websites will
            appear here.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 flex items-center gap-2 rounded-md bg-gradient-to-r from-[#CB52D4] to-indigo-600 px-6 py-2.5 text-sm font-medium hover:opacity-90 transition"
          >
            <PlusIcon size={18} />
            Create New Project
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProjects;
