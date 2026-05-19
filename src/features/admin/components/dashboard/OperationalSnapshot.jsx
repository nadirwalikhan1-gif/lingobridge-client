import { Activity, Clock, Users, AlertTriangle } from "lucide-react";

const stats = [
  { label: "Active",      value: "12", accent: true  },
  { label: "Waiting",     value: "7",  accent: true  },
  { label: "Online",      value: "34", accent: false },
  { label: "Escalations", value: "3",  accent: false },
];

const rows = [
  { label: "Avg. Wait Time",         value: "1m 42s", icon: Clock,         color: "text-[#7F77DD]",   mono: true  },
  { label: "Match Success Rate",     value: "97.2%",  icon: Activity,      color: "text-emerald-500", mono: false },
  { label: "Interpreters Available", value: "21",     icon: Users,         color: "text-emerald-500", mono: false },
  { label: "SLA Breaches Today",     value: "1",      icon: AlertTriangle, color: "text-red-400",     mono: false },
];

export default function OperationalSnapshot() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="lb-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-lb-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[13px] font-semibold text-lb-ink">Operational Snapshot</span>
        </div>
        <span className="text-[10px] text-lb-muted">{today}</span>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-4 divide-x divide-lb-border border-b border-lb-border shrink-0">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`px-2 py-2.5 flex flex-col items-center gap-0.5 ${
              stat.accent ? "bg-[#EEEDFE]" : "bg-lb-surface"
            }`}
          >
            <span className={`text-[15px] font-semibold leading-none ${
              stat.accent ? "text-[#534AB7]" : "text-lb-ink"
            }`}>
              {stat.value}
            </span>
            <span className={`text-[9px] uppercase tracking-wide leading-tight text-center ${
              stat.accent ? "text-[#7F77DD]" : "text-lb-muted"
            }`}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Rows — flex-1 so they fill remaining card height, justify-between spreads evenly */}
      <div className="flex flex-col flex-1 divide-y divide-lb-border">
        {rows.map(({ label, value, icon: Icon, color, mono }) => (
          <div key={label} className={`flex items-center justify-between px-4 flex-1 ${label === 'SLA Breaches Today' && value !== '0' ? 'bg-[#FCEBEB]/30' : ''}`}>
            <div className="flex items-center gap-2.5">
              <Icon size={14} className={color} />
              <span className={`text-[12.5px] ${label === 'SLA Breaches Today' && value !== '0' ? 'text-[#A32D2D] font-medium' : 'text-lb-muted'}`}>{label}</span>
            </div>
            <span className={`text-[14px] font-semibold ${label === 'SLA Breaches Today' && value !== '0' ? 'text-[#A32D2D]' : 'text-lb-ink'} ${mono ? 'font-mono' : ''}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}