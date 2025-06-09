import { createServerFn } from "@tanstack/react-start";
import { db } from "../../db";
import { auditLogs } from "../../db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";

const getAuditLogsSchema = z.object({
  entityType: z.enum(["ANNOUNCEMENT", "PRODUCT", "GIG", "PORTFOLIO"]).optional(),
  entityId: z.number().optional(),
  sellerId: z.number().optional()
});

type GetAuditLogsInput = z.infer<typeof getAuditLogsSchema>;

export const getAuditLogs = createServerFn({
  method: "GET",
  response: "data",
})
.validator((data: unknown): GetAuditLogsInput => {
  return getAuditLogsSchema.parse(data);
})
.handler(async (ctx) => {
  try {
   

    // Get all logs with relations
    const logs = await db.query.auditLogs.findMany({
      orderBy: (logs, { desc }) => [desc(logs.created_at)],
      with: {
        user: true,
        seller: true,
      },
    });

   

    return { success: true, logs };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return { success: false, error: "Failed to fetch audit logs" };
  }
}); 