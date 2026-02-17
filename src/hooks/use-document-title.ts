'use client'

import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const formattedTitle = `Restaura | ${title}`
    document.title = formattedTitle
    
    return () => {
      document.title = 'Restaura'
    }
  }, [title])
}
