import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { adminFetch } from "../../lib/adminFetch";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, Map, CheckCircle2, TrendingUp, Activity } from "lucide-react";

interface AnalyticsData {
  users: { total: number; newLast30Days: number };
  content: { totalTracks: number; totalProblemsAvailable: number };
  engagement: {
    totalProblemsSolvedGlobally: number;
    mostActiveTracks: { title: string; activityScore: number }[];
  };
  completionRate: { solved: number; revising: number; unsolved: number };
}

const COLORS = ["#10b981", "#f59e0b", "#cbd5e1"]; // Emerald (Solved), Amber (Revising), Slate (Unsolved)

export default function AnalyticsPage() {
  const { adminToken } = useAdminAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminFetch(
          `${import.meta.env.VITE_API_URL || ""}/api/admin/analytics`,
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          },
        );
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

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-[500px] pt-4">
        <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center text-neutral-400 font-medium animate-pulse">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col flex-1 min-h-[500px] pt-4">
        <div className="bg-white border border-rose-100 rounded-2xl p-12 text-center text-rose-500 font-medium">
          Failed to load analytics data.
        </div>
      </div>
    );
  }

  const completionData = [
    { name: "Solved", value: data.completionRate.solved },
    { name: "Revising", value: data.completionRate.revising },
    { name: "Unsolved", value: data.completionRate.unsolved },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-[500px] pt-4">
      <div className="max-w-2xl mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
          Analytics
        </h1>
        <p className="text-base text-neutral-500 font-medium">
          Monitor platform engagement, user growth, and content completion.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full opacity-50 z-0" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Total Users
              </p>
              <h3 className="text-3xl font-extrabold text-neutral-900">
                {data.users.total}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>+{data.users.newLast30Days} new (30d)</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-50 to-transparent rounded-bl-full opacity-50 z-0" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Total Tracks
              </p>
              <h3 className="text-3xl font-extrabold text-neutral-900">
                {data.content.totalTracks}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Map className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-1.5 text-sm font-medium text-neutral-500">
            <span>
              {data.content.totalProblemsAvailable} problems available
            </span>
          </div>
        </div>

        <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-50 z-0" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Global Solves
              </p>
              <h3 className="text-3xl font-extrabold text-neutral-900">
                {data.engagement.totalProblemsSolvedGlobally}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-1.5 text-sm font-medium text-neutral-500">
            <span>total problems solved globally</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-neutral-900">
              Most Active Tracks
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.engagement.mostActiveTracks}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="activityScore"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  name="Activity Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-neutral-900">
              Global Completion Rate
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {completionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
