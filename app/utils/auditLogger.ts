import { db } from '../db'
import { auditLogs } from '../db/schema'
import { eq, and } from 'drizzle-orm'

type AuditLogAction = 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'ACTIVATE' | 'DELETE'
type AuditLogEntityType = 'ANNOUNCEMENT' | 'PRODUCT' | 'GIG' | 'PORTFOLIO'

interface AuditLogParams {
  userId: number
  sellerId: number
  entityType: AuditLogEntityType
  entityId: number
  action: AuditLogAction
  changes: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog({
  userId,
  sellerId,
  entityType,
  entityId,
  action,
  changes,
  ipAddress,
  userAgent
}: AuditLogParams) {
  try {
    await db.insert(auditLogs).values({
      user_id: userId,
      seller_id: sellerId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      changes: JSON.stringify(changes),
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export async function getAuditLogs(entityType: AuditLogEntityType, entityId: number) {
  try {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entity_type, entityType),
          eq(auditLogs.entity_id, entityId)
        )
      )
      .orderBy(auditLogs.created_at)
    
    return logs.map(log => ({
      ...log,
      changes: JSON.parse(log.changes)
    }))
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return []
  }
} 