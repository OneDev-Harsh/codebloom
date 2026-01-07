import { Route, Routes, useLocation } from "react-router-dom"
import Pricing from "./pages/Pricing"
import Projects from "./pages/Projects"
import MyProjects from "./pages/MyProjects"
import Preview from "./pages/Preview"
import Community from "./pages/Community"
import View from "./pages/View"
import Home from "./pages/Home"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { Toaster } from 'sonner'
import AuthPage from "./pages/auth/AuthPage"
import Settings from "./pages/Settings"
import Privacy from "./pages/Privacy"
import Terms from "./pages/Terms"
import Docs from "./pages/Docs"
import DevSupport from "./pages/DevSupport"

const App = () => {

  const {pathname} = useLocation()
  const hideNavbar = pathname.startsWith('/projects/') && pathname !== '/projects'  || pathname.startsWith('/preview/')  || pathname.startsWith('/view/')

  return (
    <div >
      {/* GLOBAL BACKGROUND */}
      {/*<img
        src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/hero/bg-gradient-2.png"
        alt=""
        className="fixed inset-0 -z-10 w-full h-full object-cover opacity-30 pointer-events-none"
      />
      */}

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-35"
        >
          <source src="bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <Toaster position="top-right" richColors />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/projects/:projectId" element={<Projects />} />
        <Route path="/projects" element={<MyProjects />} />
        <Route path="/preview/:projectId" element={<Preview />} />
        <Route path="/preview/:projectId/:versionId" element={<Preview />} />
        <Route path="/community" element={<Community />} />
        <Route path="/view/:projectId" element={<View />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/dev-support" element={<DevSupport />} />

        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path="/account/settings" element={<Settings />} />

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      {!hideNavbar && <Footer />}
    </div>
  )
}

export default App