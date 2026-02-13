import { useState, useEffect } from "react";
import { ChevronRight, Check, Music2, Search, Eye, EyeOff, Undo2, Shuffle } from "lucide-react";
import { fetchInstruments, getThumbnail } from "../lib/supabase";
import DualPlayer from "../components/DualPlayer";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── SELECTION STEP ─── */
function SelectionStep({ instruments, onProceed }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(null);

  // Gather all unique tags
  const allTags = [...new Set(instruments.flatMap((i) => i.tags || []))].sort();

  const filtered = instruments.filter((i) => {
    const matchesSearch =
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.maker.toLowerCase().includes(search.toLowerCase()) ||
      i.year.includes(search);
    const matchesTag = !activeTag || (i.tags || []).includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canProceed = selected.length >= 2;

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <p className="text-stone-500 text-sm tracking-widest uppercase mb-3"
          style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.15em" }}>Step 1</p>
        <h2 className="text-3xl md:text-4xl text-stone-800 mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}>Choose Your Instruments</h2>
        <p className="text-stone-500 max-w-md mx-auto" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Select at least two instruments to compare. You'll listen to each one and choose your favourite.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by maker, instrument, or year..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-stone-400 outline-none focus:border-amber-700/40 focus:ring-2 focus:ring-amber-700/10 transition-all shadow-sm"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 transition"
              style={{ fontFamily: "'Outfit', sans-serif" }}>Clear</button>
          )}
        </div>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              !activeTag ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >All</button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition capitalize ${
                activeTag === tag ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >{tag}</button>
          ))}
        </div>
      )}

      {search && (
        <p className="text-xs text-stone-400 mb-4 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {filtered.length} instrument{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {filtered.map((inst) => {
          const isSelected = selected.includes(inst.id);
          return (
            <button
              key={inst.id}
              onClick={() => toggle(inst.id)}
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left ${
                isSelected
                  ? "border-amber-700 shadow-lg shadow-amber-900/10 scale-[1.02]"
                  : "border-transparent hover:border-stone-300 hover:shadow-md"
              }`}
              style={{ background: isSelected ? "#FFFBF5" : "#fff" }}
            >
              <div className="aspect-video relative overflow-hidden">
                <img src={getThumbnail(inst)} alt={inst.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className={`absolute inset-0 transition-all duration-300 ${
                  isSelected ? "bg-amber-800/20" : "bg-black/0 group-hover:bg-black/5"
                }`} />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center shadow-md animate-scaleIn">
                    <Check size={14} color="white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-stone-800 leading-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}>{inst.maker}</div>
                <div className="text-xs text-stone-400 mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {inst.year}
                </div>
                {(inst.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {inst.tags.map((t) => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded-full capitalize">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-stone-400 text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
              No instruments match your search
            </p>
          </div>
        )}
      </div>

      <div className="text-center mt-10">
        <button
          onClick={() => canProceed && onProceed(selected)}
          disabled={!canProceed}
          className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-300 ${
            canProceed
              ? "bg-stone-900 text-white hover:bg-stone-800 shadow-lg hover:shadow-xl cursor-pointer"
              : "bg-stone-200 text-stone-400 cursor-not-allowed"
          }`}
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >Enter the Listening Room<ChevronRight size={16} /></button>
        <p className="text-xs text-stone-400 mt-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {selected.length} selected{selected.length < 2 ? " — pick at least 2" : ""}
        </p>
      </div>
    </div>
  );
}

