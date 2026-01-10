import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import CategoryPage from "./pages/CategoryPage";
import ToolPage from "./pages/ToolPage";
import { Toaster } from "react-hot-toast";
import ScrollToHash from "./components/layout/ScrollToHash";
import { FavoritesProvider } from "./hooks/useFavorites.tsx";

function App() {
  return (
    <FavoritesProvider>
      <Router>
        <ScrollToHash />
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/:categoryId/:toolId" element={<ToolPage />} />
            </Routes>
          </main>

          <footer className="border-t border-border py-12 bg-black/20">
            <div className="container mx-auto px-4 text-center">
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                Made with ❤️ by <a href="https://sampreeth.in" className="text-primary hover:underline font-bold">Sampreeth</a>
              </p>
              <div className="mt-4 flex justify-center gap-6 text-xs text-white/30 uppercase tracking-[0.2em] font-bold">
                <span>Security First</span>
                <span>•</span>
                <span>Client-Side Only</span>
                <span>•</span>
                <span>Privacy Focused</span>
              </div>
            </div>
          </footer>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#18181b',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              },
            }}
          />
        </div>
      </Router>
    </FavoritesProvider>
  );
}

export default App;
