"use client"

import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Github, Mail } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { ThemeChanger } from "./theme-changer"
import Link from "next/link"
import { getMessages, parseLocale, withLocaleHref } from "@/lib/i18n"
import type { ProfileContent } from "@/lib/content/types"

const navItems = [
  { key: "home", href: "/" },
  { key: "projects", href: "/projects" },
  { key: "notes", href: "/notes" },
  { key: "workbench", href: "/workbench" },
  { key: "blog", href: "/blog" },
] as const

const socialIconMap = { github: Github, email: Mail }

function getBrandParts(brandName: string) {
  const normalized = brandName.trim() || "CaixyPromise"

  // Keep camel-case brands visually balanced while allowing any configured name.
  if (/^[A-Za-z]+$/.test(normalized) && /[a-z][A-Z]/.test(normalized)) {
    return normalized.split(/(?=[A-Z])/)
  }

  return [normalized]
}

export function Header({
  brandName = "CaixyPromise",
  socialLinks = [],
}: {
  brandName?: ProfileContent["brandName"]
  socialLinks?: ProfileContent["socialLinks"]
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = parseLocale(searchParams.get("lang"))
  const copy = getMessages(locale)
  const nextLocale = locale === "zh" ? "en" : "zh"
  const languageHref = nextLocale === "zh" ? pathname : `${pathname}?lang=en`
  const headerSocialLinks = socialLinks.filter((link) => link.visibleInHeader && link.platform in socialIconMap)
  const brandParts = getBrandParts(brandName)

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm" : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="brand-mark-shell relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg p-1.5 transition-all duration-400 group-hover:scale-105 group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/25">
              <img src="/brand-mark.png" alt={`${brandName} logo`} className="relative z-10 h-full w-full object-contain" />
            </div>
            <span className="font-mono text-sm tracking-tight" aria-label={brandName}>
              {brandParts.map((part, index) => (
                <span
                  key={`${part}-${index}`}
                  className={index === 0 ? "text-foreground" : "bg-gradient-to-l from-primary/50 to-accent bg-clip-text text-transparent font-semibold"}
                >
                  {part.toUpperCase()}
                </span>
              ))}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item, index) => (
              <Link
                key={item.key}
                href={withLocaleHref(item.href, locale)}
                className={cn(
                  "relative px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-all duration-300 rounded-lg",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  hoveredIndex === index && !isActive(item.href) && "text-foreground",
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span
                  className={cn(
                    "absolute left-1.5 text-primary transition-all duration-200",
                    isActive(item.href)
                      ? "opacity-100 translate-x-0"
                      : hoveredIndex === index
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2",
                  )}
                >
                  {">"}
                </span>
                <span
                  className={cn(
                    "transition-transform duration-200",
                    (hoveredIndex === index || isActive(item.href)) && "translate-x-2",
                  )}
                >
                  {copy.nav[item.key]}
                </span>
                <span
                  className={cn(
                    "absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300",
                    isActive(item.href) ? "w-6" : hoveredIndex === index ? "w-6" : "w-0",
                  )}
                />
              </Link>
            ))}
            <div className="ml-2 flex items-center gap-1">
              <Link
                href={languageHref}
                className="rounded-lg border border-border/60 px-2.5 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                aria-label="Switch language"
              >
                {locale === "zh" ? "EN" : "中文"}
              </Link>
              <ThemeChanger />
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-1 sm:flex">
              {headerSocialLinks.map((link) => {
                const Icon = socialIconMap[link.platform as keyof typeof socialIconMap]
                return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="group relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:text-primary hover:bg-primary/10"
                >
                  <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-card border border-border px-2.5 py-1 font-mono text-[10px] text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-bottom-9 pointer-events-none shadow-lg">
                    {link.label}
                  </span>
                </a>
                )
              })}
            </div>

            <div className="hidden h-5 w-px bg-border sm:block" />

            <div className="hidden items-center gap-2.5 font-mono text-xs text-muted-foreground sm:flex px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span>{copy.nav.status}</span>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/50 md:hidden transition-colors hover:bg-secondary"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col gap-1.5 w-5">
                <span
                  className={cn(
                    "h-0.5 bg-foreground transition-all duration-300 origin-center",
                    isMobileMenuOpen ? "w-5 translate-y-2 rotate-45" : "w-5",
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 w-3.5 bg-foreground transition-all duration-300",
                    isMobileMenuOpen && "opacity-0 translate-x-2",
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 bg-foreground transition-all duration-300 origin-center",
                    isMobileMenuOpen ? "w-5 -translate-y-2 -rotate-45" : "w-5",
                  )}
                />
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            " transition-all duration-400 md:hidden bg-background",
            isMobileMenuOpen ? "max-h-96 opacity-100 pt-4" : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-col gap-1 border-t border-border/50 pt-4">
            {navItems.map((item, index) => (
              <Link
                key={item.key}
                href={withLocaleHref(item.href, locale)}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3.5 font-mono text-sm uppercase tracking-widest text-muted-foreground transition-all duration-200 active:bg-secondary hover:text-foreground hover:bg-secondary/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-primary">{">"}</span>
                {copy.nav[item.key]}
              </Link>
            ))}

            <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-4 px-4">
              {headerSocialLinks.map((link) => {
                const Icon = socialIconMap[link.platform as keyof typeof socialIconMap]
                return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors active:bg-secondary hover:border-primary/50 hover:text-primary hover:bg-primary/10"
                >
                  <Icon className="h-4 w-4" />
                </a>
                )
              })}
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/50">
                <Link href={languageHref} className="font-mono text-[11px] uppercase text-muted-foreground">
                  {locale === "zh" ? "EN" : "中"}
                </Link>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/50">
                <ThemeChanger />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/50">
                <ThemeToggle />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2.5 px-4 py-3 font-mono text-xs text-muted-foreground bg-secondary/30 rounded-lg mx-4 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span>{copy.nav.status}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
