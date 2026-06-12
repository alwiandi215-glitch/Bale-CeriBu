import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BALE CERIBU — Kesehatan Jiwa Ibu",
  description:
    "Platform digital skrining & manajemen kesehatan jiwa ibu hamil dan postpartum berbasis EPDS.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
