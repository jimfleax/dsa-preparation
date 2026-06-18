import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  users: { total: number; newLast30Days: number };
  content: { totalTracks: number; totalProblemsAvailable: number };
  engagement: { totalProblemsSolvedGlobally: number; mostActiveTracks: { title: string; activityScore: number }[] };
  completionRate: { solved: number; revising: number; unsolved: number };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const { adminToken } = useAdminAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics", {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [adminToken]);

  if (loading) return <div>Loading analytics...</div>;
  if (!data) return <div>Failed to load analytics</div>;

  const completionData = [
    { name: 'Solved', value: data.completionRate.solved },
    { name: 'Revising', value: data.completionRate.revising },
    { name: 'Unsolved', value: data.completionRate.unsolved },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.users.total}</dd>
          <dd className="mt-1 text-sm text-green-600">+{data.users.newLast30Days} new (30d)</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Tracks</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.content.totalTracks}</dd>
          <dd className="mt-1 text-sm text-gray-500">{data.content.totalProblemsAvailable} problems available</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Solved</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.engagement.totalProblemsSolvedGlobally}</dd>
          <dd className="mt-1 text-sm text-gray-500">problems globally</dd>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Most Active Tracks</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.engagement.mostActiveTracks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activityScore" fill="#3b82f6" name="Activity Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Global Completion Rate</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
