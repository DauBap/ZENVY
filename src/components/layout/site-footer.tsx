import { Link } from "@tanstack/react-router";
import { Sparkles, Instagram, Twitter, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/50 bg-card/30 pb-24 pt-16 md:pb-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-4 md:px-6">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-aurora shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold">Mystica</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Nền tảng kết nối trái tim bạn với những reader tarot đáng tin cậy nhất — mọi lúc, mọi nơi.
          </p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Twitter, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card/50 text-muted-foreground hover:text-foreground">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {[
          { title: "Khám phá", links: [["Readers", "/readers"], ["AI Tarot", "/ai-tarot"], ["Community", "/community"]] },
          { title: "Hỗ trợ", links: [["Trung tâm trợ giúp", "#"], ["Chính sách hoàn tiền", "#"], ["Liên hệ", "#"]] },
          { title: "Pháp lý", links: [["Điều khoản", "#"], ["Bảo mật", "#"], ["Cookies", "#"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-base font-semibold">{col.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href as string} className="transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-border/50 px-4 pt-6 text-center text-xs text-muted-foreground md:px-6">
        © {new Date().getFullYear()} Mystica. Mọi hành trình bên trong đều xứng đáng được lắng nghe.
      </div>
    </footer>
  );
}
