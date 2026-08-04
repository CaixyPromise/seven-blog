"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import type { Note } from "@/lib/content/notes"
import { getMessages, type Locale, withLocaleHref } from "@/lib/i18n"

interface LabNotesProps {
  notes: Note[]
  locale?: Locale
}

export function LabNotes({ notes, locale = "zh" }: LabNotesProps) {
  const copy = getMessages(locale).notes

  return (
    <section id="notes" className="px-4 sm:px-6 py-20 sm:py-28 border-t border-border/30">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 sm:mb-14 space-y-3 animate-fade-in-up">
          <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em] text-primary">{copy.eyebrow}</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{copy.title}</h2>
          <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            {copy.description}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {notes.map((note, index) => (
            <Link
              key={note.id}
              href={withLocaleHref(`/notes/${note.slug}`, locale)}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card/40 glass p-6 sm:p-7 transition-all duration-400 hover:border-primary/40 hover:bg-card/60 active:scale-[0.99] hover-lift animate-fade-in-up",
              )}
              style={{ animationDelay: `${index * 100 + 200}ms` }}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                  note.color,
                )}
              />

              <div className="relative z-10">
                <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-lg border border-border/80 bg-secondary/60 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors group-hover:border-primary/50 group-hover:text-foreground">
                    {note.category}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{note.date}</span>
                </div>

                <h3 className="mb-3 text-lg sm:text-xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-gradient">
                  {note.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground">{note.excerpt}</p>

                <div className="mt-5 flex items-center gap-2 font-mono text-xs text-primary transition-all duration-300 sm:opacity-0 sm:translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0">
                  <span>{copy.readMore}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-transparent transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
