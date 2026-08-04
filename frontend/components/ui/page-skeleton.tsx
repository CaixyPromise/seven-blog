import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted/80", className)} />
}

export function PageHeroSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("space-y-4", compact ? "mb-10" : "mb-12 sm:mb-16")}>
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className={cn("h-12", compact ? "w-64" : "w-72 sm:w-96")} />
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-full max-w-2xl" />
        <SkeletonBlock className="h-4 w-5/6 max-w-xl" />
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 6, columns = "lg:grid-cols-3" }: { count?: number; columns?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2", columns)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-card/40 p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
          <SkeletonBlock className="mb-4 h-6 w-3/4" />
          <div className="mb-5 space-y-2">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-6 w-16 rounded-md" />
            <SkeletonBlock className="h-6 w-20 rounded-md" />
            <SkeletonBlock className="h-6 w-14 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-card/40 p-6 sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-4">
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-4 w-32" />
          </div>
          <SkeletonBlock className="mb-4 h-7 w-3/4" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ArticleSkeleton() {
  return (
    <article className="mx-auto max-w-4xl">
      <PageHeroSkeleton compact />
      <div className="space-y-4">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="mt-8 h-8 w-1/2" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-32 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
    </article>
  )
}

export function PageShellSkeleton({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">{children}</div>
}
