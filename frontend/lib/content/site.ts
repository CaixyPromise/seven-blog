import { cacheFileContent } from "./file-cache"
import { getContentSource } from "./source"
import type { HomePageContent, IntroductionPageContent, ProfileContent } from "./types"
import type { Locale } from "@/lib/i18n"

export type { HomePageContent, IntroductionPageContent, ProfileContent }

export async function getProfileContent(locale?: Locale): Promise<ProfileContent> {
  return cacheFileContent(
    { key: ["site", "profile", locale ?? "zh"], tags: ["site", "profile"], revalidate: 600 },
    () => getContentSource().getProfileContent(locale),
  )
}

export async function getHomePageContent(locale?: Locale): Promise<HomePageContent> {
  return cacheFileContent(
    { key: ["site", "home", locale ?? "zh"], tags: ["site", "home"], revalidate: 600 },
    () => getContentSource().getHomePageContent(locale),
  )
}

export async function getIntroductionPageContent(locale?: Locale): Promise<IntroductionPageContent> {
  return cacheFileContent(
    { key: ["site", "introduction", locale ?? "zh"], tags: ["site", "introduction"], revalidate: 600 },
    () => getContentSource().getIntroductionPageContent(locale),
  )
}
