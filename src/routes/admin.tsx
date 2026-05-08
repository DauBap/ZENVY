import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, CalendarDays, AlertTriangle, Wallet, BarChart3, Bell, FileText, LayoutDashboard, BadgeCheck } from "lucide-react";
import { READERS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Mystica" }] }),
  component: Admin,
});

const SECTIONS = [
  { to: "/admin", icon: LayoutDashboard, label: "Tổng quan" },
  { to: "/admin", icon: Users, label: "Readers" },
  { to: "/admin", icon: CalendarDays, label: "Bookings" },
  { to: "/admin", icon: AlertTriangle, label: "Disputes" },
  { to: "/admin", icon: Wallet, label: "Payouts" },
  { to: "/admin", icon: BarChart3, label: "Analytics" },
  { to: "/admin", icon: Bell, label: "Notifications" },
  { to: "/admin", icon: FileText, label: "Reports" },
];

function Admin() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="hidden rounded-3xl border border-border bg-card/50 p-3 backdrop-blur-xl md:block">
        <div className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground">Admin</div>
        <nav className="mt-1 space-y-1">
          {SECTIONS.map((s, i) => (
            <Link key={i} to={s.to} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${i === 0 ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted/30"}`}>
              <s.icon className="h-4 w-4" /> {s.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main>
        <h1 className="font-display text-3xl font-semibold">Tổng quan</h1>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { l: "Doanh thu (tháng)", v: "₫428M", up: "+12%" },
            { l: "Bookings (tháng)", v: "3,214", up: "+8%" },
            { l: "Reader active", v: "642", up: "+4%" },
            { l: "Disputes mở", v: "7", up: "-30%" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-xl">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="mt-1 font-display text-2xl font-semibold gradient-text-gold">{s.v}</div>
              <div className="text-xs text-success">{s.up}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card/50 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Reader gần đây</h2>
            <button className="rounded-full border border-border px-3 py-1 text-xs">Xem tất cả</button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-3">Reader</th><th className="p-3">Sessions</th><th className="p-3">Rating</th><th className="p-3">Trạng thái</th></tr>
              </thead>
              <tbody>
                {READERS.slice(0, 6).map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img src={r.avatar} className="h-8 w-8 rounded-full object-cover" alt="" />
                        <span className="font-medium">{r.name}</span>
                        {r.verified && <BadgeCheck className="h-3.5 w-3.5 text-accent" />}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{r.sessions}</td>
                    <td className="p-3 text-muted-foreground">{r.rating.toFixed(1)} ★</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${r.online ? "bg-success/15 text-success" : "bg-muted/40 text-muted-foreground"}`}>{r.online ? "online" : "offline"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">{path}</div>
      </main>
    </div>
  );
}
