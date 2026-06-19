import { useAdminAuth } from "../../context/AdminAuthContext";
import { Users, Map, FileText, BarChart, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";

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
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 tracking-tight leading-tight mb-2">
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
  to,
  icon,
  title,
  description,
  colorClass,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: "indigo" | "emerald" | "purple" | "rose";
}) {
  const colorStyles = {
    indigo: "group-hover:bg-indigo-600 text-indigo-600 bg-indigo-50",
    emerald: "group-hover:bg-emerald-600 text-emerald-600 bg-emerald-50",
    purple: "group-hover:bg-purple-600 text-purple-600 bg-purple-50",
    rose: "group-hover:bg-rose-600 text-rose-600 bg-rose-50",
  };

  const style = colorStyles[colorClass];

  return (
    <Card
      as={Link}
      to={to}
      padding="lg"
      interactive
      hoverEffect="glow"
      hoverColor={colorClass}
      gradientBackground
      className="group relative flex flex-col h-full"
    >
      <div className="relative z-10 flex flex-col h-full">
        <div
          className={`p-3 w-max rounded-xl transition-all duration-300 ${style} group-hover:text-white mb-4`}
        >
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
    </Card>
  );
}