/* ─── COMPARE STEP ─── */
function CompareStep({ instruments, allInstruments, onFinish, onBack }) {
  const [queue, setQueue] = useState([]);
  const [currentA, setCurrentA] = useState(null);
  const [currentB, setCurrentB] = useState(null);
  const [activeSlot, setActiveSlot] = useState("A");
  const [round, setRound] = useState(1);
  const [totalRoundsEstimate, setTotalRoundsEstimate] = useState(0);
  const [history, setHistory] = useState([]);
  const [blindMode, setBlindMode] = useState(false);

  useEffect(() => {
    if (instruments.length < 2) return;
    const items = instruments.map((id) => allInstruments.find((i) => i.id === id)).filter(Boolean);
    const shuffled = shuffleArray(items);
    setCurrentA(shuffled[0]);
    setCurrentB(shuffled[1]);
    setQueue(shuffled.slice(2));
    setTotalRoundsEstimate(items.length - 1);
    setRound(1);
    setHistory([]);
  }, [instruments, allInstruments]);

  const saveHistory = () => {
    setHistory((prev) => [...prev, { currentA, currentB, queue: [...queue], round, activeSlot, totalRoundsEstimate }]);
  };

  const handleChoose = (winner) => {
    saveHistory();
    const winnerInst = winner === "A" ? currentA : currentB;
    if (queue.length === 0) { onFinish(winnerInst); return; }
    const next = queue[0];
    const newQueue = queue.slice(1);
    const flip = Math.random() < 0.5;
    setCurrentA(flip ? next : winnerInst);
    setCurrentB(flip ? winnerInst : next);
    setQueue(newQueue);
    setRound((r) => r + 1);
    setActiveSlot("A");
  };

  const handleNotSure = () => {
    saveHistory();
    if (queue.length === 0) {
      const flip = Math.random() < 0.5;
      setCurrentA(flip ? currentB : currentA);
      setCurrentB(flip ? currentA : currentB);
      setActiveSlot("A");
      return;
    }
    const kept = currentA;
    const deferred = currentB;
    const next = queue[0];
    let newQueue = queue.slice(1);
    newQueue.splice(Math.floor(Math.random() * (newQueue.length + 1)), 0, deferred);
    const flip = Math.random() < 0.5;
    setCurrentA(flip ? next : kept);
    setCurrentB(flip ? kept : next);
    setQueue(newQueue);
    setTotalRoundsEstimate((t) => t + 1);
    setActiveSlot("A");
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setCurrentA(prev.currentA);
    setCurrentB(prev.currentB);
    setQueue(prev.queue);
    setRound(prev.round);
    setActiveSlot(prev.activeSlot);
    setTotalRoundsEstimate(prev.totalRoundsEstimate);
    setHistory((h) => h.slice(0, -1));
  };

  if (!currentA || !currentB) return null;

  const progress = totalRoundsEstimate > 0 ? Math.min(((round - 1) / totalRoundsEstimate) * 100, 95) : 0;
  const labelA = blindMode ? "Instrument A" : currentA.maker;
  const nameA = blindMode ? "Listen carefully and decide" : currentA.name;
  const labelB = blindMode ? "Instrument B" : currentB.maker;
  const nameB = blindMode ? "Listen carefully and decide" : currentB.name;

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #78350f, #d97706)" }} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-stone-400 text-xs tracking-widest uppercase"
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.15em" }}>Round {round}</p>
          <h2 className="text-2xl text-stone-800 mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Which sounds better?
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBlindMode(!blindMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
              blindMode ? "bg-stone-900 text-white shadow-md" : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
            }`}
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {blindMode ? <EyeOff size={13} /> : <Eye size={13} />}Blind
          </button>
          {history.length > 0 && (
            <button onClick={handleUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
              style={{ fontFamily: "'Outfit', sans-serif" }}>
              <Undo2 size={13} />Undo
            </button>
          )}
          <button onClick={onBack}
            className="text-xs text-stone-400 hover:text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition"
            style={{ fontFamily: "'Outfit', sans-serif" }}>Start over</button>
        </div>
      </div>

      <DualPlayer instrumentA={currentA} instrumentB={currentB}
        activeSlot={activeSlot} onToggle={setActiveSlot} blindMode={blindMode} />

      <div className="grid grid-cols-2 gap-4 mt-8">
        {[
          { slot: "A", label: labelA, sublabel: nameA },
          { slot: "B", label: labelB, sublabel: nameB },
        ].map(({ slot, label, sublabel }) => (
          <button key={slot} onClick={() => handleChoose(slot)}
            className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
              activeSlot === slot
                ? "border-amber-700/30 bg-amber-50/50 hover:border-amber-700"
                : "border-stone-200 bg-white hover:border-stone-400"
            }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                activeSlot === slot ? "bg-amber-700 text-white" : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
              }`} style={{ fontFamily: "'Outfit', sans-serif" }}>{slot}</div>
              <div className="min-w-0">
                <div className="text-base font-semibold text-stone-800 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {label}
                </div>
                <div className="text-xs text-stone-400 mt-0.5 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {sublabel}
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-amber-800 opacity-0 group-hover:opacity-100 transition-opacity text-center"
              style={{ fontFamily: "'Outfit', sans-serif" }}>I prefer this one →</div>
          </button>
        ))}
      </div>

      <div className="text-center mt-5">
        <button onClick={handleNotSure}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 transition-all"
          style={{ fontFamily: "'Outfit', sans-serif" }}>
          <Shuffle size={14} />Not sure — skip and compare later
        </button>
      </div>

      <p className="text-center text-xs text-stone-400 mt-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Toggle between A and B to compare, then choose your favourite
        {blindMode && <span className="block mt-1 text-stone-500 font-medium">Blind mode — instrument names are hidden</span>}
      </p>
    </div>
  );
}

