"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SubmitState = "idle" | "submitting" | "success" | "error"

export function ContactForm() {
  const [state, setState] = useState<SubmitState>("idle")
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState("submitting")
    setError("")

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      body: String(formData.get("body") ?? ""),
      source: "contact-page",
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_INTERACTION_API_BASE_URL ?? "/interaction"

      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => undefined)) as { error?: string } | undefined
        throw new Error(body?.error ?? "Message submission failed.")
      }

      event.currentTarget.reset()
      setState("success")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Message submission failed.")
      setState("error")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border/50 bg-card/40 p-6 glass">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" required placeholder="Name" className="bg-background/50 border-border/50" />
        <Input name="email" required type="email" placeholder="Email" className="bg-background/50 border-border/50" />
      </div>
      <Input name="subject" placeholder="Subject" className="bg-background/50 border-border/50" />
      <textarea
        name="body"
        required
        rows={8}
        placeholder="What would you like to talk about?"
        className="flex min-h-32 w-full rounded-md border border-border/50 bg-background/50 px-3 py-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      />
      {state === "success" ? (
        <p className="font-mono text-xs text-primary">Message sent. I will reply by email.</p>
      ) : null}
      {state === "error" ? <p className="font-mono text-xs text-destructive">{error}</p> : null}
      <Button type="submit" disabled={state === "submitting"} className="w-full font-mono text-xs uppercase tracking-wider">
        {state === "submitting" ? "Sending..." : "Send message"}
      </Button>
    </form>
  )
}
