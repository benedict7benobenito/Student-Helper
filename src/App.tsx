import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  CourseSession, 
  PersonalSession, 
  RevisionMaterial, 
  RegisteredStudentContact, 
  WhatsAppNotification, 
  UserRole,
  AttendanceRecord
} from './types';
import { 
  INITIAL_COURSE_SESSIONS, 
  INITIAL_PERSONAL_SESSIONS, 
  INITIAL_REGISTERED_STUDENTS, 
  INITIAL_REVISION_MATERIALS, 
  UOE_PORTAL_LINKS 
} from './data/uoeData';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { CourseTimetable } from './components/CourseTimetable';
import { PersonalTimetable } from './components/PersonalTimetable';
import { NotesRevisionVault } from './components/NotesRevisionVault';
import { WhatsAppBroadcastHub } from './components/WhatsAppBroadcastHub';
import { CampusPortals } from './components/CampusPortals';
import { AuthModal } from './components/AuthModal';
import { AIExamPredictor } from './components/AIExamPredictor';
import { FloatingChatbot } from './components/FloatingChatbot';
import { AttendanceQRScanner } from './components/AttendanceQRScanner';

const DEFAULT_USER: UserProfile = {
  id: 'user-default',
  fullName: 'Benedict Otunga',
  regNumber: 'SC/COM/042/22',
  email: 'benedict.otunga@student.uoeld.ac.ke',
  department: 'School of Science & Technology',
  program: 'BSc. Computer Science',
  yearOfStudy: 2,
  semester: 2,
  whatsappNumber: '+254 140908833',
  role: 'student',
  isVerifiedRep: false,
  joinedAt: '2026-09-02'
};

const INITIAL_NOTIFICATIONS: WhatsAppNotification[] = [
  {
    id: 'notif-1',
    timestamp: 'Today at 07:15 AM',
    sender: 'Kevin Odhiambo (Class Rep)',
    type: 'class_status',
    title: 'Lecture Alert: COM 220 is CONFIRMED',
    messageText: `🏛️ *UNIVERSITY OF ELDORET - LECTURE ALERT*\n━━━━━━━━━━━━━━━━━━━━━\n✅ *[CONFIRMED]*\n📚 *Unit:* COM 220 - Database Management Systems\n👨‍🏫 *Lecturer:* Dr. Evans Kiprono\n📍 *Venue:* Science Complex LH 01\n📅 *Schedule:* Monday, 08:00 - 11:00\n\n💬 *Rep's Note:*\n"Confirmed by Dr. Evans. Carry laptops with MySQL workbench installed."\n━━━━━━━━━━━━━━━━━━━━━\n📢 *Issued by:* Kevin Odhiambo (Class Rep)`,
    targetCount: 7,
    status: 'delivered',
    relatedUnitCode: 'COM 220'
  },
  {
    id: 'notif-2',
    timestamp: 'Today at 09:30 AM',
    sender: 'Kevin Odhiambo (Class Rep)',
    type: 'class_status',
    title: 'Lecture Alert: COM 221 is RESCHEDULED',
    messageText: `🏛️ *UNIVERSITY OF ELDORET - LECTURE ALERT*\n━━━━━━━━━━━━━━━━━━━━━\n🔄 *[RESCHEDULED]*\n📚 *Unit:* COM 221 - Data Structures & Algorithms\n👨‍🏫 *Lecturer:* Prof. Dennis Omondi\n📍 *Venue:* Forestry Annex 102\n📅 *Schedule:* Monday, 15:00 - 17:00\n\n💬 *Rep's Note:*\n"Prof. Omondi shifted session from 2 PM to 3 PM due to a Senate meeting."\n━━━━━━━━━━━━━━━━━━━━━\n📢 *Issued by:* Kevin Odhiambo (Class Rep)`,
    targetCount: 7,
    status: 'delivered',
    relatedUnitCode: 'COM 221'
  }
];

