import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { User, Mail, Code2, Calendar } from "lucide-react";

export default function UsersPage() {
  const { adminToken } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/users`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const json = await res.json();
        setUsers(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [adminToken]);

  return (
    <div className="flex flex-col flex-1 min-h-[500px] pt-4">
      <div className="max-w-2xl mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
          Registered Users
        </h1>
        <p className="text-base text-neutral-500 font-medium">
          View and manage all user accounts in the platform.
        </p>
      </div>

      <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 font-medium animate-pulse">
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100">
              <thead className="bg-neutral-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">LeetCode</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <span className="text-sm font-bold text-neutral-900">{user.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Mail className="w-4 h-4 text-neutral-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Code2 className="w-4 h-4 text-neutral-400" />
                        {user.leetcodeUsername ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-semibold text-xs border border-emerald-100">
                            {user.leetcodeUsername}
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic text-xs">Unlinked</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-neutral-500 font-medium">
                      <div className="flex flex-col items-center gap-2">
                        <User className="w-8 h-8 text-neutral-300" />
                        <p>No registered users found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
