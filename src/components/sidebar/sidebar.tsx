'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
  Sparkles,
  Activity,
  Bell,
  Search,
  BarChart3,
  HeartPulse,
  Building2,
  Shield,
  Zap,
  Moon,
  Sun,
  MoreVertical,
  User,
  Users2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence, easeInOut, easeOut } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase/client'

const menuItems = [
  {
    title: 'Home',
    href: '/home',
    icon: Home,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Pacientes',
    href: '/pacientes',
    icon: Users,
  },
  {
    title: 'Agenda',
    href: '/agenda',
    icon: Calendar,
    disabled: true,
  },
  {
    title: 'Financeiro',
    href: '/financeiro',
    icon: DollarSign,
  },
  {
    title: 'Estoque',
    href: '/estoque',
    icon: Package,
    disabled: true,
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: TrendingUp,
    disabled: true,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(prefersDark)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSettings = () => {
    router.push('/configuracoes')
  }

  const handleProfile = () => {
    router.push('/configuracoes/perfil')
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Erro ao sair')
      return
    }
    toast.success('Até logo!')
    router.push('/login')
    router.refresh()
  }

  const sidebarVariants = {
    expanded: { width: '14rem', transition: { duration: 0.3, ease: easeInOut } },
    collapsed: { width: '3.5rem', transition: { duration: 0.3, ease: easeInOut } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: {
        delay: 0.05,
        duration: 0.2,
        ease: easeOut
      }
    }
  }

  if (!mounted) return null

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      className={cn(
        'relative flex h-screen flex-col border-r bg-sidebar transition-all duration-300 overflow-hidden',
        'border-sidebar-border'
      )}
    >
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-16 items-center justify-between px-3"
        >
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2"
              >
                <Link href="/home" className="group flex items-center space-x-2">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                  >
                    <span
                      role="img"
                      aria-label="Logomarca Restaura"
                      className="block h-7 w-7 rounded-sm bg-sidebar-primary"
                      style={{
                        mask: 'url(/logos/logo.svg) center / contain no-repeat',
                        WebkitMask: 'url(/logos/logo.svg) center / contain no-repeat',
                      }}
                    />
                  </motion.div>
                  <span className="text-lg font-bold text-sidebar-primary">Restaura</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'h-8 w-8 rounded-lg hover:bg-sidebar-accent transition-all duration-200',
                isCollapsed && 'mx-auto'
              )}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin">
          <AnimatePresence>
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href || 
    (item.href === '/agenda' && pathname.startsWith('/pacientes/') && document.referrer.includes('/agenda'))
              const isHovered = hoveredItem === item.href
              const isDisabled = item.disabled
              
              return (
                <motion.div
                  key={item.href}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                >
                  {isDisabled ? (
                    <div
                      onMouseEnter={() => !isDisabled && setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200',
                        'opacity-50 cursor-not-allowed text-sidebar-foreground/50',
                        isCollapsed && 'justify-center px-1'
                      )}
                    >
                      {/* Icon */}
                      <motion.div
                        className="relative flex h-5 w-5 items-center justify-center shrink-0"
                      >
                        <item.icon 
                          className="h-4 w-4 transition-colors duration-200 text-sidebar-foreground/40"
                        />
                      </motion.div>

                      {/* Content */}
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1"
                          >
                            <span className="font-medium text-sidebar-foreground/50">
                              {item.title}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href as any}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-sidebar-primary text-white shadow-sm'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer',
                        isCollapsed && 'justify-center px-1'
                      )}
                    >
                      {/* Icon */}
                      <motion.div
                        className="relative flex h-5 w-5 items-center justify-center shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <item.icon 
                          className={cn(
                            'h-4 w-4 transition-colors duration-200',
                            isActive 
                              ? 'text-white' 
                              : isHovered 
                                ? 'text-sidebar-primary' 
                                : 'text-sidebar-foreground'
                          )} 
                        />
                      </motion.div>

                      {/* Content */}
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1"
                          >
                            <span className={cn(
                              'font-medium',
                              isActive && 'text-white font-semibold'
                            )}>
                              {item.title}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </nav>

        {/* User section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="p-3"
        >
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between p-0 rounded-lg">
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent/50 rounded-md p-1 transition-colors duration-200"
                       onClick={handleProfile}>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src="/avatars/user.jpg" />
                      <AvatarFallback className="bg-sidebar-primary text-white text-xs font-medium">
                        DR
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-sidebar-foreground truncate">Dr. Silva</p>
                      <p className="text-xs text-sidebar-foreground/60 truncate">Premium</p>
                    </div>
                  </div>
                  
                  <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-1">
                      <DropdownMenuItem 
                        onClick={handleProfile} 
                        className="group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        <User className="h-4 w-4 transition-colors duration-200 group-hover:text-sidebar-primary" />
                        <span className="font-medium">Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push('/configuracoes/multi-clinicas')} 
                        className="group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        <Building2 className="h-4 w-4 transition-colors duration-200 group-hover:text-sidebar-primary" />
                        <span className="font-medium">Clínicas</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push('/configuracoes/equipe')} 
                        className="group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        <Users2 className="h-4 w-4 transition-colors duration-200 group-hover:text-sidebar-primary" />
                        <span className="font-medium">Equipe</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleSettings} 
                        className="group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        <Settings className="h-4 w-4 transition-colors duration-200 group-hover:text-sidebar-primary" />
                        <span className="font-medium">Configurações</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 opacity-50" />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4 transition-colors duration-200" />
                        <span className="font-medium">Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user.jpg" />
                  <AvatarFallback className="bg-sidebar-primary text-white text-sm font-medium">
                    DR
                  </AvatarFallback>
                </Avatar>
                
                <Separator className="w-8 opacity-50" />
                
                <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sidebar-accent transition-all duration-200"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1">
                    <DropdownMenuItem 
                      onClick={handleProfile} 
                      className="group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <User className="h-4 w-4 transition-colors duration-200 group-hover:text-sidebar-primary" />
                      <span className="font-medium">Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/configuracoes/multi-clinicas')} 
                      className="group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <Building2 className="h-4 w-4 transition-colors duration-200 group-hover:text-sidebar-primary" />
                      <span className="font-medium">Clínicas</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/configuracoes/equipe')} 
                      className="group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <Users2 className="h-4 w-4 transition-colors duration-200 group-hover:text-sidebar-primary" />
                      <span className="font-medium">Equipe</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleSettings} 
                      className="group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <Settings className="h-4 w-4 transition-colors duration-200 group-hover:text-sidebar-primary" />
                      <span className="font-medium">Configurações</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 opacity-50" />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 transition-colors duration-200" />
                      <span className="font-medium">Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.aside>
  )
}
