import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../../types';
import { Modal } from '../common/Modal';
import { FolderPlus, Save, Calendar, Building2, MapPin, ShieldCheck, UserCheck } from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'projectID'> & { projectID?: number }) => void;
  projectToEdit?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
}) => {
  const [projectCode, setProjectCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [location, setLocation] = useState('');
  const [authority, setAuthority] = useState('DEWA');
  const [status, setStatus] = useState<ProjectStatus>('IN_ESTIMATION');
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [assignedEstimator, setAssignedEstimator] = useState('Eng. Rajesh (Lead Estimator)');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setProjectCode(projectToEdit.projectCode);
      setProjectName(projectToEdit.projectName);
      setClientName(projectToEdit.clientName);
      setConsultantName(projectToEdit.consultantName || '');
      setLocation(projectToEdit.location);
      setAuthority(projectToEdit.authority || 'DEWA');
      setStatus(projectToEdit.status);
      setDueDate(projectToEdit.dueDate);
      setCurrency(projectToEdit.currency);
      setAssignedEstimator(projectToEdit.assignedEstimator);
      setNotes(projectToEdit.notes || '');
    } else {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100 + Math.random() * 900);
      setProjectCode(`PRJ-${year}-${randomNum}`);
      setProjectName('');
      setClientName('');
      setConsultantName('');
      setLocation('Dubai, UAE');
      setAuthority('DEWA');
      setStatus('IN_ESTIMATION');
      
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      setDueDate(in30Days.toISOString().split('T')[0]);
      setCurrency('AED');
      setAssignedEstimator('Eng. Rajesh (Lead Estimator)');
      setNotes('');
    }
  }, [projectToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      projectID: projectToEdit?.projectID,
      projectCode: projectCode.trim(),
      projectName: projectName.trim(),
      clientName: clientName.trim(),
      consultantName: consultantName.trim() || undefined,
      location: location.trim(),
      authority: authority.trim(),
      status,
      createdDate: projectToEdit?.createdDate || new Date().toISOString().split('T')[0],
      dueDate,
      currency,
      assignedEstimator,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? 'Edit Switchgear Project' : 'New Switchgear Project / RFQ Enquiry'}
      subtitle="Define tender project details, local electrical utility authority specs, and tender submission timeline"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Project Reference Code *</label>
            <input
              type="text"
              required
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:border-cyan-600 focus:outline-none"
              placeholder="e.g. PRJ-2026-004"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Electricity Authority / Standard *</label>
            <select
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
            >
              <option value="DEWA">DEWA (Dubai Electricity & Water Authority)</option>
              <option value="SEWA">SEWA (Sharjah Electricity, Water & Gas)</option>
              <option value="ADDC">ADDC / AADC (Abu Dhabi Distribution Co)</option>
              <option value="FEWA">FEWA / Etihad WE (Northern Emirates)</option>
              <option value="Kahramaa">Kahramaa (Qatar General Electricity)</option>
              <option value="SEC">SEC (Saudi Electricity Company)</option>
              <option value="IEC 61439">IEC 61439 Standard (General Industrial)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Project Name & Package Title *</label>
          <input
            type="text"
            required
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
            placeholder="e.g. Meydan Commercial Tower - Low Voltage Switchgear Package LV01"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Client / MEP Contractor *</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
              placeholder="e.g. Al Futtaim Engineering / ALEMCO"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Consulting Engineer</label>
            <input
              type="text"
              value={consultantName}
              onChange={(e) => setConsultantName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
              placeholder="e.g. Atkins / WSP / Khatib & Alami"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Project Site Location *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
              placeholder="e.g. Business Bay, Dubai, UAE"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tender Submission Due Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Lifecycle Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
            >
              <option value="DRAFT">DRAFT (Preliminary)</option>
              <option value="IN_ESTIMATION">IN_ESTIMATION (Active)</option>
              <option value="ESTIMATED">ESTIMATED (Completed)</option>
              <option value="QUOTED">QUOTED (Quotation Issued)</option>
              <option value="WON">WON (Order Received)</option>
              <option value="LOST">LOST (Closed)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Lead Switchgear Estimator</label>
            <input
              type="text"
              value={assignedEstimator}
              onChange={(e) => setAssignedEstimator(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Commercial Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
            >
              <option value="AED">AED - UAE Dirham</option>
              <option value="USD">USD - US Dollar</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="QAR">QAR - Qatari Riyal</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Engineering Notes & Specific Technical Clauses</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
            placeholder="e.g. Copper busbar tin plated per DEWA specification 4.1.2. Incomers require drawout type ACBs with Modbus RS485 communication."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold transition shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg flex items-center gap-2 transition shadow-2xs"
          >
            <Save className="w-4 h-4" />
            <span>{projectToEdit ? 'Save Changes' : 'Create Project'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
