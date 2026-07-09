export const dynamic = 'force-static'

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
        <p className="text-muted-foreground mb-6">We are working on this page. Please check back later.</p>
        <div className="text-sm text-muted-foreground">If you were redirected here, the feature is not yet available.</div>
      </div>
    </main>
  )
}
