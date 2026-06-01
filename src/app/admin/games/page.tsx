"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, adminFetchForm } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save, Gamepad2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ICONS = ["Award", "Music", "Volleyball", "Flame", "Palette", "Users", "Smile", "Trophy", "Target", "Compass"];
const STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

interface Game {
  _id: string;
  name: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  iconName: string;
  imageSrc: string;
  order: number;
}

interface FormState {
  name: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  iconName: string;
  order: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  status: "upcoming",
  iconName: "Gamepad2",
  order: "0",
};

export default function GamesPage() {
  const [items, setItems] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    adminFetch("/games")
      .then((d) => setItems(d.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items
    .filter((g) => statusFilter === "all" || g.status === statusFilter)
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (g: Game) => {
    setEditing(g);
    setForm({
      name: g.name,
      description: g.description,
      status: g.status,
      iconName: g.iconName,
      order: String(g.order),
    });
    setImageFile(null);
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("status", form.status);
      fd.append("iconName", form.iconName);
      fd.append("order", form.order);

      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (editing) {
        await adminFetchForm(`/games/${editing._id}`, fd, "PUT");
      } else {
        await adminFetchForm("/games", fd, "POST");
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this game? This will also remove any banner image.")) return;
    try {
      await adminFetch(`/games/${id}`, { method: "DELETE" });
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting game");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-100">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games..."
            className="flex-1 max-w-xs px-4 py-2 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000]"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button
          onClick={openNew}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md shadow-red-600/10 hover:shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Game
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white border border-slate-200/80 shadow-sm shadow-slate-100 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-4">Game</th>
                <th className="text-left px-6 py-4">Description</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Order</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((g) => (
                <tr key={g._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {g.imageSrc ? (
                        <img
                          src={g.imageSrc}
                          alt={g.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#E60000]/10 flex items-center justify-center text-[#E60000] border border-[#E60000]/10">
                          <Gamepad2 className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span className="text-slate-800 font-bold block">{g.name}</span>
                        <span className="text-slate-400 text-xs font-medium">Icon: {g.iconName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-slate-500 text-xs">{g.description}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${
                        g.status === "ongoing"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : g.status === "upcoming"
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-semibold text-xs">{g.order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(g)}
                        className="p-2 border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all duration-200 shadow-sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(g._id)}
                        className="p-2 border border-red-100 hover:border-red-200 bg-white hover:bg-red-50 text-red-500 rounded-xl transition-all duration-200 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 font-medium py-12">
                    No games found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <Modal title={editing ? "Edit Game Details" : "Add New Game"} onClose={() => setShowForm(false)}>
            <form onSubmit={handleSave} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="font-medium">{error}</p>
                </div>
              )}
              <F label="Game Name *">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={inp}
                  placeholder="e.g. Volleyball, Chess"
                />
              </F>
              <F label="Description *">
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className={`${inp} resize-none`}
                  placeholder="A short description of the rules, goals, or instructions..."
                />
              </F>
              <div className="grid grid-cols-2 gap-4">
                <F label="Status">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        status: e.target.value as "upcoming" | "ongoing" | "completed",
                      }))
                    }
                    className={`${inp} appearance-none`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </F>
                <F label="Sort Order">
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                    className={inp}
                  />
                </F>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <F label="Fallback Icon (If no image)">
                  <select
                    value={form.iconName}
                    onChange={(e) => setForm((p) => ({ ...p, iconName: e.target.value }))}
                    className={`${inp} appearance-none`}
                  >
                    {ICONS.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </F>
              </div>
              <F label="Banner Photo / Image (Cloudinary)">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-500 text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-[#E60000]/10 file:text-[#E60000] file:font-bold file:text-xs hover:file:bg-[#E60000]/20 cursor-pointer"
                />
              </F>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-md shadow-red-600/10 hover:shadow-lg active:scale-95 mt-6"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Game
                  </>
                )}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-slate-800 font-black text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">{children}</div>
      </motion.div>
    </div>
  );
}

const inp =
  "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000] focus:bg-white focus:ring-1 focus:ring-[#E60000] placeholder-slate-400 transition-all duration-200";

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
