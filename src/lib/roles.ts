import { z } from 'zod'

export const appRoleSchema = z.enum(['staff', 'admin', 'developer'])
export type AppRole = z.infer<typeof appRoleSchema>

export function canAssignRole(actorRole: AppRole, targetRole: AppRole): boolean {
  if (actorRole === 'developer') return true
  if (actorRole === 'admin') return targetRole === 'staff' || targetRole === 'admin'
  return false
}
