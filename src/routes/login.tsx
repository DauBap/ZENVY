import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Đăng nhập — Mystica" }] }),
  component: Login,
});

function Login() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-3xl border border-border bg-card/60 p-8 backdrop-blur-xl shadow-card">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-aurora shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold">Chào mừng trở lại</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vũ trụ đã chờ bạn.</p>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 px-4 py-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input type="email" placeholder="Email" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 px-4 py-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input type="password" placeholder="Mật khẩu" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
        </div>

        <Link to="/dashboard" className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gradient-aurora py-3.5 text-sm font-semibold text-primary-foreground shadow-glow">
          Đăng nhập
        </Link>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> hoặc <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {["Google", "Apple"].map((p) => (
            <button key={p} className="rounded-2xl border border-border bg-background/40 py-3 text-sm font-medium hover:bg-background/60">{p}</button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Chưa có tài khoản? <Link to="/login" className="text-primary">Đăng ký</Link>
        </p>
      </motion.div>
    </div>
  );
}
