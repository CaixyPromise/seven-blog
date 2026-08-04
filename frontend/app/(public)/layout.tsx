import { CursorGlow } from "@/components/cursor-glow";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getProfileContent } from "@/lib/content/site";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfileContent()

  return (
    <main className="relative min-h-screen overflow-x-clip scanlines">
      <CursorGlow />
      <div className="relative z-10">
        <Header socialLinks={profile.socialLinks} />
        {children}
        <Footer socialLinks={profile.socialLinks} />
      </div>
    </main>
  );
}
