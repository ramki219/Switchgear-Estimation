import React from 'react';
import { AuditLogEntry } from '../../types';
import { History, ShieldCheck, User } from 'lucide-react';
import { Badge } from '../common/Badge';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-purple-600" />
          <span>System Audit Log & Traceability Trail</span>
        </h3>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Immutable historical audit records from SQL Server schema <code className="text-cyan-700 font-mono">audit.AuditLog</code>
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] text-slate-600 uppercase bg-slate-50">
              <th className="py-3 px-4">Audit ID</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Target Table & ID</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Old Value (Previous State)</th>
              <th className="py-3 px-4">New Value (Updated State)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.auditID} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 text-slate-500">
                  #{log.auditID}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-slate-800">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{log.userID}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-cyan-800 font-semibold">
                  {log.tableName} (ID: {log.recordID})
                </td>
                <td className="py-3 px-4">
                  <Badge 
                    variant={
                      log.action === 'PRICE_REVISION' ? 'warning' :
                      log.action === 'INSERT_PRICE' ? 'success' :
                      log.action.includes('DELETE') ? 'danger' : 'info'
                    }
                  >
                    {log.action}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                  {log.oldValue || '-'}
                </td>
                <td className="py-3 px-4 text-emerald-700 font-medium max-w-sm truncate text-[11px]">
                  {log.newValue || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
