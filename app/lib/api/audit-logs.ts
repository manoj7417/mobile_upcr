import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const getAuditLogsSchema = z.object({
  entityType: z.enum(['ANNOUNCEMENT', 'PRODUCT', 'GIG', 'PORTFOLIO']).optional(),
  entityId: z.number().optional(),
  sellerId: z.number().optional()
});

export type AuditLog = {
  id: number;
  created_at: string;
  user_id: number;
  seller_id: number;
  entity_type: 'ANNOUNCEMENT' | 'PRODUCT' | 'GIG' | 'PORTFOLIO';
  entity_id: number;
  action: string;
  changes: Record<string, any>;
  ip_address: string;
  user_agent: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  seller: {
    id: number;
    company_name: string;
  };
};

export const getAuditLogs = createServerFn({
  method: "GET",
  response: "data",
})
  .validator((data: unknown) => {
    return getAuditLogsSchema.parse(data);
  })
  .handler(async ({ data }) => {
    // This is a mock implementation
    return {
      success: true,
      logs: [
        {
          id: 1,
          created_at: new Date().toISOString(),
          user_id: 1,
          seller_id: 1,
          entity_type: 'ANNOUNCEMENT',
          entity_id: 1,
          action: 'CREATE',
          changes: { title: 'New Announcement' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          user: {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com'
          },
          seller: {
            id: 1,
            company_name: 'Example Corp'
          }
        },
        {
          id: 2,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_id: 2,
          seller_id: 2,
          entity_type: 'PRODUCT',
          entity_id: 1,
          action: 'UPDATE',
          changes: { price: 100 },
          ip_address: '192.168.1.2',
          user_agent: 'Mozilla/5.0',
          user: {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com'
          },
          seller: {
            id: 2,
            company_name: 'Smith Inc'
          }
        }
      ] as AuditLog[]
    };
  }); 