import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import LandingPage from "./pages/LandingPage";
import CategoryPage from "./pages/CategoryPage";
import ToolPage from "./pages/ToolPage";
import NotFoundPage from "./pages/NotFoundPage";
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
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />

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
