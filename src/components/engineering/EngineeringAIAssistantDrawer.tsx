// ============================================================================
// ENGINEERING AI ASSISTANT DRAWER (IEC Certified Decision Intelligence)
// Explains engineering calculations, breaker sizing, fault levels & standards
// ============================================================================

import React, { useState } from 'react';
import { SLDTopology } from '../../types/engineering';
import { Component } from '../../types';
import { AIEngineeringAssistantService, AssistantResponse } from '../../services/aiEngineeringAssistantService';
import { 
  Bot, 
  Send, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Database, 
  Layers, 
  BookOpen,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface EngineeringAIAssistantDrawerProps {
  topology: SLDTopology;
  catalog: Component[];
  onApplyAction?: (action: any) => void;
}

export const EngineeringAIAssistantDrawer: React.FC<EngineeringAIAssistantDrawerProps> = ({
  topology,
  catalog,
  onApplyAction,
}) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{ query: string; response: AssistantResponse }[]>([
    {
      query: 'Why did you select this 4000A ACB?',
      response: AIEngineeringAssistantService.processQuery('Why did you select this ACB?', topology, catalog),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    setIsThinking(true);
    setTimeout(() => {
      const resp = AIEngineeringAssistantService.processQuery(q, topology, catalog);
      setHistory(prev => [...prev, { query: q, response: resp }]);
      setQuery('');
      setIsThinking(false);
    }, 300);
  };

  const samplePrompts = [
    'Why did you select this 4000A ACB?',
    'What happens if I change the fault level to 50kA?',
    'What happens if I increase fault level to 85kA?',
    'Change all MCCBs to Schneider',
    'Explain the ATS control philosophy & interlocking',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-[640px] shadow-xs font-mono text-xs overflow-hidden">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Engineering AI Design Assistant
              <span className="text-[9px] bg-cyan-100 text-cyan-800 px-1.5 py-0.2 rounded font-bold">
                IEC 61439 Engine
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 font-sans">
              Verifiable mathematical reasoning grounded in master SQL database and international standards.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-200 flex flex-wrap gap-1.5">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[10px] px-2.5 py-1 bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 rounded-full border border-slate-200 transition shadow-2xs font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((h, i) => (
          <div key={i} className="space-y-2">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-cyan-600 text-white px-3.5 py-2 rounded-xl rounded-tr-none max-w-lg shadow-2xs">
                {h.query}
              </div>
            </div>

            {/* Assistant response */}
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl rounded-tl-none max-w-2xl space-y-3 shadow-xs">
                <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                  {h.response.answer}
                </div>

                {/* Standards cited */}
                {h.response.citedStandards && h.response.citedStandards.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-cyan-600" />
                      <span>Standards Cited:</span>
                    </span>
                    {h.response.citedStandards.map(std => (
                      <span key={std} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[9px] font-bold">
                        {std}
                      </span>
                    ))}
                  </div>
                )}

                {/* Database tables referenced */}
                {h.response.databaseRecordsReferenced && h.response.databaseRecordsReferenced.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <Database className="w-3 h-3 text-emerald-600" />
                      <span>SQL Records:</span>
                    </span>
                    {h.response.databaseRecordsReferenced.map(rec => (
                      <span key={rec} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold">
                        {rec}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Action button */}
                {h.response.suggestedAction && (
                  <div className="pt-2 border-t border-slate-200">
                    <button
                      onClick={() => onApplyAction && onApplyAction(h.response.suggestedAction)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition flex items-center gap-1.5 text-xs shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply Switchgear Configuration Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-cyan-700 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Analyzing engineering master database and IEC standards...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask engineering assistant (e.g. 'Why 4000A ACB?', 'Change all MCCBs to Siemens')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-slate-900 focus:outline-hidden focus:border-cyan-600 text-xs"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
