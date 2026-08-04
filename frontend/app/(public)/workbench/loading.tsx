import { ListSkeleton, PageHeroSkeleton, PageShellSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <PageShellSkeleton>
      <PageHeroSkeleton />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListSkeleton count={5} />
        </div>
        <div className="space-y-6">
          <div className="h-32 rounded-xl border border-border bg-card/40 animate-pulse" />
          <div className="h-48 rounded-xl border border-border bg-card/40 animate-pulse" />
        </div>
      </div>
    </PageShellSkeleton>
  )
}
