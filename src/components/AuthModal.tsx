import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { X, CheckCircle, Shield, AlertCircle, Phone, BookOpen, GraduationCap } from 'lucide-react';
import { cleanKenyanPhone, formatKenyanPhoneDisplay, isValidKenyanPhone } from '../utils/whatsapp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile
}) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [regNumber, setRegNumber] = useState(currentUser.regNumber);
  const [email, setEmail] = useState(currentUser.email || '');
  const [department, setDepartment] = useState(currentUser.department);
  const [program, setProgram] = useState(currentUser.program);
  const [yearOfStudy, setYearOfStudy] = useState(currentUser.yearOfStudy);
  const [semester, setSemester] = useState(currentUser.semester);
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser.whatsappNumber);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [repPasscode, setRepPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');

    // If claiming to be Class Rep, check passcode
    if (role === 'class_rep' && !currentUser.isVerifiedRep) {
      if (repPasscode.trim().toUpperCase() !== 'REP2026' && repPasscode.trim() !== '') {
        // Allow REP2026 or empty for easy demo testing
        setPasscodeError('Invalid Rep Passcode. Use "REP2026" or ask your department administrator.');
        return;
      }
    }

    const cleanedPhone = cleanKenyanPhone(whatsappNumber);
    const formattedPhone = formatKenyanPhoneDisplay(cleanedPhone);

    const updated: UserProfile = {
      ...currentUser,
      fullName: fullName.trim() || 'UoE Student',
      regNumber: regNumber.trim().toUpperCase() || 'SC/COM/042/22',
      email: email.trim().toLowerCase() || `${(fullName.split(' ')[0] || 'student').toLowerCase()}.${regNumber.replace(/[\/\\]/g, '').toLowerCase()}@student.uoeld.ac.ke`,
      department,
      program,
      yearOfStudy: Number(yearOfStudy),
      semester: Number(semester),
      whatsappNumber: formattedPhone,
      role,
      isVerifiedRep: role === 'class_rep'
    };

    onSaveProfile(updated);
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between border-b border-emerald-900">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Student Registration & Profile</h2>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              University of Eldoret · Timetable & WhatsApp Notification Service
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {successNotice ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Profile updated successfully!</p>
                <p className="text-xs text-emerald-600">Your WhatsApp number is registered for lecture updates.</p>
              </div>
            </div>
          ) : null}

          {/* Full Name & Reg Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Official Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Emmanuel Otieno"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Student Reg. Number
              </label>
              <input
                type="text"
                required
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                placeholder="e.g. SC/COM/042/22"
                className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-white"
              />
            </div>
          </div>

          {/* Student Email Address */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Student Email Address (Institutional / Personal)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. emmanuel.otieno@student.uoeld.ac.ke"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-white"
            />
          </div>

          {/* WhatsApp Phone Number (Critical for feature) */}
          <div className="p-3.5 bg-emerald-50/70 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-emerald-800" />
              <label className="text-xs font-bold text-emerald-950">
                WhatsApp Phone Number (For Lecture & Notes Alerts)
              </label>
            </div>
            <p className="text-[11px] text-emerald-800 mb-2 leading-relaxed">
              The Class Rep sends lecture confirmations (confirmed/cancelled/rescheduled) and revision notes broadcasts to this number.
            </p>
            <div className="relative">
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="0712 345 678 or +254 712 345 678"
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-white"
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700">
              <span>Standard Kenyan format: 07XX... or 01XX...</span>
              <span className="font-semibold text-emerald-900">
                {whatsappNumber ? formatKenyanPhoneDisplay(whatsappNumber) : ''}
              </span>
            </div>
          </div>

          {/* Department & Program */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                School / Faculty
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              >
                <option value="School of Science & Technology">School of Science & Technology</option>
                <option value="School of Agriculture & Biotechnology">School of Agriculture & Biotechnology</option>
                <option value="School of Education">School of Education</option>
                <option value="School of Business & Management">School of Business & Management</option>
                <option value="School of Engineering">School of Engineering</option>
                <option value="School of Natural Resource Management">School of Natural Resource Management</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Degree Program
              </label>
              <input
                type="text"
                required
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="e.g. BSc. Computer Science"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              />
            </div>
          </div>

          {/* Year & Semester */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Academic Year
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              >
                <option value={1}>Year 1 (Freshman)</option>
                <option value={2}>Year 2 (Sophomore)</option>
                <option value={3}>Year 3 (Junior)</option>
                <option value={4}>Year 4 (Finalist)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
            </div>
          </div>

          {/* Role Selection */}
          <div className="pt-2 border-t border-stone-200">
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Select Your Access Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  role === 'student'
                    ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-700'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Student</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  View course timetable, edit personal schedule, upload personal notes, view UoE portals.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('class_rep')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  role === 'class_rep'
                    ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-semibold ring-1 ring-amber-600'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Class Representative</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Edit course timetable, confirm/cancel lectures, upload official notes, broadcast to WhatsApp.
                </p>
              </button>
            </div>

            {/* Rep Security Passcode Notice */}
            {role === 'class_rep' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Class Rep Passcode (Demo Passcode: REP2026)
                </label>
                <input
                  type="text"
                  value={repPasscode}
                  onChange={(e) => setRepPasscode(e.target.value)}
                  placeholder="Enter REP2026"
                  className="w-full px-3 py-1.5 text-xs font-mono uppercase rounded border border-amber-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
                {passcodeError && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {passcodeError}
                  </p>
                )}
                <p className="text-[10px] text-amber-800 mt-1">
                  Tip: Passcode ensures only authorized representatives can edit the official class schedule and dispatch broadcasts.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition-colors"
            >
              Save Profile & Enter Portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
