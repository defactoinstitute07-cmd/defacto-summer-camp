"use client";
import React, { useEffect, useState } from "react";
import { adminFetch } from "../context/AdminAuthContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useRouter } from "next/navigation";
import {
  UserCheck, Shield, Ban, CheckCircle, Trash2, KeyRound, Pencil, X, Save,
  Gamepad2, Phone, User, Check
} from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";

interface AdminUser {
  _id: string;
  fullName?: string;
  username?: string;
  email?: string;
  mobileNumber?: string;
  role: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  sportsPermissions: string[];
}

const statusColors = {
  pending: "bg-yellow-50 border-yellow-200 text-yellow-700",
  approved: "bg-green-50 border-green-200 text-green-700",
  suspended: "bg-orange-50 border-orange-200 text-orange-700",
  rejected: "bg-slate-100 border-slate-200 text-slate-600",
};

export default function AdminsManagementPage() {
  const { admin: currentAdmin, refreshAdminData } = useAdminAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [resettingUser, setResettingUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "",
    email: "",
    mobileNumber: "",
    status: "pending" as AdminUser["status"],
    sportsPermissions: [] as string[],
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (currentAdmin && currentAdmin.role !== "superadmin") {
      router.replace("/admin");
    }
  }, [currentAdmin, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, gamesRes] = await Promise.all([
        adminFetch("/auth/admins"),
        adminFetch("/games")
      ]);
      
      if (adminsRes.success) {
        setUsers(adminsRes.data);
      }
      if (gamesRes.success && Array.isArray(gamesRes.data)) {
        setSports(gamesRes.data.map((g: any) => g.name));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load management details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      mobileNumber: user.mobileNumber || "",
      status: user.status,
      sportsPermissions: user.sportsPermissions || [],
    });
    setError("");
    setSuccessMsg("");
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      await adminFetch(`/auth/admins/${editingUser._id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      setEditingUser(null);
      setSuccessMsg("User updated successfully.");
      if (editingUser._id === currentAdmin?._id) {
        await refreshAdminData();
      }
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const openReset = (user: AdminUser) => {
    setResettingUser(user);
    setNewPassword("");
    setError("");
    setSuccessMsg("");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      await adminFetch(`/auth/admins/${resettingUser._id}/reset-password`, {
        method: "PUT",
        body: JSON.stringify({ password: newPassword }),
      });
      setResettingUser(null);
      setSuccessMsg("Password reset successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to delete this Game Admin? This action cannot be undone.")) return;
    setError("");
    setSuccessMsg("");

    try {
      await adminFetch(`/auth/admins/${id}`, { method: "DELETE" });
      setSuccessMsg("User account deleted.");
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete account.");
    }
  };

  const handleStatusChange = async (user: AdminUser, newStatus: AdminUser["status"]) => {
    setError("");
    setSuccessMsg("");
    try {
      await adminFetch(`/auth/admins/${user._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setSuccessMsg(`User status updated to ${newStatus}.`);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    }
  };

  const toggleSportPermission = (sport: string) => {
    const list = [...editForm.sportsPermissions];
    const index = list.indexOf(sport);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(sport);
    }
    setEditForm(p => ({ ...p, sportsPermissions: list }));
  };

  return (
    <div className="space-y-6">
      
      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <Ban className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Cards list or Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-slate-800 font-bold text-sm uppercase tracking-wider">
            Game Administrator Registration Requests
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Manage registrations, approve/reject access, and assign sports permissions
          </p>
        </div>

        {loading ? (
          <div className="p-6">
            <TableSkeleton cols={5} rows={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Sport Permissions</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black border border-slate-200/50 shadow-sm flex-shrink-0">
                          {(u.fullName || u.username || "?")?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-800 font-bold flex items-center gap-1.5">
                            {u.fullName || u.username || "N/A"}
                            {u._id === currentAdmin?._id && (
                              <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 text-[9px] font-black rounded-md tracking-wider uppercase">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5 flex flex-col gap-0.5">
                            <span>Role: {u.role}</span>
                            {u.username && u.fullName && (
                              <span className="text-[10px] text-slate-400">Username: {u.username}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs text-slate-500 font-semibold">
                        {u.mobileNumber && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {u.mobileNumber}
                          </p>
                        )}
                        {u.email && (
                          <p className="text-slate-400 font-mono">
                            {u.email}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide capitalize ${statusColors[u.status]}`}>
                        {u.status}
                      </span>
                    </td>

                    {/* Permissions */}
                    <td className="px-6 py-4 max-w-xs">
                      {u.sportsPermissions && u.sportsPermissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {u.sportsPermissions.map(sport => (
                            <span key={sport} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#0B1C4A]/5 border border-slate-200 text-[#0B1C4A] text-[10px] font-bold uppercase rounded-lg">
                              <Gamepad2 className="w-3 h-3 text-[#E60000]" />
                              {sport}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">No assigned sports</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Quick Approvals (only for other users) */}
                        {u._id !== currentAdmin?._id && (
                          <>
                            {u.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(u, "approved")}
                                  title="Approve User"
                                  className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl border border-green-200/50 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(u, "rejected")}
                                  title="Reject User"
                                  className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl border border-red-200/20 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {u.status === "approved" && (
                              <button
                                onClick={() => handleStatusChange(u, "suspended")}
                                title="Suspend User"
                                className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl border border-orange-200/20 transition-colors"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}

                            {u.status === "suspended" && (
                              <button
                                onClick={() => handleStatusChange(u, "approved")}
                                title="Unsuspend (Approve)"
                                className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl border border-green-200/50 transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}

                        <span className="w-px h-6 bg-slate-200 mx-1" />

                        {/* Edit details */}
                        <button
                          onClick={() => openEdit(u)}
                          title="Edit User Details"
                          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200/50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Reset password */}
                        <button
                          onClick={() => openReset(u)}
                          title="Reset User Password"
                          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl border border-amber-200/50 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Delete account */}
                        {u._id !== currentAdmin?._id ? (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            title="Delete User"
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl border border-red-200/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            title="You cannot delete your own account"
                            className="p-2 bg-slate-50 text-slate-300 rounded-xl border border-slate-200/50 cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold">
                      No registrants or game admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-slate-800 font-bold">
                {editingUser._id === currentAdmin?._id ? "Edit Your Profile Settings" : "Edit Game Admin Settings"}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000]/60 focus:ring-1 focus:ring-[#E60000]/20"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Username (only if Superadmin or if they already have a username) */}
              {(editingUser.role === "superadmin" || editingUser.username) && (
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      required={editingUser.role === "superadmin"}
                      value={editForm.username}
                      onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000]/60 focus:ring-1 focus:ring-[#E60000]/20"
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}

              {/* Email (only if Superadmin or if they already have an email) */}
              {(editingUser.role === "superadmin" || editingUser.email) && (
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required={editingUser.role === "superadmin"}
                      value={editForm.email}
                      onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000]/60 focus:ring-1 focus:ring-[#E60000]/20"
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}

              {/* Mobile Number */}
              <div>
                <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={editForm.mobileNumber}
                    onChange={e => setEditForm(p => ({ ...p, mobileNumber: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000]/60 focus:ring-1 focus:ring-[#E60000]/20"
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Workflow Status</label>
                <select
                  value={editForm.status}
                  disabled={editingUser._id === currentAdmin?._id}
                  onChange={e => setEditForm(p => ({ ...p, status: e.target.value as AdminUser["status"] }))}
                  className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000]/60 ${
                    editingUser._id === currentAdmin?._id ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved / Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
                {editingUser._id === currentAdmin?._id && (
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                    You cannot change your own status.
                  </p>
                )}
              </div>

              {/* Sports Permissions */}
              {editingUser.role === "superadmin" ? (
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-2">Sports Permissions</label>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500 font-semibold">
                    Super Admins have full access to all sports, matches, and dashboard statistics.
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-2">Sports Permissions</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-4 max-h-44 overflow-y-auto">
                    {sports.map(sport => {
                      const hasPerm = editForm.sportsPermissions.includes(sport);
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleSportPermission(sport)}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold uppercase border transition-all text-left ${
                            hasPerm
                              ? "bg-[#0B1C4A] text-white border-transparent shadow-sm"
                              : "bg-white text-slate-500 border-slate-200/70 hover:bg-slate-100/50"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            hasPerm ? "bg-[#E60000] border-transparent" : "border-slate-300 bg-white"
                          }`}>
                            {hasPerm && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                          </span>
                          <span className="truncate">{sport}</span>
                        </button>
                      );
                    })}
                    {sports.length === 0 && (
                      <p className="text-slate-400 text-xs py-2 col-span-2 text-center">No sports listed in MongoDB.</p>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">
                    Approved Game Admins can update match scores ONLY for the assigned sports selected above
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm mt-6"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save User Settings
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-slate-800 font-bold">Reset User Password</h3>
              <button onClick={() => setResettingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                Set a new password for <strong className="text-slate-800">{resettingUser.fullName}</strong> below:
              </p>
              
              <div>
                <label className="block text-slate-500 text-xs font-bold uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000]/60 focus:ring-1 focus:ring-[#E60000]/20"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm mt-4"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> Reset Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
