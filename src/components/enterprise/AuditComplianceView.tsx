import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  Clock,
  User,
  Globe,
  Database,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ErrorState } from '../ui/EnterpriseUI';

interface AuditLogItem {
  id: string;
  tenantId: string | null;
  userId: string | null;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  timestamp: string;
}

export const AuditComplianceView: React.FC = () => {
  const { token, user, tenant } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.data)) {
        throw new Error(data.error?.message || `Unable to load audit records (${res.status})`);
      }
      setLogs(data.data);
      setRequestError(null);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to load audit records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [token]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEntity =
        selectedEntityFilter === 'all' ||
        log.entityType.toLowerCase() === selectedEntityFilter.toLowerCase();

      return matchesSearch && matchesEntity;
    });
  }, [logs, searchQuery, selectedEntityFilter]);

  // Export CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User Email', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.action,
      l.entityType,
      l.entityId,
      l.userEmail,
      l.ipAddress,
    ]);
    const escapeCsv = (value: string) => {
      const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replace(/"/g, '""')}"`;
    };
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n');
    const downloadUrl = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.setAttribute('href', downloadUrl);
    link.setAttribute('download', `eros_audit_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  };

  return (
    <div className="erp-page space-y-6 font-sans">
      
      {/* Top Compliance Ribbon */}
      {user?.role === 'AUDITOR' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Strict Compliance & Auditor Sandbox Active</span>
              <span>You are authenticated with read-only governance privileges. Menu configuration, cashier tenders, and staff edits are intentionally restricted.</span>
            </div>
          </div>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
            Auditor Mode
          </span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Governance & Security Trail
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
              Application audit log
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
            Enterprise Audit & Compliance Journal
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Review audit events recorded by the application. Available records depend on your workspace permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh logs</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredLogs.length === 0}
            className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/15 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Audit Log</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-stone-900/80 rounded-2xl border border-white/[0.06] backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, email, IP or ID..."
            className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400 font-medium">Entity Filter:</span>
          {['all', 'Tenant', 'Order', 'User', 'Storefront'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedEntityFilter(type)}
              className={`py-1.5 px-3 rounded-lg capitalize transition-all cursor-pointer font-medium ${
                selectedEntityFilter.toLowerCase() === type.toLowerCase()
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-stone-950/80 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {requestError && <ErrorState message={requestError} onRetry={() => void fetchAuditLogs()} />}

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-stone-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/90 border-b border-white/[0.06] text-stone-400 font-semibold uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-5">Timestamp (UTC)</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-4">Origin / User</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-5 text-right">Details Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-stone-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-500">
                    <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-500">
                    No audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-white/[0.02] transition-colors font-mono">
                        <td className="py-3.5 px-5 text-[11px] text-stone-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              log.action.includes('created') || log.action.includes('onboarded')
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : log.action.includes('status')
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                : 'bg-stone-800 text-stone-300 border border-stone-700'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{log.action}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-sans text-stone-200">
                          <span className="font-semibold">{log.entityType}</span>
                          <span className="text-[10px] text-stone-500 block font-mono">
                            {log.entityId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-sans">
                          <span className="text-white font-medium block">{log.userEmail}</span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            Tenant: {log.tenantId ? log.tenantId.substring(0, 14) + '...' : 'Platform Root'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-400">
                          {log.ipAddress}
                        </td>

                        <td className="py-3.5 px-5 text-right font-sans">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="py-1 px-2.5 text-[11px] font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable JSON Payload Inspector */}
                      {isExpanded && (
                        <tr className="bg-stone-950/80">
                          <td colSpan={6} className="p-4 px-6 border-y border-white/[0.06]">
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                                Recorded event details (#{log.id})
                              </span>
                              <pre className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
