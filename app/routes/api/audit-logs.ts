import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db'
import { auditLogs, users, sellers } from '../../db/schema'
import { eq, and, desc, sql, ilike } from 'drizzle-orm'
import { z } from 'zod'
import { validateAccessToken } from './auth'

const getAuditLogsSchema = z.object({
  entityType: z.enum(['ANNOUNCEMENT', 'PRODUCT', 'GIG', 'PORTFOLIO']).optional(),
  entityId: z.number().optional(),
  sellerId: z.number().optional(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional()
})

export const getAuditLogs = createServerFn({
  method: 'GET',
  response: 'data',
})
  .validator((data: unknown) => {
    return getAuditLogsSchema.parse(data)
  })
  .handler(async ({ data }) => {
    try {
     
      
      // --- Authorization Check --- 
      const authResult = await validateAccessToken();
      if (!authResult.success || !authResult.user) {
    
        return { success: false, error: 'Unauthorized: Invalid session' };
      }

      // Verify that the authenticated user is an admin
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(authResult.user.id, 10)))
        .limit(1)
        .then(res => res[0]);

   
      if (!user || !user.is_admin) {
        return { success: false, error: 'Forbidden: Only administrators can view audit logs' };
      }

      // First, let's get ALL logs without any filters
      const allLogs = await db
        .select()
        .from(auditLogs);


      // Now get the logs with user and seller information
      const logs = await db
        .select({
          id: auditLogs.id,
          created_at: auditLogs.created_at,
          user_id: auditLogs.user_id,
          seller_id: auditLogs.seller_id,
          entity_type: auditLogs.entity_type,
          entity_id: auditLogs.entity_id,
          action: auditLogs.action,
          changes: auditLogs.changes,
          ip_address: auditLogs.ip_address,
          user_agent: auditLogs.user_agent,
          user: {
            id: users.id,
            name: users.name,
            email: users.email
          },
          seller: {
            id: sellers.id,
            company_name: sellers.company_name
          }
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.user_id, users.id))
        .leftJoin(sellers, eq(auditLogs.seller_id, sellers.id))
        .where(
          and(
            data.entityType ? eq(auditLogs.entity_type, data.entityType) : undefined,
            data.entityId ? eq(auditLogs.entity_id, data.entityId) : undefined,
            data.sellerId ? eq(auditLogs.seller_id, data.sellerId) : undefined,
            data.action ? eq(auditLogs.action, data.action) : undefined,
            data.fromDate ? sql`${auditLogs.created_at} >= ${data.fromDate}` : undefined,
            data.toDate ? sql`${auditLogs.created_at} <= ${data.toDate}` : undefined
          )
        )
        .orderBy(desc(auditLogs.created_at));

     
      return {
        success: true,
        logs: logs.map(log => ({
          ...log,
          changes: JSON.parse(log.changes)
        }))
      }
    } catch (error) {
      console.error('=== AUDIT LOGS ERROR ===');
      console.error('Error fetching audit logs:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack)
      }
      console.error('=== END ERROR LOG ===');
      return { success: false, error: 'Failed to fetch audit logs' }
    }
  }) 