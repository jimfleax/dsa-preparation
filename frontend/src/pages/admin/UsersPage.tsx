import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { adminFetch } from "../../lib/adminFetch";
import { User, Mail, Code2, Calendar, Info, Trash2 } from "lucide-react";
import UserInfoModal from "../../components/admin/UserInfoModal";
import DeleteUserModal from "../../components/admin/DeleteUserModal";

export default function UsersPage() {
  const { adminToken } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserForInfo, setSelectedUserForInfo] = useState<any | null>(
    null,
  );
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<
    any | null
  >(null);

  const fetchUsers = async () => {
    try {
      const res = await adminFetch(
        `${import.meta.env.VITE_API_URL || ""}/api/admin/users`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      const json = await res.json();
      setUsers(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [adminToken]);

  const handleDeleteConfirm = async (deleteProgress: boolean) => {
    if (!selectedUserForDelete) return;
    try {
      const res = await adminFetch(
        `${import.meta.env.VITE_API_URL || ""}/api/admin/users/${selectedUserForDelete._id}?deleteProgress=${deleteProgress}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      if (res.ok) {
        await fetchUsers();
      } else {
        console.error("Failed to delete user");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSelectedUserForDelete(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-[500px] pt-4">
      <div className="max-w-2xl mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
          Users
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {user.name ? (
                            user.name.charAt(0).toUpperCase()
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-neutral-900">
                          {user.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUserForInfo(user)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-sm transition-colors border border-indigo-100"
                        >
                          <Info className="w-4 h-4" /> View Information
                        </button>
                        <button
                          onClick={() => setSelectedUserForDelete(user)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-sm transition-colors border border-rose-100"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-12 text-center text-sm text-neutral-500 font-medium"
                    >
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

      {selectedUserForInfo && (
        <UserInfoModal
          user={selectedUserForInfo}
          onClose={() => setSelectedUserForInfo(null)}
        />
      )}

      {selectedUserForDelete && (
        <DeleteUserModal
          user={selectedUserForDelete}
          onClose={() => setSelectedUserForDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
