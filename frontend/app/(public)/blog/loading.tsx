import { ListSkeleton, PageHeroSkeleton, PageShellSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <PageShellSkeleton>
      <PageHeroSkeleton />
      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <ListSkeleton count={5} />
        <div className="hidden space-y-6 lg:block">
          <div className="h-10 rounded-lg bg-muted/80 animate-pulse" />
          <div className="h-48 rounded-xl border border-border bg-card/40 animate-pulse" />
          <div className="h-36 rounded-xl border border-border bg-card/40 animate-pulse" />
        </div>
      </div>
    </PageShellSkeleton>
  )
}
