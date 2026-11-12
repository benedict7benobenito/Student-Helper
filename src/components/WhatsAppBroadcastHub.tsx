import React, { useState } from 'react';
import { RegisteredStudentContact, WhatsAppNotification, UserProfile, CourseSession } from '../types';
import { 
  Phone, 
  Send, 
  Users, 
  MessageSquare, 
  CheckCheck, 
  Copy, 
  Plus, 
  ExternalLink, 
  Bell, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { 
  cleanKenyanPhone, 
  formatKenyanPhoneDisplay, 
  getWhatsAppGroupShareUrl, 
  getWhatsAppDirectUrl, 
  isValidKenyanPhone,
  formatClassStatusBroadcast 
} from '../utils/whatsapp';

interface WhatsAppBroadcastHubProps {
  students: RegisteredStudentContact[];
  notifications: WhatsAppNotification[];
  currentUser: UserProfile;
  courseSessions: CourseSession[];
  onAddStudent: (student: RegisteredStudentContact) => void;
  onSendBroadcast: (notification: WhatsAppNotification) => void;
}

export const WhatsAppBroadcastHub: React.FC<WhatsAppBroadcastHubProps> = ({
  students,
  notifications,
  currentUser,
  courseSessions,
  onAddStudent,
  onSendBroadcast
}) => {
  const isRep = currentUser.role === 'class_rep';
  const [activeTab, setActiveTab] = useState<'broadcast' | 'directory' | 'history'>('broadcast');

  // Broadcast composer state
  const [selectedTemplate, setSelectedTemplate] = useState<'lecture_status' | 'notes_alert' | 'urgent_memo' | 'custom'>('lecture_status');
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>(courseSessions[0]?.unitCode || 'COM 220');
  const [broadcastTitle, setBroadcastTitle] = useState('Lecture Status Update');
  const [customBody, setCustomBody] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);

  // Add student state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentReg, setNewStudentReg] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected session for lecture status
  const currentSession = courseSessions.find((s) => s.unitCode === selectedUnitCode) || courseSessions[0];

  // Generate template message text
  const getCompiledMessage = (): string => {
    if (selectedTemplate === 'lecture_status' && currentSession) {
      return formatClassStatusBroadcast(
        currentSession.unitCode,
        currentSession.unitTitle,
        currentSession.lecturer,
        currentSession.venue,
        currentSession.day,
        `${currentSession.startTime} - ${currentSession.endTime}`,
        currentSession.status,
        customBody || currentSession.statusNote || 'Please be on time and bring required revision materials.',
        currentUser.fullName
      );
    } else if (selectedTemplate === 'notes_alert') {
      return `📂 *UNIVERSITY OF ELDORET - NEW NOTES UPLOADED*\n━━━━━━━━━━━━━━━━━━━━━\n📚 *Unit:* ${selectedUnitCode}\n📝 *Announcement:* New lecture slides & CAT revision materials have been uploaded to the student portal.\n👤 *Uploaded by:* ${currentUser.fullName} (${isRep ? 'Class Rep' : 'Student'})\n━━━━━━━━━━━━━━━━━━━━━\n📥 Access the Revision Materials Vault in the student hub to download now!\n💡 Please revise Chapter 3 & 4 before our next class.`;
    } else if (selectedTemplate === 'urgent_memo') {
      return `📢 *URGENT CLASS REP ANNOUNCEMENT*\n🏛️ *University of Eldoret*\n━━━━━━━━━━━━━━━━━━━━━\n${customBody || 'Attention all students: Ensure your semester fee balance is cleared before the deadline to print your examination card.'}\n━━━━━━━━━━━━━━━━━━━━━\n👤 *Issued by:* ${currentUser.fullName} (Class Rep)\n📲 Reach out on WhatsApp for any inquiries.`;
    } else {
      return `📌 *UNIVERSITY OF ELDORET - COHORT BULLETIN*\n━━━━━━━━━━━━━━━━━━━━━\n${customBody || 'General update regarding our academic schedule and group discussions.'}\n━━━━━━━━━━━━━━━━━━━━━\n👤 *From:* ${currentUser.fullName}`;
    }
  };

  const compiledText = getCompiledMessage();

  const handleLaunchGroupShare = () => {
    const url = getWhatsAppGroupShareUrl(compiledText);
    window.open(url, '_blank');

    // Also record in log
    const notif: WhatsAppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      sender: `${currentUser.fullName} (${isRep ? 'Class Rep' : 'Student'})`,
      type: selectedTemplate === 'notes_alert' ? 'notes_upload' : 'class_status',
      title: broadcastTitle,
      messageText: compiledText,
      targetCount: students.length,
      status: 'delivered',
      relatedUnitCode: selectedUnitCode
    };
    onSendBroadcast(notif);
  };

  const handleSimulateBroadcast = () => {
    setDispatching(true);
    setDispatchProgress(10);

    const interval = setInterval(() => {
      setDispatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDispatching(false);

          const notif: WhatsAppNotification = {
            id: `notif-${Date.now()}`,
            timestamp: 'Just now',
            sender: `${currentUser.fullName} (${isRep ? 'Class Rep' : 'Student'})`,
            type: selectedTemplate === 'notes_alert' ? 'notes_upload' : 'class_status',
            title: broadcastTitle,
            messageText: compiledText,
            targetCount: students.length,
            status: 'delivered',
            relatedUnitCode: selectedUnitCode
          };
          onSendBroadcast(notif);
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(compiledText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCopyAllPhoneNumbers = () => {
    const phones = students.map((s) => cleanKenyanPhone(s.whatsappNumber)).join(', ');
    navigator.clipboard.writeText(phones);
    alert(`Copied ${students.length} student WhatsApp numbers to clipboard for broadcast list!`);
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentReg || !newStudentPhone) return;

    const formatted = formatKenyanPhoneDisplay(cleanKenyanPhone(newStudentPhone));
    const generatedEmail = newStudentEmail.trim().toLowerCase() || `${newStudentName.split(' ')[0].toLowerCase()}.${newStudentReg.replace(/[\/\\]/g, '').toLowerCase()}@student.uoeld.ac.ke`;

    const newStudent: RegisteredStudentContact = {
      id: `stud-${Date.now()}`,
      fullName: newStudentName.trim(),
      regNumber: newStudentReg.trim().toUpperCase(),
      email: generatedEmail,
      whatsappNumber: formatted,
      program: currentUser.program || 'BSc. Computer Science',
      year: currentUser.yearOfStudy || 2,
      role: 'student',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    onAddStudent(newStudent);
    setIsAddStudentOpen(false);
    setNewStudentName('');
    setNewStudentReg('');
    setNewStudentEmail('');
    setNewStudentPhone('');
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.regNumber.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      s.whatsappNumber.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              WhatsApp Integration Engine
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">Kenyan (+254) SMS & WhatsApp Delivery</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            WhatsApp Lecture Alert & Broadcast Hub
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            📲 When the Class Rep confirms a class or uploads new revision notes, all registered students are instantly notified on WhatsApp.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <Users className="w-5 h-5 text-emerald-800" />
          <div className="text-xs">
            <span className="font-bold text-emerald-950 block">
              {students.length} Registered Students
            </span>
            <span className="text-emerald-700 text-[11px]">Ready for WhatsApp broadcast</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'broadcast'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-emerald-700" />
            <span>Broadcast Composer</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'directory'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Student Directory ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'history'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-emerald-700" />
            <span>Broadcast Feed ({notifications.length})</span>
          </button>
        </div>

        {activeTab === 'directory' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllPhoneNumbers}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg border border-stone-200 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All Numbers</span>
            </button>
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Student Number</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Broadcast Composer */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-2">
                  1. Choose Broadcast Notification Template
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate('lecture_status');
                      setBroadcastTitle('Lecture Status Update');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                      selectedTemplate === 'lecture_status'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Calendar className="w-4 h-4 mb-1 text-emerald-700" />
                    <span>Lecture Status</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTemplate('notes_alert');
                      setBroadcastTitle('New Notes Upload Alert');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                      selectedTemplate === 'notes_alert'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 mb-1 text-emerald-700" />
                    <span>Notes Uploaded</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTemplate('urgent_memo');
                      setBroadcastTitle('Urgent Class Rep Memo');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                      selectedTemplate === 'urgent_memo'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Bell className="w-4 h-4 mb-1 text-amber-600" />
                    <span>Urgent Memo</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTemplate('custom');
                      setBroadcastTitle('Custom Class Announcement');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                      selectedTemplate === 'custom'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mb-1 text-indigo-600" />
                    <span>Custom Message</span>
                  </button>
                </div>
              </div>

              {/* Unit Code Selector */}
              {(selectedTemplate === 'lecture_status' || selectedTemplate === 'notes_alert') && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Related Course Unit
                  </label>
                  <select
                    value={selectedUnitCode}
                    onChange={(e) => setSelectedUnitCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    {courseSessions.map((session) => (
                      <option key={session.id} value={session.unitCode}>
                        {session.unitCode} - {session.unitTitle} ({session.day} {session.startTime})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Message or Additional Note */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {selectedTemplate === 'lecture_status'
                    ? "Rep's Note / Venue Details (Appears in WhatsApp message)"
                    : 'Announcement Body'}
                </label>
                <textarea
                  rows={4}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder={
                    selectedTemplate === 'lecture_status'
                      ? "e.g. Dr. Evans is in the department. Lecture will proceed as scheduled at Science Complex LH 01."
                      : "Type your detailed announcement to the class cohort here..."
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Progress Bar when dispatching */}
              {dispatching && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-950 mb-1.5">
                    <span>Broadcasting to {students.length} WhatsApp numbers...</span>
                    <span>{dispatchProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 transition-all duration-300"
                      style={{ width: `${dispatchProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleLaunchGroupShare}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4 text-emerald-200" />
                  <span>1-Click Send to WhatsApp Group</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateBroadcast}
                  disabled={dispatching}
                  className="w-full sm:w-auto py-2.5 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold text-xs rounded-lg border border-emerald-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-700" />
                  <span>Notify All ({students.length} Students)</span>
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp Preview Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-[#ECE5DD] rounded-xl border border-stone-300 shadow-md overflow-hidden">
              {/* WhatsApp Mock Header */}
              <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center text-xs font-bold">
                    UoE
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-none">UoE Class Official Group</h4>
                    <p className="text-[10px] text-emerald-200 mt-0.5">
                      {students.length} participants · Broadcast Ready
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopyText}
                  className="text-emerald-100 hover:text-white p-1 text-xs flex items-center gap-1"
                  title="Copy formatted text"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Chat Bubble Container */}
              <div className="p-4 space-y-3 min-h-[340px] max-h-[460px] overflow-y-auto bg-[radial-gradient(#d4cdc5_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="max-w-[92%] ml-auto bg-[#E7FFDB] rounded-lg p-3.5 shadow-xs border border-emerald-200/60 text-xs text-stone-900">
                  <pre className="font-sans whitespace-pre-wrap leading-relaxed text-[12px] text-stone-800">
                    {compiledText}
                  </pre>
                  <div className="text-right mt-1.5 flex items-center justify-end gap-1 text-[10px] text-stone-500">
                    <span>Just now</span>
                    <CheckCheck className="w-3.5 h-3.5 text-sky-600" />
                  </div>
                </div>
              </div>

              {/* WhatsApp footer action */}
              <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="text-stone-500 text-[11px]">Direct WhatsApp Link Generator</span>
                <button
                  onClick={handleCopyText}
                  className="text-emerald-800 font-bold hover:underline"
                >
                  {copySuccess ? 'Copied to Clipboard!' : 'Copy Text'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Registered Student Directory */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student by name, reg number or phone..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
              />
            </div>
            <div className="text-xs text-stone-600 font-medium">
              Registered Cohort: <span className="font-bold text-stone-900">{students.length}</span> students
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Reg. Number</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">WhatsApp Number</th>
                  <th className="px-4 py-3">Program & Year</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right">Quick WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredStudents.map((student) => {
                  return (
                    <tr key={student.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-stone-900">
                        {student.fullName}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-700">
                        {student.regNumber}
                      </td>
                      <td className="px-4 py-3 text-stone-600 font-mono text-[11px]">
                        {student.email || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-800 font-medium">
                        {student.whatsappNumber}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {student.program} · Yr {student.year}
                      </td>
                      <td className="px-4 py-3">
                        {student.role === 'class_rep' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <ShieldCheck className="w-3 h-3 text-amber-700" />
                            CLASS REP
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-500">Student</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={getWhatsAppDirectUrl(student.whatsappNumber, `Hello ${student.fullName.split(' ')[0]}, this is an alert from University of Eldoret Class Rep regarding your timetable and notes.`)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Direct Chat</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Broadcast History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Dispatched Notification Log</h3>
            <span className="text-xs text-stone-500">{notifications.length} alerts on record</span>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900">{notif.title}</span>
                    {notif.relatedUnitCode && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">
                        {notif.relatedUnitCode}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-2">
                    <span>{notif.timestamp}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-medium">Delivered to {notif.targetCount} students</span>
                  </div>
                </div>

                <pre className="font-sans text-xs text-stone-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-stone-200">
                  {notif.messageText}
                </pre>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>Sender: {notif.sender}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(notif.messageText);
                      alert('Broadcast message copied!');
                    }}
                    className="text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Add Student WhatsApp Number</h3>
                <p className="text-xs text-emerald-200">Register classmate for lecture alerts</p>
              </div>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="text-emerald-300 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Cynthia Chepkemoi"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Student Reg Number
                </label>
                <input
                  type="text"
                  required
                  value={newStudentReg}
                  onChange={(e) => setNewStudentReg(e.target.value.toUpperCase())}
                  placeholder="e.g. SC/COM/055/22"
                  className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Student Email Address
                </label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="e.g. cynthia.chepkemoi@student.uoeld.ac.ke"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  WhatsApp Number (07XX... or +254...)
                </label>
                <input
                  type="tel"
                  required
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  placeholder="0712 345 678"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm"
                >
                  Save Student Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
