import { useState, useEffect } from "react";
import { supabase, fetchAllInstruments, upsertInstrument, deleteInstrument, getThumbnail } from "../lib/supabase";
import { LogOut, Plus, Trash2, GripVertical, Eye, EyeOff, Save, X, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";

const F = { fontFamily: "'Outfit', sans-serif" };

/* ─── LOGIN ─── */
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto py-20">
      <h2 className="text-2xl text-stone-800 mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
        Admin Login
      </h2>
      <p className="text-sm text-stone-500 text-center mb-8" style={F}>
        Sign in to manage instruments
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email" required
          className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-700/40 focus:ring-2 focus:ring-amber-700/10"
          style={F}
        />
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" required
          className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-700/40 focus:ring-2 focus:ring-amber-700/10"
          style={F}
        />
        {error && <p className="text-red-600 text-xs" style={F}>{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition disabled:opacity-50"
          style={F}
        >{loading ? "Signing in..." : "Sign In"}</button>
      </form>
    </div>
  );
}

/* ─── INSTRUMENT FORM ─── */
function InstrumentForm({ instrument, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "", maker: "", year: "", youtube_url: "", thumbnail_url: "",
    tags: [], sort_order: 0, enabled: true,
    ...instrument,
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      set("tags", [...form.tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag) => set("tags", form.tags.filter((t) => t !== tag));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.id) delete payload.id; // let Supabase generate for new
      if (!payload.thumbnail_url) payload.thumbnail_url = null;
      await onSave(payload);
    } catch (e) {
      alert("Error saving: " + e.message);
    }
    setSaving(false);
  };

  const thumb = getThumbnail(form);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-stone-800" style={F}>
          {instrument?.id ? "Edit Instrument" : "Add New Instrument"}
        </h3>
        <button onClick={onCancel} className="p-2 hover:bg-stone-100 rounded-lg text-stone-400"><X size={18} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1" style={F}>Maker *</label>
          <input value={form.maker} onChange={(e) => set("maker", e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700/40" style={F} />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1" style={F}>Year</label>
          <input value={form.year} onChange={(e) => set("year", e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700/40" style={F} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-stone-500 mb-1" style={F}>Full Name *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700/40" style={F} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-stone-500 mb-1" style={F}>YouTube URL *</label>
          <input value={form.youtube_url} onChange={(e) => set("youtube_url", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700/40" style={F} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-stone-500 mb-1" style={F}>
            Custom Thumbnail URL <span className="text-stone-400">(optional — overrides YouTube thumbnail)</span>
          </label>
          <input value={form.thumbnail_url || ""} onChange={(e) => set("thumbnail_url", e.target.value)}
            placeholder="https://example.com/my-thumbnail.jpg"
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700/40" style={F} />
        </div>

        {/* Preview */}
        {thumb && (
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-stone-500 mb-1" style={F}>Thumbnail Preview</label>
            <img src={thumb} alt="Preview" className="w-40 h-24 object-cover rounded-lg border border-stone-200" />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1" style={F}>Sort Order</label>
          <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700/40" style={F} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)}
              className="w-4 h-4 rounded accent-amber-700" />
            <span className="text-sm text-stone-700" style={F}>Enabled (visible to users)</span>
          </label>
        </div>

        {/* Tags */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-stone-500 mb-1" style={F}>Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(form.tags || []).map((tag) => (
              <span key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-xs capitalize"
                style={F}>
                {tag}
                <button onClick={() => removeTag(tag)} className="text-stone-400 hover:text-red-500">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add a tag and press Enter"
              className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700/40" style={F} />
            <button onClick={addTag}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium text-stone-600 transition"
              style={F}>Add</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
        <button onClick={onCancel}
          className="px-4 py-2 text-sm text-stone-500 hover:bg-stone-100 rounded-lg transition" style={F}>Cancel</button>
        <button onClick={handleSave} disabled={saving || !form.name || !form.maker || !form.youtube_url}
          className="inline-flex items-center gap-2 px-5 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition disabled:opacity-50"
          style={F}>
          <Save size={14} />{saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

/* ─── ADMIN DASHBOARD ─── */
function Dashboard({ onLogout }) {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | instrument object
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllInstruments();
      setInstruments(data);
    } catch (e) {
      alert("Error loading: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (payload) => {
    await upsertInstrument(payload);
    setEditing(null);
    await load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this instrument?")) return;
    await deleteInstrument(id);
    setDeleting(null);
    await load();
  };

  const handleToggleEnabled = async (inst) => {
    await upsertInstrument({ id: inst.id, enabled: !inst.enabled });
    await load();
  };

  const handleMoveUp = async (inst, idx) => {
    if (idx === 0) return;
    const prev = instruments[idx - 1];
    await upsertInstrument({ id: inst.id, sort_order: prev.sort_order });
    await upsertInstrument({ id: prev.id, sort_order: inst.sort_order });
    await load();
  };

  const handleMoveDown = async (inst, idx) => {
    if (idx === instruments.length - 1) return;
    const next = instruments[idx + 1];
    await upsertInstrument({ id: inst.id, sort_order: next.sort_order });
    await upsertInstrument({ id: next.id, sort_order: inst.sort_order });
    await load();
  };

  if (editing) {
    return (
      <InstrumentForm
        instrument={editing === "new" ? null : editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-stone-800" style={F}>
            Instruments ({instruments.length})
          </h2>
          <p className="text-xs text-stone-400 mt-0.5" style={F}>
            {instruments.filter((i) => i.enabled).length} enabled, {instruments.filter((i) => !i.enabled).length} disabled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing("new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition"
            style={F}>
            <Plus size={14} />Add Instrument
          </button>
          <button onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            style={F}>
            <LogOut size={14} />Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : instruments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-400" style={F}>No instruments yet. Add your first one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="text-left text-xs font-medium text-stone-500 py-3 px-4" style={F}>Order</th>
                <th className="text-left text-xs font-medium text-stone-500 py-3 px-4" style={F}>Instrument</th>
                <th className="text-left text-xs font-medium text-stone-500 py-3 px-4 hidden md:table-cell" style={F}>Tags</th>
                <th className="text-center text-xs font-medium text-stone-500 py-3 px-4" style={F}>Status</th>
                <th className="text-right text-xs font-medium text-stone-500 py-3 px-4" style={F}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {instruments.map((inst, idx) => (
                <tr key={inst.id} className={`border-b border-stone-50 hover:bg-stone-50/50 transition ${!inst.enabled ? "opacity-50" : ""}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-400 w-6 text-center" style={F}>{inst.sort_order}</span>
                      <div className="flex flex-col">
                        <button onClick={() => handleMoveUp(inst, idx)} disabled={idx === 0}
                          className="text-stone-400 hover:text-stone-600 disabled:opacity-20"><ChevronUp size={12} /></button>
                        <button onClick={() => handleMoveDown(inst, idx)} disabled={idx === instruments.length - 1}
                          className="text-stone-400 hover:text-stone-600 disabled:opacity-20"><ChevronDown size={12} /></button>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={getThumbnail(inst)} alt="" className="w-14 h-9 object-cover rounded-md flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-stone-800 truncate" style={F}>{inst.maker}</div>
                        <div className="text-xs text-stone-400 truncate" style={F}>{inst.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(inst.tags || []).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded-full capitalize">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => handleToggleEnabled(inst)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
                        inst.enabled ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
                      }`} style={F}>
                      {inst.enabled ? <Eye size={11} /> : <EyeOff size={11} />}
                      {inst.enabled ? "Live" : "Hidden"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditing(inst)}
                        className="px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 rounded-md transition" style={F}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(inst.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── ADMIN PAGE ─── */
export default function Admin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <LoginForm />;
  return <Dashboard onLogout={handleLogout} />;
}
