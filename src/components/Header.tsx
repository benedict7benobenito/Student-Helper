import React from 'react';
import { UserProfile, UserRole } from '../types';
import { ShieldCheck, User, Sparkles, LogOut, Phone } from 'lucide-react';
import { formatKenyanPhoneDisplay } from '../utils/whatsapp';

interface HeaderProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onToggleRole: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onToggleRole,
  unreadCount = 0
}) => {
  const isRep = currentUser.role === 'class_rep';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'course-timetable', label: 'Course Timetable' },
    { id: 'attendance-qr', label: 'QR Attendance' },
    { id: 'personal-timetable', label: 'Personal Timetable' },
    { id: 'ai-exam-hub', label: 'AI Exam Predictor' },
    { id: 'revision-vault', label: 'Revision Notes' },
    { id: 'whatsapp-hub', label: 'WhatsApp Hub' },
    { id: 'uoe-portals', label: 'UoE Portals & Help' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-emerald-950 text-white border-b border-emerald-900/60 shadow-md backdrop-blur-md">
      {/* Top Banner Notice */}
      <div className="bg-emerald-900/90 text-emerald-100 text-xs py-1 px-4 border-b border-emerald-800/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300">University of Eldoret (UoE)</span>
            <span className="text-emerald-400">·</span>
            <span className="hidden sm:inline text-emerald-200">Flame of Knowledge and Innovation</span>
            <span className="text-emerald-400">·</span>
            <span className="text-emerald-300 font-mono text-[11px] hidden lg:inline">{currentUser.email || 'student.uoeld.ac.ke'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={onToggleRole}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 font-medium transition-colors"
              title="Switch between Student and Class Rep view"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Switch View: {isRep ? 'Class Rep' : 'Student'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: University Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-emerald-950 text-base shadow-sm">
              UoE
            </div>
            <div>
              <a 
                href="#dashboard" 
                onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
                className="text-lg font-bold tracking-tight text-white hover:text-amber-300 transition-colors whitespace-nowrap"
              >
                UoE Student Hub
              </a>
              <p className="text-[11px] text-emerald-300 font-medium leading-none hidden sm:block">
                Timetable & Lecture Alerts
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap relative ${
                    isActive
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60'
                  }`}
                >
                  {item.label}
                  {item.id === 'whatsapp-hub' && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-emerald-950 font-bold text-[10px] rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Active Profile & Rep Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-900/80 border border-emerald-800 hover:border-emerald-700 text-left transition-colors"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isRep ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-700 text-emerald-100'
              }`}>
                {isRep ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-semibold text-white flex items-center gap-1">
                  <span>{currentUser.fullName.split(' ')[0]}</span>
                  {isRep && (
                    <span className="text-[10px] px-1 bg-amber-500/20 text-amber-300 rounded font-bold">
                      REP
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-emerald-300 font-mono">
                  {currentUser.regNumber}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-emerald-900/50 gap-1.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-400 text-emerald-950 font-semibold'
                    : 'bg-emerald-900/60 text-emerald-200 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
