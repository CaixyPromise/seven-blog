import { CardGridSkeleton, ListSkeleton, PageHeroSkeleton, PageShellSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <PageShellSkeleton>
      <PageHeroSkeleton />
      <CardGridSkeleton count={6} />
      <div className="mt-20">
        <PageHeroSkeleton compact />
        <ListSkeleton count={4} />
      </div>
    </PageShellSkeleton>
  )
}
