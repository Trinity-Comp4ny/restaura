'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ConsultaRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const consultaId = (params?.id as string) || ''

  useEffect(() => {
    router.replace(`/agenda/${consultaId}`)
  }, [consultaId, router])

  return null
}
