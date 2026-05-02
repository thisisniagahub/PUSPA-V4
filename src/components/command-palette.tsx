'use client'

import { useMemo, useCallback, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/components/auth-provider'
import { useAppStore } from '@/stores/app-store'
import { canAccessView } from '@/lib/access-control'
import { normalizeUserRole } from '@/lib/auth-shared'
import { COMMAND_PALETTE_ITEMS, getVisibleCommandItems } from '@/lib/module-registry'
import { SIDEBAR_GROUPS } from '@/components/sidebar/sidebar-config'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import type { ViewId } from '@/types'

const SECTIONS = SIDEBAR_GROUPS.map((group) => ({
  heading: group.subGroup ? `${group.title} · ${group.subGroup}` : group.title,
  ids: group.items.map((item) => item.id),
}))

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setView } = useAppStore()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const effectiveRole = normalizeUserRole(user?.role)

  const visibleItems = useMemo(() => getVisibleCommandItems(effectiveRole), [effectiveRole])

  const handleSelect = useCallback(
    (viewId: ViewId) => {
      if (!canAccessView(viewId, effectiveRole)) return
      setView(viewId)
      setCommandPaletteOpen(false)
    },
    [effectiveRole, setView, setCommandPaletteOpen],
  )

  const filteredSections = useMemo(() => {
    const visibleIds = new Set(visibleItems.map((item) => item.id))
    const visibleSections = SECTIONS
      .map((section) => ({
        ...section,
        ids: section.ids.filter((id) => visibleIds.has(id)),
      }))
      .filter((section) => section.ids.length > 0)

    if (!query.trim()) return visibleSections

    const q = query.toLowerCase().trim()
    const matchingIds = new Set<ViewId>()

    COMMAND_PALETTE_ITEMS.forEach((item) => {
      const haystack = `${item.label} ${item.keywords.join(' ')} ${item.id}`.toLowerCase()
      if (haystack.includes(q)) matchingIds.add(item.id)
    })

    return visibleSections
      .map((section) => ({
        ...section,
        ids: section.ids.filter((id) => matchingIds.has(id)),
      }))
      .filter((section) => section.ids.length > 0)
  }, [visibleItems, query])

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <div className="flex items-center gap-2 px-4 pt-2 pb-1">
        <Image
          src="/puspa-logo-official.png"
          alt="PUSPA"
          width={22}
          height={22}
          className="h-auto w-auto object-contain"
        />
        <span className="text-xs font-semibold" style={{ color: '#4B0082' }}>PUSPA Command</span>
      </div>
      <CommandInput
        placeholder="Cari modul, ciri, atau tetapan..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Tiada hasil dijumpai.</CommandEmpty>
        {filteredSections.map((section) => (
          <CommandGroup key={section.heading} heading={section.heading}>
            {section.ids.map((id) => {
              const item = visibleItems.find((v) => v.id === id)
              if (!item) return null
              return (
                <CommandItem
                  key={id}
                  value={`${item.label} ${item.keywords.join(' ')}`}
                  onSelect={() => handleSelect(id)}
                >
                  <span className="font-medium">{item.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
