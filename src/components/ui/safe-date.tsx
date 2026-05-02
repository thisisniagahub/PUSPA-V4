'use client'

export function SafeDate({ date, formatOptions }: { date: Date | string | number, formatOptions?: Intl.DateTimeFormatOptions }) {
  const dateObj = new Date(date)
  const value = Number.isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleString('ms-MY', formatOptions)

  return <span suppressHydrationWarning>{value}</span>
}
