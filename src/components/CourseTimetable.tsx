import React, { useState } from 'react';
import { CourseSession, UserProfile, ClassConfirmationStatus } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Send, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Share2, 
  MessageSquare,
  Sparkles,
  BookmarkPlus
} from 'lucide-react';
import { formatClassStatusBroadcast, getWhatsAppGroupShareUrl } from '../utils/whatsapp';

interface CourseTimetableProps {
  courseSessions: CourseSession[];
  currentUser: UserProfile;
  onUpdateSession: (updated: CourseSession) => void;
  onAddSession: (session: CourseSession) => void;
  onDeleteSession: (id: string) => void;
  onSyncToPersonal: (session: CourseSession) => void;
  onBroadcastNotification: (title: string, message: string, type: 'class_status') => void;
}

export const CourseTimetable: React.FC<CourseTimetableProps> = ({
  courseSessions,
  currentUser,
  onUpdateSession,
  onAddSession,
  onDeleteSession,
  onSyncToPersonal,
  onBroadcastNotification
}) => {
  const isRep = currentUser.role === 'class_rep';
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [editingSession, setEditingSession] = useState<CourseSession | null>(null);
  const [statusModalSession, setStatusModalSession] = useState<CourseSession | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [broadcastPreview, setBroadcastPreview] = useState<string | null>(null);

  // Status modal state
  const [newStatus, setNewStatus] = useState<ClassConfirmationStatus>('confirmed');
  const [repNote, setRepNote] = useState('');

  // Add/Edit Form State
  const [formData, setFormData] = useState<Partial<CourseSession>>({
    unitCode: '',
    unitTitle: '',
    lecturer: '',
    venue: '',
    day: 'Monday',
    startTime: '08:00',
    endTime: '11:00',
    status: 'pending',
    statusNote: '',
    colorTag: 'emerald'
  });

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const filteredSessions = selectedDay === 'All'
    ? courseSessions
    : courseSessions.filter((s) => s.day === selectedDay);

  const getStatusBadge = (status: ClassConfirmationStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            CONFIRMED
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            CANCELLED
          </span>
        );
      case 'rescheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            RESCHEDULED
          </span>
        );
      case 'online':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            ONLINE CLASS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            PENDING RECON
          </span>
        );
    }
  };

  const handleOpenStatusModal = (session: CourseSession) => {
    setStatusModalSession(session);
    setNewStatus(session.status);
    setRepNote(session.statusNote || '');
  };

  const handleSaveStatus = (triggerWhatsAppShare: boolean = false) => {
    if (!statusModalSession) return;

    const updated: CourseSession = {
      ...statusModalSession,
      status: newStatus,
      statusNote: repNote.trim(),
      lastUpdatedBy: `${currentUser.fullName} (${isRep ? 'Class Rep' : 'Student'})`,
      lastUpdatedAt: 'Just now'
    };

    onUpdateSession(updated);

    const broadcastText = formatClassStatusBroadcast(
      updated.unitCode,
      updated.unitTitle,
      updated.lecturer,
      updated.venue,
      updated.day,
      `${updated.startTime} - ${updated.endTime}`,
      newStatus,
      repNote,
      currentUser.fullName
    );

    onBroadcastNotification(
      `Lecture Alert: ${updated.unitCode} is ${newStatus.toUpperCase()}`,
      broadcastText,
      'class_status'
    );

    if (triggerWhatsAppShare) {
      window.open(getWhatsAppGroupShareUrl(broadcastText), '_blank');
    }

    setStatusModalSession(null);
  };

  const handleSaveCourseUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unitCode || !formData.unitTitle) return;

    if (editingSession) {
      const updated: CourseSession = {
        ...editingSession,
        unitCode: formData.unitCode.toUpperCase(),
        unitTitle: formData.unitTitle,
        lecturer: formData.lecturer || 'Department Staff',
        venue: formData.venue || 'Lecture Hall',
        day: (formData.day as any) || 'Monday',
        startTime: formData.startTime || '08:00',
        endTime: formData.endTime || '11:00',
        statusNote: formData.statusNote || '',
        colorTag: formData.colorTag || 'emerald',
        lastUpdatedBy: `${currentUser.fullName} (Class Rep)`,
        lastUpdatedAt: 'Just now'
      };
      onUpdateSession(updated);
      setEditingSession(null);
    } else {
      const newSession: CourseSession = {
        id: `course-${Date.now()}`,
        unitCode: formData.unitCode.toUpperCase(),
        unitTitle: formData.unitTitle,
        lecturer: formData.lecturer || 'Department Staff',
        venue: formData.venue || 'Lecture Hall',
        day: (formData.day as any) || 'Monday',
        startTime: formData.startTime || '08:00',
        endTime: formData.endTime || '11:00',
        status: (formData.status as any) || 'pending',
        statusNote: formData.statusNote || 'New course schedule added.',
        colorTag: formData.colorTag || 'emerald',
        lastUpdatedBy: `${currentUser.fullName} (Class Rep)`,
        lastUpdatedAt: 'Just now'
      };
      onAddSession(newSession);
      setIsAddModalOpen(false);
    }

    // Reset form
    setFormData({
      unitCode: '',
      unitTitle: '',
      lecturer: '',
      venue: '',
      day: 'Monday',
      startTime: '08:00',
      endTime: '11:00',
      status: 'pending',
      statusNote: '',
      colorTag: 'emerald'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Role Notice */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Official Academic Schedule
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">University of Eldoret</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Official Course Timetable
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            {isRep ? (
              <span className="text-emerald-900 font-medium">
                🛡️ <strong>Class Representative Mode:</strong> You have exclusive permission to edit unit sessions, confirm/cancel lectures, and broadcast live alerts to students on WhatsApp.
              </span>
            ) : (
              <span className="text-stone-600">
                🔒 <strong>Student View:</strong> This official timetable is maintained by your Class Representative. Click <em>"Add to My Timetable"</em> on any session to copy it to your personal planner.
              </span>
            )}
          </p>
        </div>

        {/* Action button: Rep only */}
        {isRep && (
          <button
            onClick={() => {
              setEditingSession(null);
              setFormData({
                unitCode: '',
                unitTitle: '',
                lecturer: '',
                venue: '',
                day: 'Monday',
                startTime: '08:00',
                endTime: '11:00',
                status: 'pending',
                statusNote: '',
                colorTag: 'emerald'
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course Session</span>
          </button>
        )}
      </div>

      {/* Day Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-lg overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedDay('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              selectedDay === 'All'
                ? 'bg-white text-emerald-950 font-bold shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Days ({courseSessions.length})
          </button>
          {daysList.map((d) => {
            const count = courseSessions.filter((s) => s.day === d).length;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  selectedDay === d
                    ? 'bg-white text-emerald-950 font-bold shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {d} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Showing <span className="font-bold text-stone-900">{filteredSessions.length}</span> lectures
        </div>
      </div>

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => {
          return (
            <div
              key={session.id}
              className="bg-white rounded-xl border border-stone-200 hover:border-emerald-600/40 shadow-sm transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                {/* Header row: Unit Code & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono text-sm font-extrabold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {session.unitCode}
                    </span>
                    <h3 className="font-bold text-stone-900 text-base mt-2 line-clamp-1">
                      {session.unitTitle}
                    </h3>
                  </div>
                  <div>
                    {getStatusBadge(session.status)}
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-1.5 text-xs text-stone-600 mt-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-medium text-stone-800">{session.lecturer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="text-stone-700">{session.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-stone-700">
                    <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{session.day} · {session.startTime} - {session.endTime}</span>
                  </div>
                </div>

                {/* Status Note / Rep's message */}
                {session.statusNote && (
                  <div className={`mt-3.5 p-2.5 rounded-lg text-xs border ${
                    session.status === 'confirmed'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : session.status === 'cancelled'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : session.status === 'rescheduled'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`}>
                    <div className="flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-stone-500 shrink-0" />
                      <div>
                        <span className="font-bold text-[11px] block">
                          Class Rep Update ({session.lastUpdatedAt || 'Recent'}):
                        </span>
                        <p className="mt-0.5 leading-relaxed">{session.statusNote}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                {isRep ? (
                  /* Class Rep Actions */
                  <div className="flex items-center justify-between w-full gap-2">
                    <button
                      onClick={() => handleOpenStatusModal(session)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                      title="Update confirmation and broadcast to WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Confirm & Notify</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingSession(session);
                          setFormData({ ...session });
                          setIsAddModalOpen(true);
                        }}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                        title="Edit schedule details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${session.unitCode} from official timetable?`)) {
                            onDeleteSession(session.id);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded transition-colors"
                        title="Delete unit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Student Actions */
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={() => onSyncToPersonal(session)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60 rounded-lg transition-colors"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Add to My Timetable</span>
                    </button>

                    {/* Quick WhatsApp Share for students too */}
                    <button
                      onClick={() => {
                        const broadcast = formatClassStatusBroadcast(
                          session.unitCode,
                          session.unitTitle,
                          session.lecturer,
                          session.venue,
                          session.day,
                          `${session.startTime} - ${session.endTime}`,
                          session.status,
                          session.statusNote,
                          session.lastUpdatedBy || 'Class Rep'
                        );
                        window.open(getWhatsAppGroupShareUrl(broadcast), '_blank');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:underline"
                      title="Share class status with friends on WhatsApp"
                    >
                      <Send className="w-3 h-3" />
                      <span>WhatsApp Share</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-stone-200 p-8">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No lectures scheduled for {selectedDay}</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            {isRep
              ? 'Click "Add Course Session" above to create an entry for this day.'
              : 'Enjoy your free study day or check your personal timetable.'}
          </p>
        </div>
      )}

      {/* Class Confirmation & WhatsApp Broadcast Modal (Class Rep Exclusive) */}
      {statusModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Class Rep Confirmation Hub
                </span>
                <h3 className="text-lg font-bold text-white">
                  Update Lecture Status: {statusModalSession.unitCode}
                </h3>
              </div>
              <button
                onClick={() => setStatusModalSession(null)}
                className="text-emerald-300 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1 border border-stone-200">
                <p className="font-semibold text-stone-900">{statusModalSession.unitTitle}</p>
                <p className="text-stone-600">
                  Lecturer: {statusModalSession.lecturer} · Venue: {statusModalSession.venue}
                </p>
                <p className="text-stone-600">
                  Slot: {statusModalSession.day}, {statusModalSession.startTime} - {statusModalSession.endTime}
                </p>
              </div>

              {/* Status Radio Choice */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Confirm Current Lecture Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('confirmed')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      newStatus === 'confirmed'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Confirmed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('cancelled')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      newStatus === 'cancelled'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-600'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Cancelled</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('rescheduled')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      newStatus === 'rescheduled'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-1 ring-amber-600'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Rescheduled</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('online')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      newStatus === 'online'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Online (Meet/Zoom)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('pending')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      newStatus === 'pending'
                        ? 'border-stone-600 bg-stone-100 text-stone-900 ring-1 ring-stone-600'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-stone-500" />
                    <span>Pending</span>
                  </button>
                </div>
              </div>

              {/* Rep Note */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Rep's Explanatory Note to Class (Included in WhatsApp alert)
                </label>
                <textarea
                  rows={3}
                  value={repNote}
                  onChange={(e) => setRepNote(e.target.value)}
                  placeholder="e.g. Dr. Mwangi confirmed. Class starts 8:00 AM sharp at Science LH 01. Don't be late!"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* WhatsApp Broadcast Preview */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-950 block mb-1">
                  📲 WhatsApp Alert Message Preview:
                </span>
                <pre className="font-mono text-[11px] text-emerald-900 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                  {formatClassStatusBroadcast(
                    statusModalSession.unitCode,
                    statusModalSession.unitTitle,
                    statusModalSession.lecturer,
                    statusModalSession.venue,
                    statusModalSession.day,
                    `${statusModalSession.startTime} - ${statusModalSession.endTime}`,
                    newStatus,
                    repNote,
                    currentUser.fullName
                  )}
                </pre>
              </div>

              {/* Modal buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setStatusModalSession(null)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveStatus(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg"
                >
                  Save Status
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveStatus(true)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save & Open WhatsApp Broadcast</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Unit Modal (Class Rep Only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingSession ? 'Edit Course Unit' : 'Add New Course Schedule'}
                </h3>
                <p className="text-xs text-emerald-200">
                  Class Representative Official Timetable Management
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-emerald-300 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourseUnit} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Unit Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unitCode}
                    onChange={(e) => setFormData({ ...formData, unitCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. COM 220"
                    className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Day of the Week
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    {daysList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Unit Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.unitTitle}
                  onChange={(e) => setFormData({ ...formData, unitTitle: e.target.value })}
                  placeholder="e.g. Database Management Systems"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Lecturer Name
                  </label>
                  <input
                    type="text"
                    value={formData.lecturer}
                    onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                    placeholder="e.g. Dr. Evans Kiprono"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Lecture Hall / Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Science Complex LH 01"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Initial Rep's Note
                </label>
                <input
                  type="text"
                  value={formData.statusNote}
                  onChange={(e) => setFormData({ ...formData, statusNote: e.target.value })}
                  placeholder="e.g. Awaiting room confirmation from department"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm"
                >
                  {editingSession ? 'Update Session' : 'Save New Course Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
