import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
      {/* Background patterns - igual à landing */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Glows - igual à landing */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-[440px] w-[440px] rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[440px] w-[440px] rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Link href="/" className="absolute left-6 top-6 flex items-center gap-2 group sm:left-10 sm:top-10">
          <div className="relative h-9 w-9 overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
            <Image src="/logos/logo.svg" alt="Restaura" className="h-7 w-7" width={28} height={28} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Restaura</span>
        </Link>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
