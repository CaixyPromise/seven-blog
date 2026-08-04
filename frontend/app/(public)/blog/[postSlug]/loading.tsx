import { ArticleSkeleton, PageShellSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <PageShellSkeleton>
      <ArticleSkeleton />
    </PageShellSkeleton>
  )
}
