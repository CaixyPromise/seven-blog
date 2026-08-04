import { BrainCircuit, Container, GraduationCap, ServerCog, ShieldCheck, UsersRound, Workflow } from "lucide-react"
import { getIntroductionPageContent } from "@/lib/content/site"
import { parseLocale } from "@/lib/i18n"

const capabilityIconMap = {
  "brain-circuit": BrainCircuit,
  "server-cog": ServerCog,
  workflow: Workflow,
  "shield-check": ShieldCheck,
  container: Container,
  "users-round": UsersRound,
}

type IntroductionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function IntroductionPage({ searchParams }: IntroductionPageProps) {
  const locale = parseLocale((await searchParams)?.lang)
  const content = await getIntroductionPageContent(locale)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground">
                {content.hero.eyebrow}
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                {content.hero.titlePrefix}{" "}
                <span className="bg-gradient-to-l from-primary/50 to-accent text-transparent bg-clip-text">
                  {content.hero.highlightedText}
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-3xl">
              {content.hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded border border-border/50 bg-card/50 p-6 sm:p-10 backdrop-blur-sm space-y-8">
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary">
                {content.about.eyebrow}
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {content.about.title}
              </h2>
            </div>

            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-muted-foreground">
              {content.about.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="relative border-t border-border/30 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary sm:tracking-[0.3em]">
              {content.educationHeading.eyebrow}
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {content.educationHeading.title}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {content.educationHeading.description}
            </p>
          </div>

          <article className="mt-12 grid gap-6 border-y border-border/50 py-8 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 sm:py-10">
            <div className="flex items-start gap-3 sm:block sm:text-right">
              <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary sm:ml-auto sm:mb-3">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="pt-2 font-mono text-xs text-muted-foreground sm:pt-0">{content.education.period}</p>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary">
                  {content.education.degree}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{content.education.school}</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {content.education.major}
              </h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-border/50 bg-card/40 px-4 py-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">GPA</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{content.education.gpa}</p>
                </div>
                <div className="rounded-md border border-border/50 bg-card/40 px-4 py-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {locale === "zh" ? "专业排名" : "Class rank"}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{content.education.rank}</p>
                </div>
              </div>

              <div className="mt-6 max-w-3xl space-y-4 text-base leading-8 text-muted-foreground">
                {content.education.narrative.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {content.education.courses.length > 0 && (
                <div className="mt-6 border-t border-border/30 pt-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {locale === "zh" ? "主修课程" : "Selected coursework"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {content.education.courses.map((course) => (
                      <span
                        key={course.name}
                        className="rounded-md border border-border/50 bg-secondary/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {course.name} <span className="text-primary">{course.score}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary">
              {content.experienceHeading.eyebrow}
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {content.experienceHeading.title}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {content.experienceHeading.description}
            </p>
          </div>

          <div className="relative mt-12 space-y-0 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-border sm:before:left-[11.45rem]">
            {content.experiences.map((experience, index) => (
              <article
                key={`${experience.organization}-${experience.title}`}
                className="relative grid gap-4 pb-12 pl-10 last:pb-0 sm:grid-cols-[10rem_1.75rem_minmax(0,1fr)] sm:gap-4 sm:pl-0"
              >
                <div className="sm:pt-1 sm:text-right">
                  <p className="font-mono text-xs text-muted-foreground">{experience.period}</p>
                </div>

                <div className="absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-primary/50 bg-background sm:static sm:mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
                </div>

                <div
                  className={`pb-12 sm:pb-10 ${
                    index < content.experiences.length - 1 ? "border-b border-border/40" : ""
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary">
                      {experience.type}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{experience.organization}</span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {experience.title}
                  </h3>
                  <div className="mt-4 max-w-3xl space-y-4 text-base leading-8 text-muted-foreground">
                    {experience.summary.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {experience.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border/50 bg-secondary/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Capabilities */}
      <section className="relative border-t border-border/30 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary sm:tracking-[0.3em]">
              {content.capabilitiesHeading.eyebrow}
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {content.capabilitiesHeading.title}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {content.capabilitiesHeading.description}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.capabilities.map((capability) => {
              const Icon = capabilityIconMap[capability.icon]

              return (
                <div
                  key={capability.title}
                  className="group min-h-64 rounded-lg border border-border/50 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/60 hover:shadow-[0_18px_50px_-32px_var(--primary)]"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary transition-all duration-300 group-hover:border-primary/70 group-hover:bg-primary/15">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {capability.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {capability.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 border-t border-border/30 pt-4">
                    {capability.skills.map((skill) => (
                      <span key={skill} className="font-mono text-[11px] text-muted-foreground/90">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
