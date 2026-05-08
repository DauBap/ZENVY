import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 font-display text-2xl">Lá bài này chưa được lật</h2>
        <p className="mt-2 text-sm text-muted-foreground">Có lẽ vũ trụ muốn bạn đi một hướng khác.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-gradient-aurora px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Có gì đó không ổn</h1>
        <p className="mt-2 text-sm text-muted-foreground">Hãy thử lại trong giây lát.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-gradient-aurora px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Mystica — Tarot Booking Platform cho trái tim hiện đại" },
      { name: "description", content: "Kết nối với những reader tarot được xác minh. Đặt buổi đọc bài 1-1, AI Tarot miễn phí, cộng đồng hỗ trợ 24/7." },
      { name: "theme-color", content: "#100822" },
      { property: "og:title", content: "Mystica — Tarot Booking" },
      { property: "og:description", content: "Sự rõ ràng cho tình yêu, sự nghiệp và cuộc sống. Mọi lúc, mọi nơi." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 pb-24 md:pb-0">
          <Outlet />
        </main>
        <SiteFooter />
        <MobileNav />
      </div>
    </QueryClientProvider>
  );
}
