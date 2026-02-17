import type { Metadata } from 'next'
import {
  BentoGrid,
  CTASection,
  EmotionalSection,
  Footer,
  Header,
  HeroSection,
} from '@/components/landing'

export const metadata: Metadata = {
  title: 'Início',
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <BentoGrid />
        <EmotionalSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}
