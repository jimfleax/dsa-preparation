import { useState, useEffect } from "react";
import BaseModal from "../BaseModal";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { Plus, ChevronRight, ChevronLeft, Trash2, Loader2, ListTree } from "lucide-react";

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trackJson: any) => Promise<void>;
  initialData?: any;
}

export default function TrackModal({ isOpen, onClose, onSubmit, initialData }: TrackModalProps) {
  const { adminToken } = useAdminAuth();
  
  // Phase 1 State
  const [phase, setPhase] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Phase 2 State
  const [problems, setProblems] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inner modal states
  const [addProblemTarget, setAddProblemTarget] = useState<number | 'root' | null>(null);
  const [problemUrl, setProblemUrl] = useState("");
  const [isFetchingProblem, setIsFetchingProblem] = useState(false);
  const [problemPreview, setProblemPreview] = useState<any>(null);

  const [addSubtrackOpen, setAddSubtrackOpen] = useState(false);
  const [subtrackTitle, setSubtrackTitle] = useState("");
  const [subtrackDescription, setSubtrackDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        
        // Clean up _id fields and populate
        const cleanProblems = (initialData.problems || []).map((p: any) => {
          const { _id, ...rest } = p;
          return rest;
        });
        
        const cleanParts = (initialData.parts || []).map((part: any) => {
          const { _id, ...restPart } = part;
          if (restPart.problems) {
            restPart.problems = restPart.problems.map((p: any) => {
              const { _id, ...restP } = p;
              return restP;
            });
          }
          return restPart;
        });
        
        setProblems(cleanProblems);
        setParts(cleanParts);
      } else {
        setTitle("");
        setDescription("");
        setProblems([]);
        setParts([]);
      }
      setPhase(1);
      setError("");
      setAddProblemTarget(null);
      setAddSubtrackOpen(false);
    }
  }, [isOpen, initialData]);

  const handleNextPhase = () => {
    if (!title.trim()) {
      setError("Track title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Track description is required.");
      return;
    }
    setError("");
    setPhase(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await onSubmit({
        title,
        description,
        problems,
        parts
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save track. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subtrack Management
  const handleAddSubtrack = () => {
    if (!subtrackTitle.trim()) return;
    setParts([...parts, { title: subtrackTitle, description: subtrackDescription, problems: [] }]);
    setAddSubtrackOpen(false);
    setSubtrackTitle("");
    setSubtrackDescription("");
  };

  const removeSubtrack = (index: number) => {
    const newParts = [...parts];
    newParts.splice(index, 1);
    setParts(newParts);
  };

  const removeProblem = (partIndex: number | 'root', problemIndex: number) => {
    if (partIndex === 'root') {
      const newProbs = [...problems];
      newProbs.splice(problemIndex, 1);
      setProblems(newProbs);
    } else {
      const newParts = [...parts];
      newParts[partIndex].problems.splice(problemIndex, 1);
      setParts(newParts);
    }
  };

  // Problem Scraping
  const handleUrlChange = async (url: string) => {
    setProblemUrl(url);
    setProblemPreview(null);
    setError("");

    const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    if (!match) return;

    const slug = match[1].toLowerCase();
    setIsFetchingProblem(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/problems/scrape-title`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success && data.title) {
        setProblemPreview({
          title: data.title,
          titleSlug: slug,
          difficulty: data.difficulty || "Medium",
          url: url.trim()
        });
      } else {
        // Fallback
        setProblemPreview({
          title: slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          titleSlug: slug,
          difficulty: "Medium",
          url: url.trim()
        });
      }
    } catch (err) {
      setProblemPreview({
        title: slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        titleSlug: slug,
        difficulty: "Medium",
        url: url.trim()
      });
    } finally {
      setIsFetchingProblem(false);
    }
  };

  const handleAddProblemSubmit = () => {
    if (!problemPreview) return;
    
    if (addProblemTarget === 'root') {
      setProblems([...problems, problemPreview]);
    } else if (typeof addProblemTarget === 'number') {
      const newParts = [...parts];
      newParts[addProblemTarget].problems.push(problemPreview);
      setParts(newParts);
    }
    
    setAddProblemTarget(null);
    setProblemUrl("");
    setProblemPreview(null);
  };
  
  // Renderers
  const renderProblemCard = (prob: any, pIdx: number, target: number | 'root') => (
    <div key={pIdx} className="flex items-center justify-between p-3 bg-white border border-neutral-100 rounded-xl shadow-sm mb-2 group">
      <div className="flex items-center gap-3">
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
            prob.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" :
            prob.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100/50" :
            "bg-rose-50 text-rose-700 border-rose-100/50"
        }`}>
          {prob.difficulty}
        </div>
        <div>
          <h4 className="text-sm font-bold text-neutral-800 leading-tight">{prob.title}</h4>
          <a href={prob.url} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-500 hover:underline">
            {prob.url}
          </a>
        </div>
      </div>
      <button onClick={() => removeProblem(target, pIdx)} className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      modalId="track-wizard"
      title={initialData ? "Edit Track" : "Add New Track"}
      subtitle={phase === 1 ? "Track Details" : "Track Structure Builder"}
      icon={<ListTree className="w-5 h-5" />}
      maxWidthClass="max-w-3xl"
    >
      <div className="relative overflow-hidden min-h-[450px]">
        {error && (
          <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Phase 1: Details */}
        <div className={`absolute inset-0 p-6 transition-transform duration-300 ${phase === 1 ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Track Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Arrays & Hashing"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Briefly describe what this track covers..."
                className="w-full h-32 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-y"
              />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-neutral-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all">
              Cancel
            </button>
            <button onClick={handleNextPhase} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow-md flex items-center gap-2 transition-all">
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phase 2: Structure */}
        <div className={`absolute inset-0 p-6 flex flex-col transition-transform duration-300 ${phase === 2 ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex-1 overflow-y-auto pr-2 pb-24">
            
            {/* Header / Add Buttons */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-neutral-900">Track Items</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setAddSubtrackOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Subtrack
                </button>
                <button onClick={() => setAddProblemTarget('root')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Problem
                </button>
              </div>
            </div>

            {/* Empty State */}
            {problems.length === 0 && parts.length === 0 && !addProblemTarget && !addSubtrackOpen && (
              <div className="text-center p-8 bg-neutral-50 border border-neutral-100 rounded-2xl border-dashed">
                <p className="text-sm text-neutral-500 font-medium">No items added yet. Add a subtrack or an individual problem to get started.</p>
              </div>
            )}

            {/* Root Problems */}
            {problems.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 pl-1">Root Problems</h4>
                {problems.map((p, i) => renderProblemCard(p, i, 'root'))}
              </div>
            )}

            {/* Subtracks */}
            {parts.map((part, i) => (
              <div key={i} className="mb-6 bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">{part.title}</h4>
                    {part.description && <p className="text-xs text-neutral-500 mt-0.5">{part.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAddProblemTarget(i)} className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors">
                      <Plus className="w-3 h-3" /> Add Problem
                    </button>
                    <button onClick={() => removeSubtrack(i)} className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  {part.problems.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic pl-1">No problems in this subtrack.</p>
                  ) : (
                    part.problems.map((p: any, pIdx: number) => renderProblemCard(p, pIdx, i))
                  )}
                </div>
              </div>
            ))}

          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-neutral-100 flex justify-between gap-3">
            <button onClick={() => setPhase(1)} className="px-5 py-2.5 text-sm font-bold text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 flex items-center gap-2 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Track"}
            </button>
          </div>
        </div>

        {/* Inner Modals / Popups */}
        {(addSubtrackOpen || addProblemTarget !== null) && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white border border-neutral-200 shadow-xl rounded-2xl p-6 w-full max-w-md">
              {addSubtrackOpen ? (
                <>
                  <h3 className="text-lg font-bold text-neutral-900 mb-4">Add Subtrack</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Subtrack Title</label>
                      <input autoFocus value={subtrackTitle} onChange={e => setSubtrackTitle(e.target.value)} placeholder="e.g. Two Pointers" className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Description (Optional)</label>
                      <textarea value={subtrackDescription} onChange={e => setSubtrackDescription(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none h-20" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setAddSubtrackOpen(false)} className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleAddSubtrack} disabled={!subtrackTitle.trim()} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors">Add Subtrack</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-neutral-900 mb-4">
                    Add Problem {addProblemTarget === 'root' ? 'to Root' : 'to Subtrack'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">LeetCode URL</label>
                      <input autoFocus value={problemUrl} onChange={e => handleUrlChange(e.target.value)} placeholder="https://leetcode.com/problems/..." className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    </div>
                    
                    <div className={`w-full px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium min-h-[42px] flex items-center justify-between ${problemPreview ? "text-neutral-800" : "text-neutral-400 italic"}`}>
                      <div className="flex items-center gap-3">
                        <span>{problemPreview?.title || "Enter URL to fetch title..."}</span>
                        {problemPreview?.difficulty && (
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                            problemPreview.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" :
                            problemPreview.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100/50" :
                            "bg-rose-50 text-rose-700 border-rose-100/50"
                          }`}>
                            {problemPreview.difficulty}
                          </span>
                        )}
                      </div>
                      {isFetchingProblem && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => { setAddProblemTarget(null); setProblemUrl(""); setProblemPreview(null); }} className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleAddProblemSubmit} disabled={!problemPreview || isFetchingProblem} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors">Add Problem</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </BaseModal>
  );
}

