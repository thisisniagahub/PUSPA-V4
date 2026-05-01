'use client'

import { useEffect, useState } from 'react'

export function SafeDate({ date, formatOptions }: { date: Date | string | number, formatOptions?: Intl.DateTimeFormatOptions }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className="invisible">...</span>
  }

  const dateObj = new Date(date)
  return <span>{dateObj.toLocaleString('ms-MY', formatOptions)}</span>
}
