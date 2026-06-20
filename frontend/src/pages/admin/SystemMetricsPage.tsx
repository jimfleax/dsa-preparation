import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { adminFetch } from "../../lib/adminFetch";
import { Card } from "../../components/ui/Card";
import { AnimatedNumber } from "../../components/AnimatedNumber";
import { Activity, Server, Database, HardDrive, Cpu, RefreshCw, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface MetricsData {
  timestamp: string;
  os: { platform: string; arch: string; hostname: string; nodeVersion: string };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    totalBytes: number;
    freeBytes: number;
    usedBytes: number;
    utilizationPercent: number;
    containerLimited: boolean;
  };
  cpu: { cores: number; utilizationPercent: number; containerLimited: boolean };
  eventLoop: { min: number; max: number; mean: number; p50: number; p95: number; p99: number; unit: string };
  disk: {
    readsCompleted: number;
    writesCompleted: number;
    readIOPS: number;
    writeIOPS: number;
    readBytesPerSecond: number;
    writeBytesPerSecond: number;
  } | null;
  mongo: {
    connections: { current: number; available: number; totalCreated: number };
    opcounters: { insert: number; query: number; update: number; delete: number; getmore: number; command: number };
    replicationLag: number | null;
    replicationLagReason: string | null;
    pageFaults?: number;
  } | null;
  http: {
    totalRequests: number;
    statusCodes: { "2xx": number; "3xx": number; "4xx": number; "5xx": number };
    latency: { avg: number; p50: number; p95: number; p99: number; samples: number };
  };
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function SystemMetricsPage() {
  const { adminToken } = useAdminAuth();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [history, setHistory] = useState<{ time: string; memory: number; cpu: number; latency: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const res = await adminFetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/metrics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data: MetricsData = await res.json();
      setMetrics(data);
      
      const timeStr = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setHistory(prev => {
        const newHistory = [...prev, {
          time: timeStr,
          memory: data.memory.utilizationPercent,
          cpu: data.cpu.utilizationPercent,
          latency: data.http.latency.p95
        }];
        if (newHistory.length > 20) newHistory.shift();
        return newHistory;
      });
      
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, [adminToken]);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <Card padding="lg" className="border-red-200 bg-red-50 text-red-600 flex flex-col items-center">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="font-bold">Error loading metrics</p>
        <p className="text-sm">{error}</p>
        <button onClick={fetchMetrics} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
          Retry
        </button>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <div className="flex flex-col gap-6 max-w-7xl pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 flex items-center gap-2">
            <Server className="w-8 h-8 text-indigo-600" />
            System Metrics
          </h1>
          <p className="text-sm text-neutral-500 font-medium">
            {metrics.os.hostname} • {metrics.os.platform} ({metrics.os.arch}) • Node {metrics.os.nodeVersion}
          </p>
        </div>
        <button 
          onClick={fetchMetrics}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 font-medium text-sm transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="CPU Usage" 
          value={metrics.cpu.utilizationPercent} 
          unit="%" 
          formatter={(v) => v.toFixed(1)}
          icon={<Cpu className="w-5 h-5" />}
          color="indigo"
          subtitle={`${metrics.cpu.cores} Cores ${metrics.cpu.containerLimited ? '(Docker Limit)' : ''}`}
        />
        <MetricCard 
          title="Memory Usage" 
          value={metrics.memory.utilizationPercent} 
          unit="%" 
          formatter={(v) => v.toFixed(1)}
          icon={<HardDrive className="w-5 h-5" />}
          color="emerald"
          subtitle={`${formatBytes(metrics.memory.usedBytes)} / ${formatBytes(metrics.memory.totalBytes)}`}
        />
        <MetricCard 
          title="HTTP P95 Latency" 
          value={metrics.http.latency.p95} 
          unit="ms" 
          formatter={(v) => v.toFixed(0)}
          icon={<Activity className="w-5 h-5" />}
          color="rose"
          subtitle={`Avg: ${metrics.http.latency.avg.toFixed(0)}ms (${metrics.http.totalRequests} reqs)`}
        />
        <MetricCard 
          title="Mongo Connections" 
          value={metrics.mongo?.connections.current || 0} 
          icon={<Database className="w-5 h-5" />}
          color="purple"
          subtitle={`Available: ${metrics.mongo?.connections.available || 0}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg" className="flex flex-col">
          <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-neutral-500" />
            Resource Utilization
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="cpu" name="CPU %" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="memory" name="Memory %" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="lg" className="flex flex-col">
          <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-neutral-500" />
            Node.js Event Loop Delay
          </h3>
          <div className="grid grid-cols-2 gap-4 h-full">
             <div className="bg-neutral-50 rounded-xl p-4 flex flex-col justify-center">
                <p className="text-sm font-medium text-neutral-500 mb-1">Mean Delay</p>
                <p className="text-2xl font-bold text-neutral-900">{metrics.eventLoop.mean.toFixed(2)}<span className="text-sm text-neutral-500 ml-1">ms</span></p>
             </div>
             <div className="bg-neutral-50 rounded-xl p-4 flex flex-col justify-center">
                <p className="text-sm font-medium text-neutral-500 mb-1">P50 (Median)</p>
                <p className="text-2xl font-bold text-neutral-900">{metrics.eventLoop.p50.toFixed(2)}<span className="text-sm text-neutral-500 ml-1">ms</span></p>
             </div>
             <div className="bg-neutral-50 rounded-xl p-4 flex flex-col justify-center">
                <p className="text-sm font-medium text-neutral-500 mb-1">P95 Delay</p>
                <p className="text-2xl font-bold text-neutral-900">{metrics.eventLoop.p95.toFixed(2)}<span className="text-sm text-neutral-500 ml-1">ms</span></p>
             </div>
             <div className="bg-neutral-50 rounded-xl p-4 flex flex-col justify-center">
                <p className="text-sm font-medium text-neutral-500 mb-1">P99 Delay</p>
                <p className="text-2xl font-bold text-neutral-900">{metrics.eventLoop.p99.toFixed(2)}<span className="text-sm text-neutral-500 ml-1">ms</span></p>
             </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-neutral-500" />
            MongoDB Status
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b border-neutral-100">
               <span className="text-sm font-medium text-neutral-600">Replication Lag</span>
               <span className="text-sm font-bold text-neutral-900">
                 {metrics.mongo?.replicationLag !== null ? `${metrics.mongo?.replicationLag}s` : <span className="text-neutral-400 font-normal">{metrics.mongo?.replicationLagReason || 'N/A'}</span>}
               </span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-neutral-100">
               <span className="text-sm font-medium text-neutral-600">Page Faults</span>
               <span className="text-sm font-bold text-neutral-900">{metrics.mongo?.pageFaults || 0}</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-neutral-100">
               <span className="text-sm font-medium text-neutral-600">Queries</span>
               <span className="text-sm font-bold text-neutral-900">{metrics.mongo?.opcounters.query || 0}</span>
             </div>
             <div className="flex justify-between items-center py-2">
               <span className="text-sm font-medium text-neutral-600">Inserts / Updates</span>
               <span className="text-sm font-bold text-neutral-900">{metrics.mongo?.opcounters.insert || 0} / {metrics.mongo?.opcounters.update || 0}</span>
             </div>
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-neutral-500" />
            HTTP Traffic
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b border-neutral-100">
               <span className="text-sm font-medium text-neutral-600">Total Requests</span>
               <span className="text-sm font-bold text-neutral-900">{metrics.http.totalRequests}</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-neutral-100">
               <span className="text-sm font-medium text-neutral-600">2xx Success</span>
               <span className="text-sm font-bold text-emerald-600">{metrics.http.statusCodes["2xx"]}</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-neutral-100">
               <span className="text-sm font-medium text-neutral-600">4xx Client Errors</span>
               <span className="text-sm font-bold text-amber-600">{metrics.http.statusCodes["4xx"]}</span>
             </div>
             <div className="flex justify-between items-center py-2">
               <span className="text-sm font-medium text-neutral-600">5xx Server Errors</span>
               <span className="text-sm font-bold text-rose-600">{metrics.http.statusCodes["5xx"]}</span>
             </div>
          </div>
        </Card>
      </div>

    </div>
  );
}

function MetricCard({ title, value, unit, formatter, icon, color, subtitle }: {
  title: string;
  value: number;
  unit?: string;
  formatter?: (v: number) => string;
  icon: React.ReactNode;
  color: "indigo" | "emerald" | "rose" | "purple";
  subtitle?: string;
}) {
  const colorStyles = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    rose: "text-rose-600 bg-rose-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <Card padding="lg" className="flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
          {icon}
        </div>
        <h3 className="text-sm font-bold text-neutral-600">{title}</h3>
      </div>
      <div className="mt-auto">
        <p className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          <AnimatedNumber value={value} formatter={formatter} duration={500} />
          {unit && <span className="text-lg text-neutral-500 font-medium ml-1">{unit}</span>}
        </p>
        {subtitle && <p className="text-xs font-medium text-neutral-500 mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
}
