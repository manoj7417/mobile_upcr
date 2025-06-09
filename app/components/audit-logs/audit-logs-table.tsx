import { useQuery } from "@tanstack/react-query";
import { getAuditLogs, type AuditLog } from "../../lib/api/audit-logs";
import { formatDistanceToNow } from "date-fns";

export function AuditLogsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const response = await getAuditLogs({
        data: {}
      });
      return response;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const logs = data?.logs || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Action</th>
            <th className="px-4 py-2 text-left">User</th>
            <th className="px-4 py-2 text-left">Entity</th>
            <th className="px-4 py-2 text-left">Changes</th>
            <th className="px-4 py-2 text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log: AuditLog) => (
            <tr key={log.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-2">
                <div>
                  <div className="font-medium">{log.user.name}</div>
                  <div className="text-sm text-gray-500">{log.user.email}</div>
                </div>
              </td>
              <td className="px-4 py-2">
                <div>
                  <div className="font-medium">{log.entity_type}</div>
                  <div className="text-sm text-gray-500">ID: {log.entity_id}</div>
                </div>
              </td>
              <td className="px-4 py-2">
                <pre className="text-sm bg-gray-50 p-2 rounded">
                  {JSON.stringify(log.changes, null, 2)}
                </pre>
              </td>
              <td className="px-4 py-2 text-sm text-gray-500">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 