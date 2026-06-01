"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, adminFetchForm } from "../context/AdminAuthContext";
import { Upload, Trash2, X } from "lucide-react";

const CATS = ["general","match","ceremony","activity","training","winners"];
interface GalleryItem { _id: string; imageUrl: string; title: string; category: string; createdAt: string; }

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadCat, setUploadCat] = useState("general");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const load = () => adminFetch("/gallery?limit=100").then(d => setItems(d.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = category === "all" ? items : items.filter(i => i.category === category);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("category", uploadCat);
      if (files.length === 1) {
        fd.append("image", files[0]);
        await adminFetchForm("/gallery", fd);
      } else {
        Array.from(files).forEach(f => fd.append("images", f));
        await adminFetchForm("/gallery/bulk", fd);
      }
      setFiles(null);
      (document.getElementById("gallery-input") as HTMLInputElement).value = "";
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Upload failed"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image from gallery and Cloudinary?")) return;
    await adminFetch(`/gallery/${id}`, { method:"DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <h3 className="text-[#0B1C4A] font-bold mb-4 flex items-center gap-2"><Upload className="w-4 h-4 text-amber-500" /> Upload Photos</h3>
        <form onSubmit={handleUpload} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-slate-500 text-xs font-bold uppercase mb-1.5">Category</label>
            <select value={uploadCat} onChange={e=>setUploadCat(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none appearance-none">
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-slate-500 text-xs font-bold uppercase mb-1.5">Images (select multiple)</label>
            <input id="gallery-input" type="file" accept="image/*" multiple onChange={e=>setFiles(e.target.files)}
              className="w-full text-slate-500 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-[#E60000] file:font-bold file:text-xs hover:file:bg-red-100 cursor-pointer" />
          </div>
          <button type="submit" disabled={uploading || !files?.length}
            className="px-5 py-2.5 bg-[#E60000] hover:bg-red-700 disabled:opacity-40 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors shadow-md shadow-[#E60000]/10">
            {uploading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <><Upload className="w-4 h-4"/>Upload</>}
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-3 font-semibold">{error}</p>}
        {files && <p className="text-slate-500 text-xs mt-2">{files.length} file(s) selected</p>}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all",...CATS].map(c=>(
          <button key={c} onClick={()=>setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${category===c?"bg-[#E60000] text-white shadow-sm shadow-[#E60000]/10":"bg-white text-slate-600 hover:text-slate-900 border border-slate-200"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item._id} className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 aspect-square">
              <img src={item.imageUrl} alt={item.title || item.category} className="w-full h-full object-cover border-b border-slate-100" loading="lazy" onClick={()=>setPreview(item.imageUrl)} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                <button onClick={()=>handleDelete(item._id)}
                  className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors shadow-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                <span className="text-white/80 text-xs font-bold uppercase">{item.category}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center text-slate-400 py-12">No images in this category.</p>}
        </div>
      )}

      {/* Lightbox */}
      {preview && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setPreview(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white"><X className="w-8 h-8" /></button>
          <img src={preview} className="max-w-full max-h-full rounded-2xl object-contain border border-white/10" onClick={e=>e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function Spinner() { return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin" /></div>; }
