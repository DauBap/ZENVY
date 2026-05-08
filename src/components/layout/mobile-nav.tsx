import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Sparkles, MessageCircle, User } from "lucide-react";

const ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/readers", icon: Compass, label: "Readers" },
  { to: "/ai-tarot", icon: Sparkles, label: "AI" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/dashboard", icon: User, label: "Me" },
];

export function MobileNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="glass-strong safe-bottom border-t border-border/60 px-2 pt-2">
        <ul className="flex items-end justify-around">
          {ITEMS.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            const Icon = item.icon;
            const isCenter = item.to === "/ai-tarot";
            return (
              <li key={item.to} className="flex-1">
                <Link to={item.to} className="flex flex-col items-center gap-1">
                  {isCenter ? (
                    <span className="-mt-6 grid h-12 w-12 place-items-center rounded-full bg-gradient-aurora shadow-glow">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </span>
                  ) : (
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
                        active ? "bg-primary/20 text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                  )}
                  <span className={`text-[10px] ${active ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
