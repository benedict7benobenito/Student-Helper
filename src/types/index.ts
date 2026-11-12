export type UserRole = 'student' | 'class_rep';

export interface UserProfile {
  id: string;
  fullName: string;
  regNumber: string; // e.g. "SC/COM/042/22"
  email: string; // e.g. "benedict.otunga@student.uoeld.ac.ke"
  department: string;
  program: string;
  yearOfStudy: number;
  semester: number;
  whatsappNumber: string; // "+254140908833"
  role: UserRole;
  isVerifiedRep: boolean;
  joinedAt: string;
}

export type ClassConfirmationStatus = 'confirmed' | 'cancelled' | 'rescheduled' | 'online' | 'pending';

export interface CourseSession {
  id: string;
  unitCode: string; // e.g. "COM 220"
  unitTitle: string; // e.g. "Database Management Systems"
  lecturer: string; // e.g. "Dr. Evans Kiprono"
  venue: string; // e.g. "Science Complex LH 01"
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // "08:00"
  endTime: string; // "11:00"
  status: ClassConfirmationStatus;
  statusNote?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  colorTag: string;
}

export interface PersonalSession {
  id: string;
  title: string;
  category: 'lecture' | 'personal_study' | 'group_discussion' | 'assignment' | 'library' | 'sports_clubs' | 'other';
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "14:00"
  endTime: string; // "16:00"
  venue: string;
  notes?: string;
  colorTag: string;
  isSyncedFromCourse?: boolean;
  courseSessionId?: string;
}

export type NoteCategory = 
  | 'lecture_notes' 
  | 'past_paper' 
  | 'cat_revision' 
  | 'summary_cheat_sheet' 
  | 'lab_report' 
  | 'assignment_solution';

export interface RevisionMaterial {
  id: string;
  title: string;
  unitCode: string;
  description: string;
  category: NoteCategory;
  uploadedBy: string;
  uploaderRole: UserRole;
  uploaderRegNo: string;
  uploadedAt: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'img' | 'zip';
  fileContent?: string; // Text preview or base64 preview
  fileName: string;
  isRepOfficial: boolean;
  isSharedWithClass: boolean;
  tags: string[];
  downloadsCount: number;
}

export interface WhatsAppNotification {
  id: string;
  timestamp: string;
  sender: string;
  type: 'class_status' | 'notes_upload' | 'urgent_announcement' | 'exam_cat_reminder';
  title: string;
  messageText: string;
  targetCount: number;
  status: 'delivered' | 'broadcasting' | 'queued';
  relatedUnitCode?: string;
}

export interface RegisteredStudentContact {
  id: string;
  fullName: string;
  regNumber: string;
  email: string;
  whatsappNumber: string;
  program: string;
  year: number;
  role: UserRole;
  dateAdded: string;
}

export interface AttendanceRecord {
  id: string;
  courseSessionId: string;
  unitCode: string;
  studentName: string;
  regNumber: string;
  email: string;
  checkInTime: string;
  status: 'present' | 'late';
  verificationMethod: 'qr_scanner' | 'digital_id' | 'rep_manual';
}

export interface PredictedExamPackage {
  unitCode: string;
  unitTitle: string;
  examType: 'main_exam' | 'cat_exam';
  examDate?: string;
  venue?: string;
  summary: string;
  predictedPaper: string;
  answeringGuide: string;
  whatsAppBroadcast: string;
  generatedAt: string;
}

export interface UoELinkItem {
  id: string;
  title: string;
  category: 'portal' | 'ecampus' | 'finance' | 'library' | 'support' | 'emergency';
  description: string;
  url: string;
  badge: string;
  actionText: string;
  iconName: string;
  importantInfo?: string;
  helpSteps?: string[];
}
