import { CardGridSkeleton, PageHeroSkeleton, PageShellSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <PageShellSkeleton>
      <PageHeroSkeleton />
      <div className="grid gap-10 lg:grid-cols-4">
        <div className="space-y-6">
          <div className="h-10 rounded-lg bg-muted/80 animate-pulse" />
          <div className="h-48 rounded-xl border border-border bg-card/40 animate-pulse" />
          <div className="h-40 rounded-xl border border-border bg-card/40 animate-pulse" />
        </div>
        <div className="lg:col-span-3">
          <CardGridSkeleton count={6} columns="lg:grid-cols-2" />
        </div>
      </div>
    </PageShellSkeleton>
  )
}
