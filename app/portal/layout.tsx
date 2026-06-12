import PortalNav from "@/components/PortalNav"

// Portal Ibu (Hamil & Postpartum) — antarmuka mandiri, terpisah dari area klinis (/app).
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <PortalNav />
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}
