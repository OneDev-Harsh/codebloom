import { PROMPT_TEMPLATES } from "@/assets/assets";
import api from "@/configs/axios";
import { authClient } from "@/lib/auth-client";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Home = () => {

  const {data: session} = authClient.useSession()

  const [credits, setCredits] = useState(0)
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  const getCredits = async () => {
      try {
        const {data} = await api.get('/api/user/credits')
        setCredits(data.credits)
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error.message)
        console.log(error)
      }
  }

  const onSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if(!session?.user){
        return toast.error('You need to be signed in to create a project')
      } else if(!input.trim()){
        return toast.error('Please enter the prompt')
      }

      if(credits>=5){
        setLoading(true)
        const {data} = await api.post('/api/user/project', {initial_prompt: input})
        setLoading(false)
        navigate(`/projects/${data.projectId}`)
      } else {
        toast.error('Insufficient credits to create a project. Buy more credits to continue.')
      }

    } catch (error: any) {
      setLoading(false)
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  };

  useEffect(() => {
    if (session?.user) {
      getCredits()
    }
  }, [session?.user])

  return (
    <section className="relative flex flex-col items-center px-4 pb-28 pt-32 text-white font-poppins overflow-hidden">

  {/* BACKGROUND GLOW */}
  <div className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[420px] w-[800px] rounded-full bg-indigo-600/20 blur-[120px]" />
  </div>

  {/* HERO */}
  <h1 className="max-w-3xl text-center text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
    Transform your ideas into complete websites instantly with 
    <span className="block bg-gradient-to-r from-[#CB52D4] to-indigo-500 bg-clip-text text-transparent">
      CodeBloom
    </span>
  </h1>

  <p className="mt-5 max-w-md text-center text-base text-slate-300">
    Design fast, customize freely, and let AI do the heavy lifting — no code required.
  </p>

  {/* PROMPT CARD */}
  <form
    onSubmit={onSubmitHandler}
    className="
      group mt-12 w-full max-w-2xl
      rounded-2xl
      border border-indigo-500/30
      bg-white/10 backdrop-blur-xl
      p-5
      transition
      focus-within:ring-2 focus-within:ring-indigo-500/60
    "
  >
    {/* PROMPT TEMPLATES */}
    <div className="flex flex-wrap gap-2 mb-3">
      {PROMPT_TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => setInput(template.prompt)}
          className="
            rounded-full
            border border-indigo-500/30
            bg-white/5
            px-3 py-1.5
            text-xs text-slate-300
            hover:bg-indigo-500/20 hover:text-white
            transition
          "
        >
          {template.label}
        </button>
      ))}
    </div>
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      rows={4}
      placeholder="Describe the website you want to build…"
      className="
        w-full resize-none bg-transparent
        text-sm text-white placeholder-slate-400
        outline-none
      "
      disabled={loading}
      required
    />

    {/* ACTION BAR */}
    <div className="mt-4 flex items-center justify-between">

      {/* CREDIT INFO */}
      {session?.user && (
        <span className="text-xs text-slate-400">
          {credits >= 5 ? (
            <>
              Costs <span className="text-slate-200 font-medium">5 credits</span>
            </>
          ) : (
            <span className="text-red-400">
              Insufficient credits
            </span>
          )}
        </span>
      )}
      {!session?.user && (
        <span className="text-xs text-slate-500">
          Sign in to check credits
        </span>
      )}

      {/* CTA */}
      {!session?.user ? (
        <button
          type="button"
          onClick={() => navigate("/auth/signin")}
          className="
            flex items-center gap-2
            rounded-md
            bg-gradient-to-r from-[#CB52D4] to-indigo-600
            px-5 py-2
            text-sm font-medium
            shadow-[0_8px_30px_-10px_rgba(99,102,241,0.8)]
            hover:opacity-90
            transition
          "
        >
          Sign in to get started
        </button>
      ) : (
        <button
          type="submit"
          disabled={loading || credits < 5}
          className="
            flex items-center gap-2
            rounded-md
            bg-gradient-to-r from-[#CB52D4] to-indigo-600
            px-5 py-2
            text-sm font-medium
            shadow-[0_8px_30px_-10px_rgba(99,102,241,0.8)]
            hover:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition
          "
        >
          {!loading ? (
            "Create with AI"
          ) : (
            <>
              Generating
              <Loader2Icon className="size-4 animate-spin" />
            </>
          )}
        </button>
      )}
    </div>
  </form>

  {/* SUBTLE FOOTNOTE */}
  <p className="mt-6 text-xs text-slate-500">
    Websites are generated privately and saved to your dashboard.
  </p>

</section>
 
  );
};

export default Home;
