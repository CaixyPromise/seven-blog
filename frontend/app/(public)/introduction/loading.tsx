import { CardGridSkeleton, PageHeroSkeleton, PageShellSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <PageShellSkeleton>
      <PageHeroSkeleton />
      <div className="mb-16 rounded-xl border border-border bg-card/40 p-6 sm:p-10">
        <div className="mb-8 h-8 w-64 rounded-lg bg-muted/80 animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 w-full rounded bg-muted/80 animate-pulse" />
          <div className="h-4 w-11/12 rounded bg-muted/80 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-muted/80 animate-pulse" />
        </div>
      </div>
      <CardGridSkeleton count={6} />
    </PageShellSkeleton>
  )
}
