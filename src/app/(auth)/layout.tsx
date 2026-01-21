import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="relative flex min-h-screen flex-col items-center justify-center py-12 px-4">
        <Link
          href="/"
          className="absolute left-4 top-4 flex items-center space-x-2 md:left-8 md:top-8"
        >
          <Image src="/logos/logo.svg" alt="Restaura" className="h-8 w-8" width={32} height={32} />
          <span className="text-xl font-bold">Restaura</span>
        </Link>
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}
