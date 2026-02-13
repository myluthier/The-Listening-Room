import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import ListeningRoom from "./pages/ListeningRoom";
import Admin from "./pages/Admin";
import { ArrowLeft, Settings } from "lucide-react";

function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FAF9F6 0%, #F2EFE9 100%)" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <header className="border-b border-stone-200/60 bg-white/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="group">
            {isAdmin && (
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1 group-hover:text-stone-600 transition"
                style={{ fontFamily: "'Outfit', sans-serif" }}>
                <ArrowLeft size={12} />Back to Listening Room
              </div>
            )}
            <h1 className="text-2xl md:text-3xl text-stone-800"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              The Listening Room
            </h1>
            <p className="text-xs text-stone-400 mt-0.5 tracking-widest uppercase"
              style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.12em" }}>
              {isAdmin ? "Admin Panel" : "Find your perfect instrument"}
            </p>
          </Link>

          {!isAdmin && (
            <Link to="/admin"
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition"
              title="Admin Panel">
              <Settings size={18} />
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        iframe {
          position: absolute !important;
          top: 0; left: 0;
          width: 100% !important;
          height: 100% !important;
          border: 0;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ListeningRoom />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
