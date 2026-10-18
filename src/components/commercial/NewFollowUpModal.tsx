import React, { useState } from 'react';
import { Quotation, FollowUpActivity } from '../../types';
import { Calendar, Phone, Mail, Users, MapPin, MessageSquare, Clock, X, Check } from 'lucide-react';

interface NewFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotations: Quotation[];
  selectedQuotation?: Quotation | null;
  onSaveFollowUp: (activity: Omit<FollowUpActivity, 'id' | 'createdAt'>) => void;
}

export const NewFollowUpModal: React.FC<NewFollowUpModalProps> = ({
  isOpen,
  onClose,
  quotations,
  selectedQuotation,
  onSaveFollowUp,
}) => {
  const [quotationId, setQuotationId] = useState<number>(selectedQuotation?.quotationID || (quotations[0]?.quotationID || 1));
  const [channel, setChannel] = useState<'PHONE' | 'EMAIL' | 'MEETING' | 'SITE_VISIT' | 'WHATSAPP'>('PHONE');
  const [contactPerson, setContactPerson] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [nextActionNotes, setNextActionNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<string>('');

  if (!isOpen) return null;

  const currentQuote = quotations.find(q => q.quotationID === quotationId) || selectedQuotation || quotations[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuote) return;

    onSaveFollowUp({
      quotationID: currentQuote.quotationID,
      quotationNumber: currentQuote.quotationNumber,
      projectID: currentQuote.projectID,
      clientName: currentQuote.clientName,
      projectName: currentQuote.projectName,
      date,
      salesperson: currentQuote.salesperson || 'Commercial Sales Lead',
      contactPerson,
      channel,
      notes,
      nextActionDate: nextActionDate || undefined,
      nextActionNotes: nextActionNotes || undefined,
      statusUpdate: statusUpdate || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-600" />
              <span>Log Follow-Up Activity</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record customer discussion, next action date, and commercial status
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Select Quotation / Opportunity *</label>
            <select
              value={quotationId}
              onChange={(e) => setQuotationId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:border-cyan-600 focus:outline-none"
            >
              {quotations.map((q) => (
                <option key={q.quotationID} value={q.quotationID}>
                  {q.quotationNumber} — {q.clientName} ({q.projectName}) — {q.grandTotal.toLocaleString()} AED
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Interaction Channel *</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:border-cyan-600 focus:outline-none"
              >
                <option value="PHONE">Phone Call</option>
                <option value="EMAIL">Email Follow-Up</option>
                <option value="MEETING">Client Office Meeting</option>
                <option value="SITE_VISIT">Project Site Visit</option>
                <option value="WHATSAPP">WhatsApp / Direct Chat</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Activity Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Contact Person / Designation</label>
            <input
              type="text"
              placeholder="e.g. Eng. Tariq (Procurement Manager)"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Discussion & Feedback Summary *</label>
            <textarea
              required
              rows={3}
              placeholder="Summary of customer feedback, price resistance, consultant compliance feedback, or delivery requirement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 bg-cyan-50/50 p-3 rounded-xl border border-cyan-100">
            <div>
              <label className="block text-cyan-900 font-bold mb-1">Next Action Date</label>
              <input
                type="date"
                value={nextActionDate}
                onChange={(e) => setNextActionDate(e.target.value)}
                className="w-full bg-white border border-cyan-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-cyan-900 font-bold mb-1">Status Update</label>
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                className="w-full bg-white border border-cyan-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:border-cyan-600 focus:outline-none"
              >
                <option value="">Maintain Current ({currentQuote?.status})</option>
                <option value="SUBMITTED">Under Client Negotiation</option>
                <option value="ACCEPTED">PO Expected / Verbal Award</option>
                <option value="REJECTED">Tender Lost / Cancelled</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-cyan-900 font-medium mb-1">Next Action Notes</label>
              <input
                type="text"
                placeholder="e.g. Call back for final PO confirmation after commercial committee meeting"
                value={nextActionNotes}
                onChange={(e) => setNextActionNotes(e.target.value)}
                className="w-full bg-white border border-cyan-200 rounded-lg px-3 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Activity Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
