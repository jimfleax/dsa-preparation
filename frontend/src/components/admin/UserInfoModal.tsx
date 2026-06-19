import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  X,
  Code2,
  Award,
  Star,
  Activity,
  FileText,
  Loader2,
  Calendar,
} from "lucide-react";

export default function UserInfoModal({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const { adminToken } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any[]>([]);
  const [leetcodeData, setLeetcodeData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, lcRes] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_URL || ""}/api/admin/users/${user._id}/progress`,
            {
              headers: { Authorization: `Bearer ${adminToken}` },
            },
          ),
          user.leetcodeUsername
            ? fetch(
                `${import.meta.env.VITE_API_URL || ""}/api/admin/users/${user._id}/leetcode`,
                {
                  headers: { Authorization: `Bearer ${adminToken}` },
                },
              )
            : Promise.resolve({ ok: true, json: () => null }),
        ]);

        if (progRes.ok) setProgress(await progRes.json());
        if (lcRes.ok) setLeetcodeData(await lcRes.json());
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, adminToken]);

  const easySolved =
    leetcodeData?.submitStats?.acSubmissionNum?.find(
      (x: any) => x.difficulty === "Easy",
    )?.count || 0;
  const mediumSolved =
    leetcodeData?.submitStats?.acSubmissionNum?.find(
      (x: any) => x.difficulty === "Medium",
    )?.count || 0;
  const hardSolved =
    leetcodeData?.submitStats?.acSubmissionNum?.find(
      (x: any) => x.difficulty === "Hard",
    )?.count || 0;
  const totalSolved =
    leetcodeData?.submitStats?.acSubmissionNum?.find(
      (x: any) => x.difficulty === "All",
    )?.count || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
              {leetcodeData?.profile?.userAvatar ? (
                <img
                  src={leetcodeData.profile.userAvatar}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : user.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                "U"
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {user.name || "Unknown"}
              </h2>
              <p className="text-sm text-neutral-500 font-medium">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="font-medium">Compiling user data...</p>
            </div>
          ) : (
            <>
              {/* LeetCode Stats */}
              <div>
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-500" /> LeetCode Profile
                </h3>
                {user.leetcodeUsername ? (
                  <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm border border-indigo-100">
                        @{user.leetcodeUsername}
                      </span>
                    </div>

                    {leetcodeData ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                          <p className="text-xs font-bold text-neutral-500 uppercase mb-1">
                            Ranking
                          </p>
                          <p className="text-lg font-extrabold text-neutral-900">
                            {leetcodeData.profile?.ranking?.toLocaleString() ||
                              "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                          <p className="text-xs font-bold text-emerald-600 uppercase mb-1">
                            Easy
                          </p>
                          <p className="text-lg font-extrabold text-emerald-700">
                            {easySolved}
                          </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-xs font-bold text-amber-600 uppercase mb-1">
                            Medium
                          </p>
                          <p className="text-lg font-extrabold text-amber-700">
                            {mediumSolved}
                          </p>
                        </div>
                        <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                          <p className="text-xs font-bold text-rose-600 uppercase mb-1">
                            Hard
                          </p>
                          <p className="text-lg font-extrabold text-rose-700">
                            {hardSolved}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500">
                        LeetCode data could not be retrieved.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl text-center">
                    <p className="text-sm text-neutral-500 font-medium">
                      This user hasn't linked a LeetCode account yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Local Progress Stats */}
              <div>
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> Platform
                  Progress
                </h3>
                <div className="bg-white border border-neutral-100 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <span className="font-bold text-neutral-700">
                      Total Problems Tracked
                    </span>
                    <span className="text-xl font-extrabold text-emerald-600">
                      {progress.length}
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-2">
                    {progress.length > 0 ? (
                      <ul className="space-y-1">
                        {progress.map((p: any) => (
                          <li
                            key={p._id}
                            className="p-3 hover:bg-neutral-50 rounded-lg flex items-center justify-between transition-colors"
                          >
                            <span className="font-medium text-sm text-neutral-900">
                              {p.title}
                            </span>
                            <span className="text-xs font-bold px-2 py-1 bg-neutral-100 text-neutral-500 rounded-md flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(
                                p.lastAttemptedDate,
                              ).toLocaleDateString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-sm text-neutral-500 font-medium">
                          No progress tracked yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
