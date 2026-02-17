'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CreditCard, Building2, Wallet, Users, FileText, Settings,
  TrendingUp, ArrowUpRight, ArrowDownRight, PieChart,
  Calculator, DollarSign, Target, Briefcase, ArrowLeft
} from 'lucide-react'

import { useDocumentTitle } from '@/hooks/use-document-title'
import { FinanceiroContent } from '@/components/financeiro/financeiro-content'

export default function FinancialPage() {
  useDocumentTitle('Financeiro')
  return <FinanceiroContent />
}
