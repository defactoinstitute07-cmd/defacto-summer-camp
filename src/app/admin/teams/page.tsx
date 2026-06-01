"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, adminFetchForm, useAdminAuth } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save, Users, Crown, ShieldAlert, ArrowRightLeft, UserCheck } from "lucide-react";

interface Player {
  _id: string;
  name: string;
  sport: string;
  team?: string;
  teamRef?: string;
  profileImageUrl?: string;
}

interface Team {
  _id: string;
  name: string;
  sport: string;
  captain?: Player | null;
  logoUrl?: string;
  color?: string;
}

function getContrastColor(hexColor: string) {
  if (!hexColor || !hexColor.startsWith("#")) return "#ffffff";
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return "#ffffff";
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function TeamsPage() {
  const { admin } = useAdminAuth();
  const [sports, setSports] = useState<string[]>([]);
  const [selectedSport, setSelectedSport] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Modals / Drawer State
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form, setForm] = useState({ name: "", sport: "", color: "#0B1C4A" });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Roster Manager Drawer State
  const [showRoster, setShowRoster] = useState(false);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState("");
  const [rosterLoading, setRosterLoading] = useState(false);

  // Load sports list
  useEffect(() => {
    adminFetch("/games")
      .then((d) => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          let names: string[] = d.data.map((g: any) => g.name as string);
          if (admin?.role === "admin") {
            names = names.filter((n: string) =>
              admin.sportsPermissions?.some(sp => sp.toLowerCase() === n.toLowerCase())
            );
          }
          setSports(names);
          if (names.length > 0) {
            setSelectedSport(names[0]);
          }
        }
      })
      .catch((err) => console.warn("Failed to load sports list:", err));
  }, [admin]);

  // Load teams when selected sport changes
  const loadTeams = () => {
    if (!selectedSport) return;
    setLoading(true);
    adminFetch(`/teams?sport=${encodeURIComponent(selectedSport)}`)
      .then((d) => {
        if (d.success) setTeams(d.data);
      })
      .catch((err) => console.warn("Failed to load teams:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeams();
  }, [selectedSport]);

  const openNew = () => {
    setEditingTeam(null);
    setForm({ name: "", sport: selectedSport, color: "#0B1C4A" });
    setLogoFile(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (t: Team) => {
    setEditingTeam(t);
    setForm({ name: t.name, sport: t.sport, color: t.color || "#0B1C4A" });
    setLogoFile(null);
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
      fd.append("sport", form.sport);
      fd.append("color", form.color);
      if (logoFile) fd.append("logo", logoFile);

      if (editingTeam) {
        await adminFetchForm(`/teams/${editingTeam._id}`, fd, "PUT");
      } else {
        await adminFetchForm("/teams", fd, "POST");
      }
      setShowForm(false);
      loadTeams();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team? All assigned players will be unlinked.")) return;
    try {
      await adminFetch(`/teams/${id}`, { method: "DELETE" });
      loadTeams();
    } catch (err: any) {
      alert(err.message || "Failed to delete team.");
    }
  };

  // Roster Management Logic
  const openRoster = (team: Team) => {
    setActiveTeam(team);
    setShowRoster(true);
    loadRosterData(team);
  };

  const loadRosterData = async (team: Team) => {
    setRosterLoading(true);
    try {
      // 1. Load team roster
      const rosterRes = await adminFetch(`/teams/${team._id}/roster`);
      if (rosterRes.success) setRoster(rosterRes.data);

      // 2. Load all players of this sport to find unassigned pool
      const playersRes = await adminFetch(`/players?sport=${encodeURIComponent(team.sport)}&limit=200`);
      if (playersRes.success && Array.isArray(playersRes.data)) {
        // Filter players who aren't in this team, and optionally who have NO team assigned
        const pool = playersRes.data.filter(
          (p: Player) => !p.teamRef || p.teamRef === ""
        );
        setAvailablePlayers(pool);
        if (pool.length > 0) setSelectedPlayerToAdd(pool[0]._id);
        else setSelectedPlayerToAdd("");
      }
    } catch (err) {
      console.warn("Failed to load roster data:", err);
    } finally {
      setRosterLoading(false);
    }
  };

  const addPlayer = async () => {
    if (!activeTeam || !selectedPlayerToAdd) return;
    try {
      await adminFetch(`/teams/${activeTeam._id}/players`, {
        method: "POST",
        body: JSON.stringify({ playerId: selectedPlayerToAdd }),
      });
      loadRosterData(activeTeam);
      loadTeams(); // To update captain dropdowns if necessary
    } catch (err: any) {
      alert(err.message || "Failed to add player.");
    }
  };

  const removePlayer = async (playerId: string) => {
    if (!activeTeam) return;
    if (!confirm("Remove this player from the team?")) return;
    try {
      await adminFetch(`/teams/${activeTeam._id}/players/${playerId}`, {
        method: "DELETE",
      });
      loadRosterData(activeTeam);
      loadTeams();
    } catch (err: any) {
      alert(err.message || "Failed to remove player.");
    }
  };

  const assignCaptain = async (playerId: string) => {
    if (!activeTeam) return;
    try {
      await adminFetch(`/teams/${activeTeam._id}`, {
        method: "PUT",
        body: JSON.stringify({ captain: playerId }),
      });
      // Update active team captain display locally
      const updated = { ...activeTeam };
      const cap = roster.find(r => r._id === playerId);
      if (cap) updated.captain = cap;
      setActiveTeam(updated);
      loadTeams();
    } catch (err: any) {
      alert(err.message || "Failed to set captain.");
    }
  };

  const transferPlayer = async (playerId: string, targetTeamId: string) => {
    if (!activeTeam || !targetTeamId) return;
    try {
      await adminFetch(`/teams/${targetTeamId}/players`, {
        method: "POST",
        body: JSON.stringify({ playerId }),
      });
      loadRosterData(activeTeam);
      loadTeams();
    } catch (err: any) {
      alert(err.message || "Failed to transfer player.");
    }
  };

  if (sports.length === 0 && !loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm">
        <p className="text-slate-500 text-sm font-semibold">No sports assigned to your administrator account. Please contact the Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header filter & add buttons */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <label className="text-slate-500 font-bold text-xs uppercase tracking-wider">Sport:</label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none appearance-none"
          >
            {sports.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md shadow-[#E60000]/10 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Team
        </button>
      </div>

      {/* Grid of Teams */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between h-48 w-full shadow-sm">
              <div className="flex items-center gap-4">
                <div className="animate-shimmer w-16 h-16 rounded-xl bg-slate-200 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="animate-shimmer h-5 w-3/4 rounded bg-slate-200" />
                  <div className="animate-shimmer h-4 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
              <div className="animate-shimmer h-9 w-full rounded-xl bg-slate-200 mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t) => (
            <div
              key={t._id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-xl bg-slate-100 border-2 flex items-center justify-center overflow-hidden relative flex-shrink-0"
                    style={{ borderColor: t.color || "#0B1C4A" }}
                  >
                    {t.logoUrl ? (
                      <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-slate-400" />
                    )}
                    {/* Color badge tag */}
                    <div
                      className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: t.color || "#0B1C4A" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-bold text-lg uppercase tracking-wide">{t.name}</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase mt-0.5">{t.sport}</p>
                  </div>
                </div>

                {/* Captain details */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" /> Captain
                  </span>
                  <span className="text-slate-700 text-sm font-semibold">
                    {t.captain ? t.captain.name : "None assigned"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-slate-100 pt-4 items-center">
                <button
                  onClick={() => openRoster(t)}
                  className="flex-1 h-11 sm:h-9 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-amber-500" /> Roster
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200 cursor-pointer flex-shrink-0"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all border border-red-200 cursor-pointer flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {teams.length === 0 && (
            <p className="col-span-full text-center text-slate-400 py-16">
              No teams created for {selectedSport} yet.
            </p>
          )}
        </div>
      )}

      {/* Create / Edit Team Modal */}
      {showForm && (
        <Modal title={editingTeam ? "Edit Team" : "Create Team"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                Team Name *
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000]"
                placeholder="e.g. Warriors"
              />
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                Sport
              </label>
              <select
                value={form.sport}
                onChange={(e) => setForm((p) => ({ ...p, sport: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000] appearance-none"
              >
                {sports.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">
                Team Color *
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  className="w-12 h-12 bg-white border border-slate-200 rounded-xl cursor-pointer p-1"
                />
                <input
                  type="text"
                  required
                  value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  placeholder="#0B1C4A"
                  className="w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000] font-mono"
                />
                <div
                  className="flex-1 h-12 rounded-xl border border-slate-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all"
                  style={{ backgroundColor: form.color, color: getContrastColor(form.color) }}
                >
                  Preview
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                Upload Team Logo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full text-slate-700 text-xs bg-white border border-slate-200 rounded-xl p-3 file:mr-4 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-red-500/10"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" />Save Team</>}
            </button>
          </form>
        </Modal>
      )}

      {/* Roster Manager Drawer/Modal */}
      {showRoster && activeTeam && (
        <Modal
          title={`Roster Manager: ${activeTeam.name}`}
          onClose={() => {
            setShowRoster(false);
            loadTeams();
          }}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Quick pool overview */}
            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <Users className="w-6 h-6 text-amber-500" />
              <div>
                <p className="text-slate-800 font-bold text-sm">Roster Size: {roster.length} Players</p>
                <p className="text-slate-500 text-xs">Assign players and set the team captain below.</p>
              </div>
            </div>

            {/* Roster list */}
            <div>
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Current Members</h4>
              {rosterLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <div className="flex items-center gap-3 w-full">
                        <div className="animate-shimmer w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                        <div className="animate-shimmer h-4 w-32 rounded bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {roster.map((p) => {
                    const isCaptain = activeTeam.captain?._id === p._id;
                    return (
                      <div
                        key={p._id}
                        className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden relative flex-shrink-0">
                            {p.profileImageUrl ? (
                              <img src={p.profileImageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserCheck className="w-5 h-5 text-slate-400 absolute inset-0 m-auto" />
                            )}
                          </div>
                          <div>
                            <p className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                              {p.name}
                              {isCaptain && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                            </p>
                          </div>
                        </div>

                        {/* Roster member actions */}
                        <div className="flex items-center gap-2">
                          {/* Captain setting */}
                          {!isCaptain && (
                            <button
                              onClick={() => assignCaptain(p._id)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-lg text-xs font-bold transition-colors"
                              title="Assign as Captain"
                            >
                              Captain
                            </button>
                          )}

                          {/* Transfer action */}
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                transferPlayer(p._id, e.target.value);
                                e.target.value = "";
                              }
                            }}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="">Transfer...</option>
                            {teams
                              .filter((t) => t._id !== activeTeam._id)
                              .map((t) => (
                                <option key={t._id} value={t._id}>
                                  To {t.name}
                                </option>
                              ))}
                          </select>

                          {/* Remove button */}
                          <button
                            onClick={() => removePlayer(p._id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-lg transition-colors"
                            title="Remove from Team"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {roster.length === 0 && (
                    <p className="text-slate-400 text-xs py-4 text-center">No players assigned to this roster yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Add Player to Team section */}
            <div className="border-t border-slate-100 pt-5">
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Add Player to Team</h4>
              {availablePlayers.length > 0 ? (
                <div className="flex gap-3">
                  <select
                    value={selectedPlayerToAdd}
                    onChange={(e) => setSelectedPlayerToAdd(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000]"
                  >
                    {availablePlayers.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addPlayer}
                    className="px-5 py-3 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  No unassigned players found for this sport. Create or add players first under the Players tab.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  maxWidth = "max-w-md",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white border border-slate-100 rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-800 font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