export default function App() {
  // Load State from LocalStorage or default
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('uoe_user_profile');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [courseSessions, setCourseSessions] = useState<CourseSession[]>(() => {
    const saved = localStorage.getItem('uoe_course_sessions');
    return saved ? JSON.parse(saved) : INITIAL_COURSE_SESSIONS;
  });

  const [personalSessions, setPersonalSessions] = useState<PersonalSession[]>(() => {
    const saved = localStorage.getItem('uoe_personal_sessions');
    return saved ? JSON.parse(saved) : INITIAL_PERSONAL_SESSIONS;
  });

  const [revisionMaterials, setRevisionMaterials] = useState<RevisionMaterial[]>(() => {
    const saved = localStorage.getItem('uoe_revision_materials');
    return saved ? JSON.parse(saved) : INITIAL_REVISION_MATERIALS;
  });

  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudentContact[]>(() => {
    const saved = localStorage.getItem('uoe_registered_students');
    return saved ? JSON.parse(saved) : INITIAL_REGISTERED_STUDENTS;
  });

  const [notifications, setNotifications] = useState<WhatsAppNotification[]>(() => {
    const saved = localStorage.getItem('uoe_whatsapp_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('uoe_attendance_records');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'att-1',
        courseSessionId: 'course-1',
        unitCode: 'COM 220',
        studentName: 'Mercy Wanjiku Ndung’u',
        regNumber: 'SC/COM/014/22',
        email: 'mercy.wanjiku@student.uoeld.ac.ke',
        checkInTime: '07:54:12 AM',
        status: 'present',
        verificationMethod: 'qr_scanner'
      },
      {
        id: 'att-2',
        courseSessionId: 'course-1',
        unitCode: 'COM 220',
        studentName: 'Brian Kipchumba Rutto',
        regNumber: 'SC/COM/023/22',
        email: 'brian.kipchumba@student.uoeld.ac.ke',
        checkInTime: '07:58:30 AM',
        status: 'present',
        verificationMethod: 'qr_scanner'
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('uoe_user_profile', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('uoe_course_sessions', JSON.stringify(courseSessions));
  }, [courseSessions]);

  useEffect(() => {
    localStorage.setItem('uoe_personal_sessions', JSON.stringify(personalSessions));
  }, [personalSessions]);

  useEffect(() => {
    localStorage.setItem('uoe_revision_materials', JSON.stringify(revisionMaterials));
  }, [revisionMaterials]);

  useEffect(() => {
    localStorage.setItem('uoe_registered_students', JSON.stringify(registeredStudents));
  }, [registeredStudents]);

  useEffect(() => {
    localStorage.setItem('uoe_whatsapp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('uoe_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const handleRecordAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => [record, ...prev]);
    showToast(`Checked in: ${record.studentName} for ${record.unitCode}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch role seamlessly
  const handleToggleRole = () => {
    const newRole: UserRole = currentUser.role === 'student' ? 'class_rep' : 'student';
    const updated: UserProfile = {
      ...currentUser,
      role: newRole,
      isVerifiedRep: newRole === 'class_rep',
      fullName: newRole === 'class_rep' && currentUser.fullName.includes('Emmanuel') 
        ? 'Kevin Odhiambo' 
        : currentUser.fullName
    };
    setCurrentUser(updated);
    showToast(`Switched view to ${newRole === 'class_rep' ? 'Class Representative (Rep Edit Mode Active)' : 'Student Mode'}`);
  };

  // Course Timetable Handlers
  const handleUpdateCourseSession = (updated: CourseSession) => {
    setCourseSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(`Updated course session ${updated.unitCode}`);
  };

  const handleAddCourseSession = (session: CourseSession) => {
    setCourseSessions((prev) => [session, ...prev]);
    showToast(`Added ${session.unitCode} to course timetable`);
  };

  const handleDeleteCourseSession = (id: string) => {
    setCourseSessions((prev) => prev.filter((s) => s.id !== id));
    showToast('Course session deleted');
  };

  // Personal Timetable Handlers
  const handleAddPersonalSession = (session: PersonalSession) => {
    setPersonalSessions((prev) => [session, ...prev]);
    showToast(`Added "${session.title}" to your personal timetable`);
  };

  const handleUpdatePersonalSession = (updated: PersonalSession) => {
    setPersonalSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast('Personal session updated');
  };

  const handleDeletePersonalSession = (id: string) => {
    setPersonalSessions((prev) => prev.filter((s) => s.id !== id));
    showToast('Removed from personal timetable');
  };

  const handleSyncCourseToPersonal = (courseSession: CourseSession) => {
    // Check if already synced
    const exists = personalSessions.some((p) => p.courseSessionId === courseSession.id);
    if (exists) {
      showToast(`${courseSession.unitCode} is already in your personal timetable!`);
      return;
    }

    const newPersonal: PersonalSession = {
      id: `pers-${Date.now()}`,
      title: `${courseSession.unitCode}: ${courseSession.unitTitle}`,
      category: 'lecture',
      day: courseSession.day,
      startTime: courseSession.startTime,
      endTime: courseSession.endTime,
      venue: courseSession.venue,
      notes: `Official lecture with ${courseSession.lecturer}`,
      colorTag: courseSession.colorTag,
      isSyncedFromCourse: true,
      courseSessionId: courseSession.id
    };

    setPersonalSessions((prev) => [newPersonal, ...prev]);
    showToast(`Synced ${courseSession.unitCode} to your personal timetable`);
  };

  const handleSyncAllFromCourse = () => {
    const newItems: PersonalSession[] = [];
    courseSessions.forEach((c) => {
      const alreadyPresent = personalSessions.some((p) => p.courseSessionId === c.id);
      if (!alreadyPresent) {
        newItems.push({
          id: `pers-${Date.now()}-${c.id}`,
          title: `${c.unitCode}: ${c.unitTitle}`,
          category: 'lecture',
          day: c.day,
          startTime: c.startTime,
          endTime: c.endTime,
          venue: c.venue,
          notes: `Official class with ${c.lecturer}`,
          colorTag: c.colorTag,
          isSyncedFromCourse: true,
          courseSessionId: c.id
        });
      }
    });

    if (newItems.length === 0) {
      showToast('All course units are already synced in your personal timetable!');
      return;
    }

    setPersonalSessions((prev) => [...newItems, ...prev]);
    showToast(`Imported ${newItems.length} official lectures into your personal timetable!`);
  };

  // Revision Materials Handlers
  const handleUploadMaterial = (material: RevisionMaterial) => {
    setRevisionMaterials((prev) => [material, ...prev]);
    showToast(`Uploaded "${material.title}" to Revision Vault`);
  };

  // WhatsApp & Notification Handlers
  const handleAddStudentContact = (student: RegisteredStudentContact) => {
    setRegisteredStudents((prev) => [student, ...prev]);
    showToast(`Registered ${student.fullName}'s WhatsApp (${student.whatsappNumber})`);
  };

  const handleSendBroadcast = (notif: WhatsAppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Dispatched alert: "${notif.title}" to ${notif.targetCount} students`);
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setCurrentUser(profile);
    // Also ensure user is in registered student directory
    const existingIndex = registeredStudents.findIndex((s) => s.regNumber === profile.regNumber);
    if (existingIndex >= 0) {
      const updatedList = [...registeredStudents];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        fullName: profile.fullName,
        email: profile.email,
        whatsappNumber: profile.whatsappNumber,
        program: profile.program,
        year: profile.yearOfStudy,
        role: profile.role
      };
      setRegisteredStudents(updatedList);
    } else {
      setRegisteredStudents((prev) => [
        {
          id: `stud-${Date.now()}`,
          fullName: profile.fullName,
          regNumber: profile.regNumber,
          email: profile.email,
          whatsappNumber: profile.whatsappNumber,
          program: profile.program,
          year: profile.yearOfStudy,
          role: profile.role,
          dateAdded: new Date().toISOString().split('T')[0]
        },
        ...prev
      ]);
    }
    showToast('Registration profile updated!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-800 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Global Navigation */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onToggleRole={handleToggleRole}
        unreadCount={notifications.length}
      />

      {/* Main App Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            currentUser={currentUser}
            courseSessions={courseSessions}
            personalSessions={personalSessions}
            revisionMaterials={revisionMaterials}
            notifications={notifications}
            registeredStudentCount={registeredStudents.length}
            setActiveTab={setActiveTab}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onToggleRole={handleToggleRole}
          />
        )}

        {activeTab === 'course-timetable' && (
          <CourseTimetable
            courseSessions={courseSessions}
            currentUser={currentUser}
            onUpdateSession={handleUpdateCourseSession}
            onAddSession={handleAddCourseSession}
            onDeleteSession={handleDeleteCourseSession}
            onSyncToPersonal={handleSyncCourseToPersonal}
            onBroadcastNotification={(title, msg) => {
              handleSendBroadcast({
                id: `notif-${Date.now()}`,
                timestamp: 'Just now',
                sender: `${currentUser.fullName} (${currentUser.role === 'class_rep' ? 'Class Rep' : 'Student'})`,
                type: 'class_status',
                title,
                messageText: msg,
                targetCount: registeredStudents.length,
                status: 'delivered'
              });
            }}
          />
        )}

        {activeTab === 'personal-timetable' && (
          <PersonalTimetable
            personalSessions={personalSessions}
            courseSessions={courseSessions}
            currentUser={currentUser}
            onAddSession={handleAddPersonalSession}
            onUpdateSession={handleUpdatePersonalSession}
            onDeleteSession={handleDeletePersonalSession}
            onSyncAllFromCourse={handleSyncAllFromCourse}
          />
        )}

        {activeTab === 'revision-vault' && (
          <NotesRevisionVault
            materials={revisionMaterials}
            currentUser={currentUser}
            onUploadMaterial={handleUploadMaterial}
            onBroadcastNotification={(title, msg) => {
              handleSendBroadcast({
                id: `notif-${Date.now()}`,
                timestamp: 'Just now',
                sender: `${currentUser.fullName} (${currentUser.role === 'class_rep' ? 'Class Rep' : 'Student'})`,
                type: 'notes_upload',
                title,
                messageText: msg,
                targetCount: registeredStudents.length,
                status: 'delivered'
              });
            }}
          />
        )}

        {activeTab === 'whatsapp-hub' && (
          <WhatsAppBroadcastHub
            students={registeredStudents}
            notifications={notifications}
            currentUser={currentUser}
            courseSessions={courseSessions}
            onAddStudent={handleAddStudentContact}
            onSendBroadcast={handleSendBroadcast}
          />
        )}

        {activeTab === 'attendance-qr' && (
          <AttendanceQRScanner
            currentUser={currentUser}
            courseSessions={courseSessions}
            registeredStudents={registeredStudents}
            attendanceRecords={attendanceRecords}
            onRecordAttendance={handleRecordAttendance}
          />
        )}

        {activeTab === 'ai-exam-hub' && (
          <AIExamPredictor
            courseSessions={courseSessions}
            revisionMaterials={revisionMaterials}
            currentUser={currentUser}
            registeredStudentCount={registeredStudents.length}
            onSendBroadcast={handleSendBroadcast}
          />
        )}

        {activeTab === 'uoe-portals' && (
          <CampusPortals
            links={UOE_PORTAL_LINKS}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Floating AI Academic Assistant Chatbot */}
      <FloatingChatbot
        currentUser={currentUser}
        courseSessions={courseSessions}
        onOpenExamPredictor={(code) => setActiveTab('ai-exam-hub')}
      />

      {/* Student Profile Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
      />

      {/* Footer */}
      <footer className="bg-emerald-950 text-white border-t border-emerald-900/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">University of Eldoret (UoE)</span>
            <span>·</span>
            <span>Student Portal & Timetable Hub</span>
          </div>
          <div className="text-sm font-bold text-amber-300">
            By Benedict Otunga
          </div>
        </div>
      </footer>
    </div>
  );
}
