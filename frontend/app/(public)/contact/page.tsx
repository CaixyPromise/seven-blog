import { ContactForm } from "@/components/contact-form"
import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eindev.ir"

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a message about collaborations, projects, or technical conversations.",
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
}

export default function ContactPage() {
  return (
    <section className="px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-5">
          <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em] text-primary">Contact</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
            Send a signal
          </h1>
          <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            Use this form for collaborations, project questions, and technical conversations. Your message is stored
            locally and forwarded by email.
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  )
}
