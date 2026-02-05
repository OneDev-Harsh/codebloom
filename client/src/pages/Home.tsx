import { PROMPT_TEMPLATES } from "@/assets/assets";
import api from "@/configs/axios";
import { authClient } from "@/lib/auth-client";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Home = () => {

  const {data: session} = authClient.useSession()

  const [credits, setCredits] = useState(0)
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false)
  const [htmlInput, setHtmlInput] = useState("")
  const [importing, setImporting] = useState(false)

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

  const handleImportHtml = async () => {
    try {
      if (!session?.user) {
        return toast.error("You need to be signed in")
      }

      if (!htmlInput.trim()) {
        return toast.error("Please paste your HTML code")
      }

      setImporting(true)

      const { data } = await api.post('/api/user/project/import-html', {
        html: htmlInput,
      })

      toast.success("HTML imported successfully")
      navigate(`/projects/${data.projectId}`)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setImporting(false)
    }
  }

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

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          {session?.user && (
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="
                rounded-md
                border border-indigo-500/30
                bg-white/5
                px-4 py-2
                text-sm text-indigo-300
                hover:bg-indigo-500/20 hover:text-white
                transition
              "
            >
              Import HTML
            </button>
          )}

          {!session?.user ? (
            <button
              type="button"
              onClick={() => navigate("/auth/signin")}
              className="
                rounded-md
                bg-gradient-to-r from-[#CB52D4] to-indigo-600
                px-5 py-2
                text-sm font-medium
                text-white
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
                rounded-md
                bg-gradient-to-r from-[#CB52D4] to-indigo-600
                px-5 py-2
                text-sm font-medium
                text-white
                shadow-[0_8px_30px_-10px_rgba(99,102,241,0.8)]
                hover:opacity-90
                disabled:opacity-50 disabled:cursor-not-allowed
                transition
              "
            >
              {!loading ? "Create with AI" : (
                <>
                  Generating
                  <Loader2Icon className="ml-1 size-4 animate-spin" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  </form>

  {/* SUBTLE FOOTNOTE */}
  <p className="mt-6 text-xs text-slate-500">
    Websites are generated privately and saved to your dashboard.
  </p>

  {showImportModal && (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/70 backdrop-blur-sm
        animate-fade-in
      "
      onClick={() => setShowImportModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-[520px] max-w-[92vw]
          rounded-2xl
          border border-slate-800
          bg-black/90
          shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)]
          p-6
          animate-scale-in
        "
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Import existing HTML
          </h3>
          <button
            onClick={() => setShowImportModal(false)}
            className="text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-xs text-slate-400">
          Paste your existing HTML. You can refine it using AI, preview it,
          and export the improved version.
        </p>

        <textarea
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          rows={8}
          placeholder="<!DOCTYPE html>..."
          className="
            w-full resize-none
            rounded-lg
            bg-white/5
            px-4 py-3
            text-sm text-white
            placeholder-slate-400
            outline-none
            focus:ring-2 focus:ring-indigo-500/60
            transition
          "
        />

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={() => setShowImportModal(false)}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>

          <button
            onClick={handleImportHtml}
            disabled={importing}
            className="
              rounded-md
              bg-gradient-to-r from-[#CB52D4] to-indigo-600
              px-5 py-2
              text-sm font-medium
              text-white
              shadow-[0_8px_30px_-10px_rgba(99,102,241,0.8)]
              hover:opacity-90
              disabled:opacity-50
              transition
            "
          >
            {importing ? (
              <>
                Importing
                <Loader2Icon className="ml-1 size-4 animate-spin" />
              </>
            ) : (
              "Import & Open Editor"
            )}
          </button>
        </div>
      </div>
    </div>
  )}

</section>
 
  );
};

export default Home;
