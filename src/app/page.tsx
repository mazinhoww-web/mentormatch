import { AuroraBackground } from "@/components/landing/AuroraBackground"
import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { TrustBar } from "@/components/landing/TrustBar"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Footer } from "@/components/landing/Footer"

export default function HomePage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden text-[#EDEDEF] antialiased"
      style={{
        background: "#08080d",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <AuroraBackground />
      <Navbar />
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <FeaturesGrid />
      <FinalCTA />
      <Footer />
    </div>
  )
}
