import {
  BentoGrid,
  CTASection,
  EmotionalSection,
  Footer,
  Header,
  HeroSection,
  PricingSection,
  SocialProof,
} from '@/components/landing'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <SocialProof />
        <BentoGrid />
        <EmotionalSection />
        <PricingSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}
