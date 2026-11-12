import React, { useState } from 'react';
import { PersonalSession, CourseSession, UserProfile } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  Layers, 
  Check, 
  RefreshCw,
  Printer
} from 'lucide-react';

interface PersonalTimetableProps {
  personalSessions: PersonalSession[];
  courseSessions: CourseSession[];
  currentUser: UserProfile;
  onAddSession: (session: PersonalSession) => void;
  onUpdateSession: (session: PersonalSession) => void;
  onDeleteSession: (id: string) => void;
  onSyncAllFromCourse: () => void;
}

export const PersonalTimetable: React.FC<PersonalTimetableProps> = ({
  personalSessions,
  courseSessions,
  currentUser,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onSyncAllFromCourse
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'personal_study' as PersonalSession['category'],
    day: 'Monday' as PersonalSession['day'],
    startTime: '10:00',
    endTime: '12:00',
    venue: '',
    notes: '',
    colorTag: 'emerald'
  });

  const weekDays: PersonalSession['day'][] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const categoryLabels: Record<PersonalSession['category'], { label: string; color: string }> = {
    lecture: { label: 'Lecture Session', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    personal_study: { label: 'Personal Revision', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    group_discussion: { label: 'Group Study', color: 'bg-purple-100 text-purple-900 border-purple-300' },
    assignment: { label: 'Assignment Work', color: 'bg-amber-100 text-amber-950 border-amber-300' },
    library: { label: 'Library Carrel', color: 'bg-sky-100 text-sky-900 border-sky-300' },
    sports_clubs: { label: 'Sports & Society', color: 'bg-rose-100 text-rose-900 border-rose-300' },
    other: { label: 'Other Commitment', color: 'bg-stone-100 text-stone-800 border-stone-300' }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'personal_study',
      day: selectedDay as any,
      startTime: '14:00',
      endTime: '16:00',
      venue: 'Main Library / Room',
      notes: '',
      colorTag: 'emerald'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session: PersonalSession) => {
    setEditingId(session.id);
    setFormData({
      title: session.title,
      category: session.category,
      day: session.day,
      startTime: session.startTime,
      endTime: session.endTime,
      venue: session.venue,
      notes: session.notes || '',
      colorTag: session.colorTag
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      const updated: PersonalSession = {
        id: editingId,
        title: formData.title.trim(),
        category: formData.category,
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue.trim() || 'Main Campus',
        notes: formData.notes.trim(),
        colorTag: formData.colorTag
      };
      onUpdateSession(updated);
    } else {
      const created: PersonalSession = {
        id: `pers-${Date.now()}`,
        title: formData.title.trim(),
        category: formData.category,
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue.trim() || 'Main Campus',
        notes: formData.notes.trim(),
        colorTag: formData.colorTag
      };
      onAddSession(created);
    }
    setIsModalOpen(false);
  };

  // Sort sessions by time
  const getSortedSessionsForDay = (day: string) => {
    return personalSessions
      .filter((s) => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Student Individual Space
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">{currentUser.fullName} ({currentUser.regNumber})</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            My Personal Study & Lecture Timetable
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            ✏️ <strong>Fully Editable by You:</strong> Add your study sessions, library research hours, group discussions, and club activities. You can also import your class schedule with 1 click.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onSyncAllFromCourse}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-200 transition-colors"
            title="Import all lectures from official course schedule"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sync from Course Schedule</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Slot</span>
          </button>
        </div>
      </div>

      {/* View Mode & Day Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Day Selector */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg overflow-x-auto max-w-full">
          {weekDays.map((d) => {
            const count = personalSessions.filter((s) => s.day === d).length;
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-emerald-950 font-bold shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {d.slice(0, 3)} {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* View Switcher: Week Grid vs Day Focus */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-xs">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'week' ? 'bg-white shadow-sm font-bold text-stone-900' : 'text-stone-600'
              }`}
            >
              Full Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'day' ? 'bg-white shadow-sm font-bold text-stone-900' : 'text-stone-600'
              }`}
            >
              Day Detail
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs hidden sm:flex items-center gap-1"
            title="Print Personal Timetable"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Week Grid View */}
      {viewMode === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const sessions = getSortedSessionsForDay(day);
            const isTodayDay = day === 'Monday'; // Highlight current academic day
            return (
              <div
                key={day}
                className={`bg-white rounded-xl border flex flex-col min-h-[380px] shadow-sm transition-all ${
                  isTodayDay ? 'border-emerald-600/50 ring-1 ring-emerald-600/20' : 'border-stone-200'
                }`}
              >
                {/* Day Header */}
                <div className={`px-3 py-2.5 border-b flex items-center justify-between ${
                  isTodayDay ? 'bg-emerald-950 text-white rounded-t-xl' : 'bg-stone-50 border-stone-100 text-stone-800'
                }`}>
                  <span className="font-bold text-xs">{day}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/10">
                    {sessions.length} slots
                  </span>
                </div>

                {/* Day Sessions List */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[500px]">
                  {sessions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-8 text-center text-stone-400">
                      <span className="text-[11px]">Free Day</span>
                      <button
                        onClick={() => {
                          setSelectedDay(day);
                          handleOpenAdd();
                        }}
                        className="text-[10px] text-emerald-700 hover:underline mt-1 font-medium"
                      >
                        + Add activity
                      </button>
                    </div>
                  ) : (
                    sessions.map((s) => {
                      const categoryInfo = categoryLabels[s.category] || categoryLabels.other;
                      return (
                        <div
                          key={s.id}
                          className="group relative p-2.5 rounded-lg border border-stone-200 hover:border-emerald-500 bg-white hover:shadow-xs transition-all text-left"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[10px] font-bold text-stone-700">
                              {s.startTime} - {s.endTime}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${categoryInfo.color}`}>
                              {categoryInfo.label.split(' ')[0]}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs text-stone-900 leading-tight">
                            {s.title}
                          </h4>

                          <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{s.venue}</span>
                          </div>

                          {s.notes && (
                            <p className="text-[10px] text-stone-600 italic mt-1 line-clamp-2 bg-stone-50 p-1 rounded">
                              {s.notes}
                            </p>
                          )}

                          {/* Quick Edit/Delete on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 pt-1 border-t border-stone-100 flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="p-1 hover:text-emerald-800 text-stone-500 rounded"
                              title="Edit slot"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteSession(s.id)}
                              className="p-1 hover:text-rose-700 text-stone-400 rounded"
                              title="Delete slot"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 border-t border-stone-100 bg-stone-50/50">
                  <button
                    onClick={() => {
                      setSelectedDay(day);
                      handleOpenAdd();
                    }}
                    className="w-full py-1 text-center text-[11px] font-medium text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                  >
                    + Add Slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Day Detailed View */
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">{selectedDay} Schedule</h3>
              <p className="text-xs text-stone-500">
                Detailed time breakdown and study targets
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add {selectedDay} Activity</span>
            </button>
          </div>

          <div className="space-y-3">
            {getSortedSessionsForDay(selectedDay).length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-semibold">No study sessions planned for {selectedDay}</p>
                <p className="text-xs mt-1">Plan a revision slot, library hour, or group discussion.</p>
              </div>
            ) : (
              getSortedSessionsForDay(selectedDay).map((session) => {
                const categoryInfo = categoryLabels[session.category] || categoryLabels.other;
                return (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-stone-200 hover:border-emerald-600/40 bg-stone-50/40 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-center shrink-0 w-24 py-1.5 px-2 bg-stone-100 rounded-lg border border-stone-200 font-mono">
                        <span className="block text-xs font-bold text-stone-900">{session.startTime}</span>
                        <span className="block text-[10px] text-stone-500">to {session.endTime}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${categoryInfo.color}`}>
                            {categoryInfo.label}
                          </span>
                          {session.isSyncedFromCourse && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded font-medium">
                              Course Sync
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-stone-900 text-sm">{session.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-stone-600 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {session.venue}
                          </span>
                          {session.notes && (
                            <span className="text-stone-500 italic">· {session.notes}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEdit(session)}
                        className="px-2.5 py-1 text-xs text-stone-700 hover:bg-stone-200 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Personal Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingId ? 'Edit Personal Slot' : 'Add to Personal Timetable'}
                </h3>
                <p className="text-xs text-emerald-200">
                  Custom revision, library study or activity planner
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-300 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Database Revision or Library Study"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="personal_study">Personal Revision</option>
                    <option value="library">Library Carrel</option>
                    <option value="group_discussion">Group Discussion</option>
                    <option value="assignment">Assignment Prep</option>
                    <option value="lecture">Lecture / Elective</option>
                    <option value="sports_clubs">Sports & Recreation</option>
                    <option value="other">Other</option>
                  </select>
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
                    {weekDays.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
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
                  Location / Venue
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. UoE New Library 2nd Floor or Room 4"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Personal Study Notes / Agenda
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Solve Chapter 3 practice questions and complete ER diagram"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm"
                >
                  {editingId ? 'Update Slot' : 'Add to My Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
