import React from 'react';
import { UserProfile, CourseSession, RevisionMaterial, WhatsAppNotification, PersonalSession } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Send, 
  Plus, 
  Upload, 
  BookOpen, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Bell,
  Sparkles,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { formatClassStatusBroadcast, getWhatsAppGroupShareUrl } from '../utils/whatsapp';

interface DashboardOverviewProps {
  currentUser: UserProfile;
  courseSessions: CourseSession[];
  personalSessions: PersonalSession[];
  revisionMaterials: RevisionMaterial[];
  notifications: WhatsAppNotification[];
  registeredStudentCount: number;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onToggleRole: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentUser,
  courseSessions,
  personalSessions,
  revisionMaterials,
  notifications,
  registeredStudentCount,
  setActiveTab,
  onOpenAuthModal,
  onToggleRole
}) => {
  const isRep = currentUser.role === 'class_rep';

  // Today's course sessions (e.g. Monday for realistic demo context)
  const todayDay = 'Monday';
  const todaysLectures = courseSessions.filter((s) => s.day === todayDay);
  const todaysPersonal = personalSessions.filter((s) => s.day === todayDay);

  const getStatusBadge = (status: CourseSession['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            CONFIRMED
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            CANCELLED
          </span>
        );
      case 'rescheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            RESCHEDULED
          </span>
        );
      case 'online':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <Sparkles className="w-3 h-3 text-sky-600" />
            ONLINE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <Clock className="w-3 h-3 text-stone-500" />
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Hero Split Section */}
      <div className="relative rounded-2xl overflow-hidden border border-emerald-950/20 bg-emerald-950 text-white shadow-lg">
        {/* Background Image Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/uoe_campus_hero_1794485751637.jpg"
            alt="University of Eldoret Academic Entrance"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-700 hover:scale-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/90 to-emerald-950/40" />
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-emerald-950 font-bold uppercase tracking-wide">
                University of Eldoret
              </span>
              <span className="text-emerald-300">·</span>
              <span className="text-emerald-200">{currentUser.department}</span>
              <span className="text-emerald-300">·</span>
              <span className="text-emerald-200">Year {currentUser.yearOfStudy}, Sem {currentUser.semester}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {currentUser.fullName}!
            </h1>

            <p className="text-xs md:text-sm text-emerald-100 mt-2 leading-relaxed">
              {isRep ? (
                <span>
                  🛡️ <strong>Class Representative Control Active:</strong> Manage course timetables, verify lecturer attendance, broadcast confirmed class status, and distribute revision notes to the cohort.
                </span>
              ) : (
                <span>
                  Stay organized with your personalized study timetable, real-time Class Rep lecture status confirmations, and direct links to the UoE portal & revision vault.
                </span>
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/80 rounded-lg border border-emerald-800 text-emerald-200">
                <span className="font-mono text-amber-300">{currentUser.regNumber}</span>
              </div>
              {currentUser.email && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/80 rounded-lg border border-emerald-800 text-emerald-200 font-mono text-[11px]">
                  <span>{currentUser.email}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/80 rounded-lg border border-emerald-800 text-emerald-200">
                <span>WhatsApp: <strong className="text-white font-mono">{currentUser.whatsappNumber}</strong></span>
              </div>
              <button
                onClick={onOpenAuthModal}
                className="text-amber-300 hover:text-white underline text-xs font-semibold"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Action Box */}
          <div className="w-full md:w-auto p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 text-xs space-y-2 shrink-0">
            <span className="text-emerald-200 font-bold block uppercase text-[10px] tracking-wider">
              Automated Student Actions
            </span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('ai-exam-hub')}
                className="w-full px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-lg shadow-sm flex items-center justify-between gap-3 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Exam Paper Predictor</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('attendance-qr')}
                className="w-full px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold rounded-lg flex items-center justify-between gap-3 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scan ID / QR Check-In</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('course-timetable')}
                className="w-full px-4 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-white font-medium rounded-lg flex items-center justify-between gap-3 transition-colors"
              >
                <span>Check Today's Lectures</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('whatsapp-hub')}
                className="w-full px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center justify-between gap-3 transition-colors"
              >
                <span>Open WhatsApp Hub</span>
                <Send className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('revision-vault')}
                className="w-full px-4 py-2 bg-emerald-900/70 hover:bg-emerald-900 text-emerald-100 font-medium rounded-lg flex items-center justify-between gap-3 transition-colors"
              >
                <span>Browse Revision Notes</span>
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('course-timetable')}
          className="bg-white p-4 rounded-xl border border-stone-200 hover:border-emerald-500 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-stone-500">Official Course Units</span>
            <Calendar className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">{courseSessions.length}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Class Rep managed
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('whatsapp-hub')}
          className="bg-white p-4 rounded-xl border border-stone-200 hover:border-emerald-500 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-stone-500">WhatsApp Cohort</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">{registeredStudentCount}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Registered phone numbers
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('revision-vault')}
          className="bg-white p-4 rounded-xl border border-stone-200 hover:border-emerald-500 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-stone-500">Revision Materials</span>
            <BookOpen className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">{revisionMaterials.length}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Past CATs & lecture slides
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('personal-timetable')}
          className="bg-white p-4 rounded-xl border border-stone-200 hover:border-emerald-500 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-stone-500">My Planned Slots</span>
            <Clock className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">{personalSessions.length}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Editable study schedule
          </span>
        </div>
      </div>

      {/* Main Content Split: Today's Schedule vs Recent WhatsApp Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Lectures (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Today's Lectures ({todayDay})
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  Lecturer Confirmation & Status
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('course-timetable')}
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {todaysLectures.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <Calendar className="w-8 h-8 mx-auto mb-1 text-stone-300" />
                  <p className="text-xs">No lectures scheduled for today.</p>
                </div>
              ) : (
                todaysLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="p-4 rounded-xl border border-stone-200 hover:border-emerald-500 transition-colors bg-stone-50/50 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                            {lecture.unitCode}
                          </span>
                          <span className="text-xs text-stone-500 font-mono">
                            {lecture.startTime} - {lecture.endTime}
                          </span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-sm mt-1">
                          {lecture.unitTitle}
                        </h4>
                      </div>
                      <div>{getStatusBadge(lecture.status)}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                      <span><strong>Lecturer:</strong> {lecture.lecturer}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {lecture.venue}
                      </span>
                    </div>

                    {lecture.statusNote && (
                      <div className="p-2.5 rounded-lg bg-white border border-stone-200 text-xs text-stone-700">
                        <span className="font-semibold text-emerald-950 block text-[11px]">
                          📢 Rep's Notice:
                        </span>
                        <p className="mt-0.5">{lecture.statusNote}</p>
                      </div>
                    )}

                    {/* Quick WhatsApp broadcast button */}
                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-stone-500">
                        Updated {lecture.lastUpdatedAt || 'recently'}
                      </span>
                      <button
                        onClick={() => {
                          const broadcast = formatClassStatusBroadcast(
                            lecture.unitCode,
                            lecture.unitTitle,
                            lecture.lecturer,
                            lecture.venue,
                            lecture.day,
                            `${lecture.startTime} - ${lecture.endTime}`,
                            lecture.status,
                            lecture.statusNote,
                            lecture.lastUpdatedBy || 'Class Rep'
                          );
                          window.open(getWhatsAppGroupShareUrl(broadcast), '_blank');
                        }}
                        className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold text-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send to WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Latest WhatsApp Broadcasts & Quick Links (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Latest WhatsApp Notifications Card */}
          <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-stone-900">Recent Class Rep Broadcasts</h3>
              </div>
              <button
                onClick={() => setActiveTab('whatsapp-hub')}
                className="text-xs font-semibold text-emerald-800 hover:underline"
              >
                View Hub
              </button>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold text-emerald-950">
                    <span>{notif.title}</span>
                    <span className="text-[10px] text-stone-400 font-normal">{notif.timestamp}</span>
                  </div>
                  <p className="text-stone-600 line-clamp-2 text-[11px] font-sans">
                    {notif.messageText.slice(0, 110)}...
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick UoE Links & Emergency Bar */}
          <div className="bg-stone-900 text-white rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-300">Official UoE Portals</h3>
              <button
                onClick={() => setActiveTab('uoe-portals')}
                className="text-xs text-stone-300 hover:text-white underline"
              >
                All Links
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href="https://portal.uoeld.ac.ke/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"
              >
                <div>
                  <span className="font-semibold block text-white">Student Portal ERP</span>
                  <span className="text-[10px] text-stone-400">Exam cards, fee statements, course registration</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>

              <a
                href="https://ecampus.uoeld.ac.ke/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"
              >
                <div>
                  <span className="font-semibold block text-white">E-Campus Moodle LMS</span>
                  <span className="text-[10px] text-stone-400">Virtual classes & assignment uploads</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>

              <button
                onClick={() => setActiveTab('ai-exam-hub')}
                className="w-full text-left p-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-white text-xs transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-amber-300 block">AI Exam Paper Predictor</span>
                  <span className="text-[10px] text-emerald-200">Course synthesis & answering guide</span>
                </div>
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
