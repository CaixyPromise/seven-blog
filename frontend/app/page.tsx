import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProjectsGrid } from "@/components/projects-grid"
import { LabNotes } from "@/components/lab-notes"
import { Workbench } from "@/components/workbench"
import { Footer } from "@/components/footer"
import { CursorGlow } from "@/components/cursor-glow"
import { generateWebsiteStructuredData, generatePersonStructuredData } from "@/lib/structured-data"
import { listNotes } from "@/lib/content/notes"
import { getHomePageContent } from "@/lib/content/site"
import { listWorkbenchItems } from "@/lib/content/workbench"
import { getProfileContent } from "@/lib/content/site"
import { parseLocale } from "@/lib/i18n"

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function Home({ searchParams }: HomePageProps) {
  const locale = parseLocale((await searchParams)?.lang)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const [homeContent, profile, notes, workbenchItems] = await Promise.all([
    getHomePageContent(locale),
    getProfileContent(locale),
    listNotes(),
    listWorkbenchItems(),
  ])
  const websiteStructuredData = generateWebsiteStructuredData(baseUrl, profile)
  const personStructuredData = generatePersonStructuredData(profile, baseUrl)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
      />
      <main className="relative min-h-screen overflow-hidden scanlines">
        <CursorGlow />
        <div className="relative z-10">
          <Header socialLinks={profile.socialLinks} />
          <HeroSection content={homeContent.hero} />
          <ProjectsGrid locale={locale} />
          <LabNotes notes={notes.slice(0, 4)} locale={locale} />
          <Workbench items={workbenchItems.slice(0, 4)} locale={locale} />
          <Footer socialLinks={profile.socialLinks} />
        </div>
      </main>
    </>
  )
}
