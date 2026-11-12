import React, { useState } from 'react';
import { UoELinkItem, UserProfile } from '../types';
import { 
  GraduationCap, 
  Monitor, 
  Headphones, 
  CreditCard, 
  BookOpen, 
  ShieldAlert, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  Copy, 
  HelpCircle,
  FileQuestion,
  PhoneCall
} from 'lucide-react';

interface CampusPortalsProps {
  links: UoELinkItem[];
  currentUser: UserProfile;
}

export const CampusPortals: React.FC<CampusPortalsProps> = ({ links, currentUser }) => {
  const [selectedLink, setSelectedLink] = useState<UoELinkItem | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-emerald-800" />;
      case 'Monitor':
        return <Monitor className="w-6 h-6 text-sky-800" />;
      case 'Headphones':
        return <Headphones className="w-6 h-6 text-purple-800" />;
      case 'CreditCard':
        return <CreditCard className="w-6 h-6 text-amber-800" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-teal-800" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-rose-800" />;
      default:
        return <GraduationCap className="w-6 h-6 text-emerald-800" />;
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              University of Eldoret Essential Links
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">Official Student Systems</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            UoE Student Portals & E-Campus Help Hub
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Direct access to the university ERP student portal, E-Campus Moodle LMS, official fee payment paybill, past exam paper repository, and campus ICT support.
          </p>
        </div>

        {/* Campus Support Badge */}
        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
            ICT
          </div>
          <div className="text-xs">
            <span className="text-emerald-950 font-bold block">UoE Student Support</span>
            <span className="text-stone-600 text-[11px] block">ictsupport@uoeld.ac.ke</span>
            <span className="text-emerald-700 text-[10px] block">Science Complex 1st Floor</span>
          </div>
        </div>
      </div>

      {/* Grid of Link Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {links.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-stone-200 hover:border-emerald-600/50 hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-stone-100">
                  {getIcon(item.iconName)}
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                  {item.badge}
                </span>
              </div>

              <h3 className="font-bold text-stone-900 text-base mb-1">
                {item.title}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                {item.description}
              </p>

              {item.importantInfo && (
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-700 font-medium mb-3">
                  {item.importantInfo}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedLink(item)}
                className="text-xs font-semibold text-stone-600 hover:text-emerald-800 flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help & Guide</span>
              </button>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
              >
                <span>{item.actionText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Fee Payment Breakdown Section */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-stone-900 mb-2">
          University of Eldoret Verified Fee Payment Details
        </h3>
        <p className="text-xs text-stone-600 mb-4 leading-relaxed">
          Always ensure you pay tuition and examination fees only through official University of Eldoret channels. Never pay cash to individuals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* M-Pesa Paybill */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <span className="font-bold text-emerald-950 block text-sm mb-1">
              M-Pesa Lipa na M-Pesa
            </span>
            <div className="space-y-1 font-mono text-stone-800 mt-2">
              <div>Business No: <strong className="text-emerald-900">837400</strong></div>
              <div>Account No: <strong>{currentUser.regNumber}</strong></div>
            </div>
            <button
              onClick={() => handleCopy('837400', 'paybill')}
              className="mt-3 text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedItem === 'paybill' ? 'Copied Paybill!' : 'Copy Paybill 837400'}</span>
            </button>
          </div>

          {/* National Bank */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
            <span className="font-bold text-stone-900 block text-sm mb-1">
              National Bank of Kenya (NBK)
            </span>
            <div className="space-y-1 text-stone-700 mt-2">
              <div>Branch: <strong>Eldoret Branch</strong></div>
              <div className="font-mono">Account No: <strong>0102107336100</strong></div>
            </div>
            <button
              onClick={() => handleCopy('0102107336100', 'nbk')}
              className="mt-3 text-[11px] font-semibold text-stone-700 hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedItem === 'nbk' ? 'Copied NBK A/C!' : 'Copy Account Number'}</span>
            </button>
          </div>

          {/* Co-op Bank */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
            <span className="font-bold text-stone-900 block text-sm mb-1">
              Co-operative Bank of Kenya
            </span>
            <div className="space-y-1 text-stone-700 mt-2">
              <div>Branch: <strong>Eldoret Branch</strong></div>
              <div className="font-mono">Account No: <strong>01129183170000</strong></div>
            </div>
            <button
              onClick={() => handleCopy('01129183170000', 'coop')}
              className="mt-3 text-[11px] font-semibold text-stone-700 hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedItem === 'coop' ? 'Copied Co-op A/C!' : 'Copy Account Number'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide / Help Modal */}
      {selectedLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-300 font-bold block">{selectedLink.badge}</span>
                <h3 className="text-base font-bold text-white">{selectedLink.title} Guide</h3>
              </div>
              <button
                onClick={() => setSelectedLink(null)}
                className="text-emerald-300 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                {selectedLink.description}
              </p>

              {selectedLink.helpSteps && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    Step-by-Step Instructions:
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-700">
                    {selectedLink.helpSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedLink.importantInfo && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 font-medium">
                  {selectedLink.importantInfo}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  onClick={() => setSelectedLink(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Close
                </button>
                <a
                  href={selectedLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center gap-1.5"
                >
                  <span>Launch Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