/* ─── WINNER STEP ─── */
function WinnerStep({ winner, onRestart }) {
  return (
    <div className="animate-fadeIn max-w-lg mx-auto text-center py-10">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 mb-6 animate-scaleIn">
        <Music2 size={32} className="text-amber-700" />
      </div>
      <p className="text-stone-400 text-sm tracking-widest uppercase mb-3"
        style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.15em" }}>Your favourite</p>
      <h2 className="text-3xl md:text-4xl text-stone-800 mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}>{winner.maker}</h2>
      <p className="text-stone-500 mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>{winner.name}</p>

      <div className="relative rounded-2xl overflow-hidden shadow-xl max-w-sm mx-auto mb-10">
        <img src={getThumbnail(winner)} alt={winner.name} className="w-full aspect-video object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="space-y-3">
        <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 shadow-lg hover:shadow-xl transition-all"
          style={{ fontFamily: "'Outfit', sans-serif" }}>
          Get in Touch<ChevronRight size={16} />
        </button>
        <br />
        <button onClick={onRestart}
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition"
          style={{ fontFamily: "'Outfit', sans-serif" }}>
          <Undo2 size={14} />Start over with different instruments
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function ListeningRoom() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("select");
  const [selectedIds, setSelectedIds] = useState([]);
  const [winner, setWinner] = useState(null);
  const [apiReady, setApiReady] = useState(false);

  // Load instruments from Supabase
  useEffect(() => {
    fetchInstruments()
      .then((data) => { setInstruments(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  // Load YouTube API
  useEffect(() => {
    if (window.YT?.Player) { setApiReady(true); return; }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    const check = setInterval(() => {
      if (window.YT?.Player) { setApiReady(true); clearInterval(check); }
    }, 100);
    window.onYouTubeIframeAPIReady = () => { setApiReady(true); clearInterval(check); };
    return () => clearInterval(check);
  }, []);

  const handleRestart = () => {
    setStep("select");
    setSelectedIds([]);
    setWinner(null);
  };

  const ready = !loading && !error && apiReady;

  return (
    <>
      {(loading || !apiReady) && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-500 mt-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Preparing the listening room...
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-red-600 text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Failed to load instruments: {error}
          </p>
          <button onClick={() => window.location.reload()}
            className="mt-3 text-sm text-stone-500 underline">Retry</button>
        </div>
      )}

      {ready && step === "select" && (
        <SelectionStep
          instruments={instruments}
          onProceed={(ids) => { setSelectedIds(ids); setStep("compare"); }}
        />
      )}

      {ready && step === "compare" && (
        <CompareStep
          instruments={selectedIds}
          allInstruments={instruments}
          onFinish={(w) => { setWinner(w); setStep("winner"); }}
          onBack={handleRestart}
        />
      )}

      {ready && step === "winner" && (
        <WinnerStep winner={winner} onRestart={handleRestart} />
      )}
    </>
  );
}
