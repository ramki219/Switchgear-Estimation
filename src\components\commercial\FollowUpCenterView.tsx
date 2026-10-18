import React, { useState, useMemo } from 'react';
import { FollowUpActivity, Quotation } from '../../types';
import { 
  PhoneCall, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  Users, 
  MapPin, 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Check
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface FollowUpCenterViewProps {
  followUps: FollowUpActivity[];
  quotations: Quotation[];
  onOpenNewFollowUp: (quotation?: Quotation) => void;
  onSelectQuotation?: (quotationNumber: string) => void;
}

export const FollowUpCenterView: React.FC<FollowUpCenterViewProps> = ({
  followUps,
  quotations,
  onOpenNewFollowUp,
  onSelectQuotation,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'DUE_TODAY' | 'OVERDUE' | 'UPCOMING'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedRep, setSelectedRep] = useState('ALL');

  const today = '2026-10-16';

  const salespeople = useMemo(() => {
    const set = new Set<string>();
    followUps.forEach((f) => { if (f.salesperson) set.add(f.salesperson); });
    return Array.from(set);
  }, [followUps]);

  // Quotations awaiting follow-up
  const pendingQuoteFollowups = useMemo(() => {
    return quotations.filter((q) => {
      if (q.status === 'ACCEPTED' || q.status === 'REJECTED') return false;
      return q.nextFollowUpDate;
    });
  }, [quotations]);

  const overdueCount = pendingQuoteFollowups.filter((q) => q.nextFollowUpDate && q.nextFollowUpDate < today).length;
  const dueTodayCount = pendingQuoteFollowups.filter((q) => q.nextFollowUpDate === today).length;
  const upcomingCount = pendingQuoteFollowups.filter((q) => q.nextFollowUpDate && q.nextFollowUpDate > today).length;

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((f) => {
      if (selectedRep !== 'ALL' && f.salesperson !== selectedRep) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const match = f.clientName.toLowerCase().includes(term) ||
          f.projectName.toLowerCase().includes(term) ||
          f.quotationNumber.toLowerCase().includes(term) ||
          f.notes.toLowerCase().includes(term) ||
          f.salesperson.toLowerCase().includes(term);
        if (!match) return false;
      }
      return true;
    });
  }, [followUps, selectedRep, search]);

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'PHONE': return <PhoneCall className="w-3.5 h-3.5 text-blue-600" />;
      case 'MEETING': return <Users className="w-3.5 h-3.5 text-indigo-600" />;
      case 'EMAIL': return <Mail className="w-3.5 h-3.5 text-amber-600" />;
      case 'SITE_VISIT': return <MapPin className="w-3.5 h-3.5 text-emerald-600" />;
      case 'WHATSAPP': return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <PhoneCall className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Commercial Follow-Up & Action Center</h2>
              <p className="text-xs text-slate-500">
                Log and monitor client discussions, consultant technical reviews, price clarifications, and scheduled reminders.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenNewFollowUp()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Follow-Up Activity</span>
        </button>
      </div>

      {/* 3 Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterTab('DUE_TODAY')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterTab === 'DUE_TODAY' ? 'bg-amber-50/70 border-amber-500 shadow-xs ring-1 ring-amber-400' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-mono font-bold text-amber-800">Due Today</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{dueTodayCount}</div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Action items scheduled for today ({today})
          </p>
        </div>

        <div 
          onClick={() => setFilterTab('OVERDUE')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterTab === 'OVERDUE' ? 'bg-red-50/70 border-red-500 shadow-xs ring-1 ring-red-400' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-mono font-bold text-red-800">Overdue Follow-ups</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-700">{overdueCount}</div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Quotations requiring immediate salesperson follow-up
          </p>
        </div>

        <div 
          onClick={() => setFilterTab('UPCOMING')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterTab === 'UPCOMING' ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-400' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-mono font-bold text-blue-800">Upcoming Pipeline Actions</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{upcomingCount}</div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Follow-up dates planned for next week
          </p>
        </div>
      </div>

      {/* Overdue & Urgent Quotation Reminders */}
      {(filterTab === 'ALL' || filterTab === 'OVERDUE' || filterTab === 'DUE_TODAY') && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Pending Action Schedule ({pendingQuoteFollowups.length} Quotations)</span>
            </h3>
            {filterTab !== 'ALL' && (
              <button
                onClick={() => setFilterTab('ALL')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Show All Follow-ups
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                  <th className="pb-2 font-semibold">Scheduled Date</th>
                  <th className="pb-2 font-semibold">Quote Ref</th>
                  <th className="pb-2 font-semibold">Project & Client</th>
                  <th className="pb-2 font-semibold">Salesperson</th>
                  <th className="pb-2 font-semibold text-right">Value (AED)</th>
                  <th className="pb-2 font-semibold text-center">Urgency</th>
                  <th className="pb-2 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingQuoteFollowups
                  .filter((q) => {
                    if (filterTab === 'OVERDUE') return q.nextFollowUpDate && q.nextFollowUpDate < today;
                    if (filterTab === 'DUE_TODAY') return q.nextFollowUpDate === today;
                    return true;
                  })
                  .map((q) => {
                    const isOverdue = q.nextFollowUpDate && q.nextFollowUpDate < today;
                    const isDueToday = q.nextFollowUpDate === today;
                    return (
                      <tr key={q.quotationID} className="hover:bg-slate-50/70">
                        <td className="py-2.5 font-bold">
                          <span className={isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-700' : 'text-slate-700'}>
                            {q.nextFollowUpDate}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-blue-700">
                          {q.quotationNumber}
                        </td>
                        <td className="py-2.5 max-w-[220px] truncate">
                          <span className="font-bold text-slate-900 block truncate">{q.projectName}</span>
                          <span className="text-slate-500 text-[10px] block truncate">{q.clientName}</span>
                        </td>
                        <td className="py-2.5 text-slate-600 truncate max-w-[150px]">
                          {q.salesperson?.split(' (')[0] || '—'}
                        </td>
                        <td className="py-2.5 text-right font-bold text-slate-900">
                          {q.grandTotal.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-center">
                          {isOverdue ? (
                            <Badge variant="danger" size="sm">OVERDUE</Badge>
                          ) : isDueToday ? (
                            <Badge variant="amber" size="sm">DUE TODAY</Badge>
                          ) : (
                            <Badge variant="blue" size="sm">UPCOMING</Badge>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => onOpenNewFollowUp(q)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold transition"
                          >
                            Log Contact
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Log of Completed Client Interactions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <h3 className="text-xs font-bold font-mono uppercase text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Commercial Interaction Activity History ({filteredFollowUps.length})</span>
          </h3>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Sales Representatives</option>
              {salespeople.map((name) => (
                <option key={name} value={name}>{name.split(' (')[0]}</option>
              ))}
            </select>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes / client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredFollowUps.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100">
                    {getChannelIcon(item.channel)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{item.clientName}</span>
                    <span className="text-slate-400 font-mono text-[11px] ml-2">({item.projectName})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                  <span>{item.date}</span>
                  <span>•</span>
                  <span className="font-semibold text-blue-700">{item.salesperson.split(' (')[0]}</span>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed font-sans">{item.notes}</p>

              {(item.nextActionDate || item.nextActionNotes) && (
                <div className="mt-2 bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5 text-[11px] font-mono text-amber-900 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Next Action ({item.nextActionDate || 'Pending'}): </span>
                    <span>{item.nextActionNotes || 'Follow up with procurement team'}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
