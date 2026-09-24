import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus } from '../../types';
import { Badge } from '../common/Badge';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Calculator, 
  FileText, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  Calendar, 
  Building2, 
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  MapPin
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onSelectProjectForEstimation: (project: Project) => void;
  onSelectProjectForQuotation: (project: Project) => void;
  onSelectProjectForBOM: (project: Project) => void;
  onOpenNewProject: () => void;
  onOpenEditProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onSelectProjectForEstimation,
  onSelectProjectForQuotation,
  onSelectProjectForBOM,
  onOpenNewProject,
  onOpenEditProject,
  onDeleteProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      const matchSearch = !searchTerm ||
        p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [projects, selectedStatus, searchTerm]);

  // Aggregate pipeline metrics
  const totalPipelineValue = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.sellingPrice || 0), 0);
  }, [projects]);

  const activeEstimatesCount = useMemo(() => {
    return projects.filter(p => p.status === 'IN_ESTIMATION' || p.status === 'ESTIMATED').length;
  }, [projects]);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="neutral" size="sm">DRAFT</Badge>;
      case 'IN_ESTIMATION':
        return <Badge variant="cyan" size="sm">IN ESTIMATION</Badge>;
      case 'ESTIMATED':
        return <Badge variant="blue" size="sm">ESTIMATED</Badge>;
      case 'QUOTED':
        return <Badge variant="purple" size="sm">QUOTED</Badge>;
      case 'WON':
        return <Badge variant="emerald" size="sm">ORDER WON</Badge>;
      case 'LOST':
        return <Badge variant="amber" size="sm">CLOSED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getAuthorityBadge = (auth: string) => {
    if (auth.includes('DEWA')) return <Badge variant="emerald" size="sm">DEWA</Badge>;
    if (auth.includes('SEWA')) return <Badge variant="blue" size="sm">SEWA</Badge>;
    if (auth.includes('ADDC')) return <Badge variant="purple" size="sm">ADDC</Badge>;
    if (auth.includes('FEWA')) return <Badge variant="amber" size="sm">FEWA</Badge>;
    if (auth.includes('Kahramaa')) return <Badge variant="cyan" size="sm">Kahramaa</Badge>;
    return <Badge variant="neutral" size="sm">{auth}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Enquiries</span>
            <FolderGit2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-slate-100">{projects.length}</div>
          <span className="text-[11px] text-slate-500 font-mono">Tenders & Client RFQs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Active Estimations</span>
            <Calculator className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-amber-400">{activeEstimatesCount}</div>
          <span className="text-[11px] text-slate-500 font-mono">Under engineering sizing</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Panels</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-purple-400">
            {projects.reduce((sum, p) => sum + (p.panelsCount || 0), 0)}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">MDB, SMDB, MCC, APFC</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Tender Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-emerald-400">
            {totalPipelineValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs font-normal">AED</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Estimated commercial volume</span>
        </div>
      </div>

      {/* Control Bar: Filters & Action Button */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by code, project, client, consultant, authority..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded pl-8 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses ({projects.length})</option>
            <option value="IN_ESTIMATION">In Estimation</option>
            <option value="ESTIMATED">Estimated</option>
            <option value="QUOTED">Quoted</option>
            <option value="WON">Won (Order)</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        <button
          onClick={onOpenNewProject}
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-4 py-2 rounded font-bold flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Project / Tender</span>
        </button>
      </div>

      {/* Projects List Grid */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-slate-500 font-mono">
            No projects match the current filter or search criteria.
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div
              key={p.projectID}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-5 transition flex flex-col md:flex-row justify-between gap-4 font-mono"
            >
              {/* Left Column: Project Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-cyan-400 text-sm">{p.projectCode}</span>
                  {getStatusBadge(p.status)}
                  {getAuthorityBadge(p.authority)}
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {p.dueDate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 hover:text-cyan-300 transition">
                  {p.projectName}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">Client: <strong className="text-slate-200">{p.clientName}</strong></span>
                  </div>
                  {p.consultantName && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Consultant:</span>
                      <span className="text-slate-300 truncate">{p.consultantName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Location: {p.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Estimator:</span>
                    <span className="text-slate-300">{p.assignedEstimator}</span>
                  </div>
                </div>

                {p.notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/70 p-2 rounded border border-slate-800/80">
                    {p.notes}
                  </p>
                )}
              </div>

              {/* Middle Column: Commercial & Panel Metrics */}
              <div className="flex sm:flex-col justify-between sm:justify-center items-end bg-slate-950 p-4 rounded-lg border border-slate-800/80 min-w-[200px]">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Switchboard Panels</span>
                  <span className="text-lg font-bold text-purple-400 flex items-center justify-end gap-1.5">
                    <Layers className="w-4 h-4" />
                    {p.panelsCount || 0} Panels
                  </span>
                </div>

                <div className="text-right mt-2 pt-2 border-t border-slate-800 w-full">
                  <span className="text-[11px] text-slate-400 block">Tender Value</span>
                  <span className="text-base font-bold text-emerald-400">
                    {(p.sellingPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {p.currency}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Direct Cost: {(p.totalCost || 0).toLocaleString()} {p.currency}
                  </span>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex sm:flex-col justify-center gap-2">
                <button
                  onClick={() => onSelectProjectForEstimation(p)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-3 py-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  title="Configure panels, breakers, copper busbars & labour"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Estimation Engine</span>
                </button>

                <button
                  onClick={() => onSelectProjectForQuotation(p)}
                  className="bg-purple-900/60 hover:bg-purple-800/70 text-purple-200 border border-purple-700/50 px-3 py-1.5 rounded font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Quotation</span>
                </button>

                <button
                  onClick={() => onSelectProjectForBOM(p)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Bill of Materials</span>
                </button>

                <div className="flex gap-1 justify-end pt-1">
                  <button
                    onClick={() => onOpenEditProject(p)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 transition"
                    title="Edit project"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteProject(p.projectID)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
