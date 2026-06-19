import { useAdminAuth } from "../../context/AdminAuthContext";
import { Users, Map, FileText, BarChart, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const { adminUser } = useAdminAuth();
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-[500px] pt-4">
      {/* Header Section */}
      <div className="max-w-2xl mb-12">
        <h1
          className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 tracking-tight leading-tight mb-2"
        >
          {greeting}
        </h1>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
        <QuickLinkCard
          to="/admin/users"
          icon={<Users className="w-5 h-5" />}
          title="Users"
          description="Manage accounts"
          colorClass="indigo"
        />
        <QuickLinkCard
          to="/admin/tracks"
          icon={<Map className="w-5 h-5" />}
          title="Roadmap Tracks"
          description="Curate curriculums"
          colorClass="emerald"
        />
        <QuickLinkCard
          to="/admin/docs"
          icon={<FileText className="w-5 h-5" />}
          title="Documentation"
          description="Edit study theory"
          colorClass="purple"
        />
        <QuickLinkCard
          to="/admin/analytics"
          icon={<BarChart className="w-5 h-5" />}
          title="Analytics"
          description="View system metrics"
          colorClass="rose"
        />
      </div>
    </div>
  );
}

function QuickLinkCard({ 
  to, icon, title, description, colorClass 
}: { 
  to: string, icon: React.ReactNode, title: string, description: string, colorClass: "indigo" | "emerald" | "purple" | "rose" 
}) {
  const colorStyles = {
    indigo: "group-hover:bg-indigo-600 text-indigo-600 bg-indigo-50 border-indigo-200 group-hover:border-indigo-300 from-indigo-50/50 group-hover:text-white",
    emerald: "group-hover:bg-emerald-600 text-emerald-600 bg-emerald-50 border-emerald-200 group-hover:border-emerald-300 from-emerald-50/50 group-hover:text-white",
    purple: "group-hover:bg-purple-600 text-purple-600 bg-purple-50 border-purple-200 group-hover:border-purple-300 from-purple-50/50 group-hover:text-white",
    rose: "group-hover:bg-rose-600 text-rose-600 bg-rose-50 border-rose-200 group-hover:border-rose-300 from-rose-50/50 group-hover:text-white",
  };

  const style = colorStyles[colorClass];
  
  // Extract specific parts
  const bgGradient = style.match(/from-\w+-50\/50/)?.[0] || "";
  const iconBg = style.match(/bg-\w+-50/)![0];
  const iconText = style.match(/text-\w+-600/)![0];
  const groupHoverBg = style.match(/group-hover:bg-\w+-600/)![0];
  const groupHoverText = "group-hover:text-white";

  return (
    <Link
      to={to}
      className="group relative flex flex-col p-6 bg-white border border-neutral-100 rounded-2xl hover:border-neutral-200 hover:shadow-xl hover:shadow-neutral-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="relative z-10 flex flex-col h-full">
        <div className={`p-3 w-max rounded-xl transition-all duration-300 ${iconBg} ${iconText} ${groupHoverBg} ${groupHoverText} mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-neutral-950 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-neutral-500 font-medium mt-1 mb-4">
          {description}
        </p>
        <div className="mt-auto flex items-center gap-2 text-sm font-bold text-neutral-400 group-hover:text-neutral-900 transition-colors">
          Open module <MoveRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
