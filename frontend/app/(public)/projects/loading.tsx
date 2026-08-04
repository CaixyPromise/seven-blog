import { CardGridSkeleton, PageHeroSkeleton, PageShellSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <PageShellSkeleton>
      <PageHeroSkeleton />
      <div className="mb-10 space-y-4">
        <div className="h-10 w-full max-w-md rounded-lg bg-muted/80 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-lg bg-muted/80 animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-muted/80 animate-pulse" />
          <div className="h-9 w-24 rounded-lg bg-muted/80 animate-pulse" />
        </div>
      </div>
      <CardGridSkeleton count={6} />
    </PageShellSkeleton>
  )
}
