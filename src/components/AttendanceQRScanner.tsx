import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, CourseSession, AttendanceRecord, RegisteredStudentContact } from '../types';
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  Users, 
  Download, 
  Upload, 
  FileCheck, 
  Clock, 
  GraduationCap, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  RefreshCw,
  Share2
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import QRCode from 'qrcode';

interface AttendanceQRScannerProps {
  currentUser: UserProfile;
  courseSessions: CourseSession[];
  registeredStudents: RegisteredStudentContact[];
  attendanceRecords: AttendanceRecord[];
  onRecordAttendance: (record: AttendanceRecord) => void;
  onClearAttendance?: (unitCode: string) => void;
}

export const AttendanceQRScanner: React.FC<AttendanceQRScannerProps> = ({
  currentUser,
  courseSessions,
  registeredStudents,
  attendanceRecords,
  onRecordAttendance,
  onClearAttendance
}) => {
  const isRep = currentUser.role === 'class_rep';
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>(courseSessions[0]?.unitCode || 'COM 220');
  const [activeTab, setActiveTab] = useState<'scan' | 'my_id' | 'register'>('scan');

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [lastCheckInResult, setLastCheckInResult] = useState<{
    success: boolean;
    name: string;
    regNo: string;
    unit: string;
    time: string;
    message: string;
  } | null>(null);

  // Student ID QR Data URL
  const [studentIdQrUrl, setStudentIdQrUrl] = useState<string>('');
  const [lectureSessionQrUrl, setLectureSessionQrUrl] = useState<string>('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSession = courseSessions.find((s) => s.unitCode === selectedUnitCode) || courseSessions[0];

  // Generate QR code for current user's Student ID Card
  useEffect(() => {
    const studentPayload = JSON.stringify({
      type: 'UOE_STUDENT_ID',
      regNo: currentUser.regNumber,
      name: currentUser.fullName,
      email: currentUser.email,
      program: currentUser.program,
      dept: currentUser.department,
      issued: '2026'
    });

    QRCode.toDataURL(studentPayload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#064e3b', // Deep forest emerald
        light: '#ffffff'
      }
    }).then(setStudentIdQrUrl).catch(console.error);
  }, [currentUser]);

  // Generate dynamic QR code for the active lecture session
  useEffect(() => {
    if (activeSession) {
      const sessionPayload = JSON.stringify({
        type: 'UOE_LECTURE_SESSION',
        unitCode: activeSession.unitCode,
        unitTitle: activeSession.unitTitle,
        lecturer: activeSession.lecturer,
        venue: activeSession.venue,
        day: activeSession.day,
        timestamp: Date.now()
      });

      QRCode.toDataURL(sessionPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#022c22',
          light: '#ffffff'
        }
      }).then(setLectureSessionQrUrl).catch(console.error);
    }
  }, [activeSession]);

  // Process decoded QR text
  const handleDecodedQR = (decodedText: string) => {
    try {
      let regNo = '';
      let studentName = '';
      let studentEmail = '';

      if (decodedText.startsWith('{')) {
        const parsed = JSON.parse(decodedText);
        if (parsed.type === 'UOE_STUDENT_ID') {
          regNo = parsed.regNo;
          studentName = parsed.name;
          studentEmail = parsed.email || '';
        } else if (parsed.type === 'UOE_LECTURE_SESSION') {
          // Student scanned the lecture session QR code projected on screen!
          regNo = currentUser.regNumber;
          studentName = currentUser.fullName;
          studentEmail = currentUser.email;
        } else if (parsed.regNo) {
          regNo = parsed.regNo;
          studentName = parsed.name || 'Student';
          studentEmail = parsed.email || '';
        }
      } else {
        // Plain text format: e.g. "SC/COM/042/22" or "Emmanuel Otieno - SC/COM/042/22"
        const matchedStudent = registeredStudents.find(
          (s) => decodedText.includes(s.regNumber) || decodedText.includes(s.fullName)
        );
        if (matchedStudent) {
          regNo = matchedStudent.regNumber;
          studentName = matchedStudent.fullName;
          studentEmail = matchedStudent.email;
        } else {
          regNo = decodedText.trim();
          studentName = 'Registered Student';
        }
      }

      if (!regNo) {
        setScannerError('QR Code detected, but could not read a valid University of Eldoret Student Reg No.');
        return;
      }

      // Check if already checked in for this session today
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const alreadyCheckedIn = attendanceRecords.some(
        (r) => r.unitCode === selectedUnitCode && r.regNumber.toUpperCase() === regNo.toUpperCase()
      );

      if (alreadyCheckedIn) {
        setLastCheckInResult({
          success: true,
          name: studentName,
          regNo: regNo.toUpperCase(),
          unit: selectedUnitCode,
          time: nowTime,
          message: `${studentName} (${regNo.toUpperCase()}) is already checked in for ${selectedUnitCode} today!`
        });
        return;
      }

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        courseSessionId: activeSession?.id || 'session-1',
        unitCode: selectedUnitCode,
        studentName,
        regNumber: regNo.toUpperCase(),
        email: studentEmail || `${regNo.replace(/[\/\\]/g, '').toLowerCase()}@student.uoeld.ac.ke`,
        checkInTime: nowTime,
        status: 'present',
        verificationMethod: 'qr_scanner'
      };

      onRecordAttendance(newRecord);

      setLastCheckInResult({
        success: true,
        name: studentName,
        regNo: regNo.toUpperCase(),
        unit: selectedUnitCode,
        time: nowTime,
        message: `Attendance confirmed! Marked PRESENT for ${selectedUnitCode} (${activeSession?.venue || 'Science Complex'})`
      });

      // Clear error if any
      setScannerError(null);
    } catch (err: any) {
      setScannerError('Could not parse scanned QR payload: ' + (err?.message || 'Invalid format'));
    }
  };

  // Start Camera QR Scanner
  const startScanner = async () => {
    setScannerError(null);
    try {
      const qrScanner = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleDecodedQR(decodedText);
        },
        (errorMessage) => {
          // ignore transient frame decode errors
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera QR start error:', err);
      setScannerError(
        'Unable to access camera: ' + (err?.message || 'Permission denied or no webcam found. You can also upload a QR image below or use Quick Test Check-in.')
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle image upload scanning
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const tempScanner = new Html5Qrcode('qr-reader-file-temp');
      const result = await tempScanner.scanFile(file, true);
      handleDecodedQR(result);
    } catch (err: any) {
      setScannerError('Could not detect a clear QR code in this uploaded image. Ensure the code is sharp and well-lit.');
    }
  };

  // Filter records for active unit
  const currentUnitRecords = attendanceRecords.filter((r) => r.unitCode === selectedUnitCode);

  const handleManualCheckIn = (student: RegisteredStudentContact) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const exists = attendanceRecords.some(
      (r) => r.unitCode === selectedUnitCode && r.regNumber === student.regNumber
    );

    if (exists) {
      alert(`${student.fullName} is already marked present for ${selectedUnitCode}!`);
      return;
    }

    const rec: AttendanceRecord = {
      id: `att-${Date.now()}`,
      courseSessionId: activeSession?.id || 'session-1',
      unitCode: selectedUnitCode,
      studentName: student.fullName,
      regNumber: student.regNumber,
      email: student.email,
      checkInTime: nowTime,
      status: 'present',
      verificationMethod: 'rep_manual'
    };

    onRecordAttendance(rec);
    setLastCheckInResult({
      success: true,
      name: student.fullName,
      regNo: student.regNumber,
      unit: selectedUnitCode,
      time: nowTime,
      message: `Manual verification confirmed for ${student.fullName}!`
    });
  };

  // Export attendance register
  const handleExportAttendance = () => {
    let content = `UNIVERSITY OF ELDORET - LECTURE ATTENDANCE REGISTER\n`;
    content += `Unit Code: ${selectedUnitCode} - ${activeSession?.unitTitle || ''}\n`;
    content += `Lecturer: ${activeSession?.lecturer || ''}\n`;
    content += `Venue: ${activeSession?.venue || ''}\n`;
    content += `Date: ${new Date().toLocaleDateString()} | Total Present: ${currentUnitRecords.length}\n`;
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    content += `NO. | REG. NUMBER | STUDENT NAME | EMAIL | TIME CHECKED IN | METHOD\n`;
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    currentUnitRecords.forEach((rec, idx) => {
      content += `${idx + 1}. | ${rec.regNumber} | ${rec.studentName} | ${rec.email} | ${rec.checkInTime} | ${rec.verificationMethod}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UoE_Attendance_${selectedUnitCode}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Hidden container for file scan processing */}
      <div id="qr-reader-file-temp" className="hidden" />

      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" />
              Smart Attendance System
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">University of Eldoret Lecture Halls</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Student ID QR Code Scanner & Lecture Check-In
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Quick attendance verification: Students scan their official UoE Student ID Card (or scan the lecture session QR code projected in class) to instantly record their presence for lecture sessions.
          </p>
        </div>

        {/* Selected Unit Selector */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
          <label className="block text-[11px] font-bold text-emerald-950 mb-1">
            Active Lecture Session:
          </label>
          <select
            value={selectedUnitCode}
            onChange={(e) => setSelectedUnitCode(e.target.value)}
            className="px-2.5 py-1 text-xs font-mono font-bold text-emerald-900 bg-white border border-emerald-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            {courseSessions.map((c) => (
              <option key={c.id} value={c.unitCode}>
                {c.unitCode}: {c.unitTitle} ({c.venue})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'scan'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Live Camera & ID Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('my_id')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'my_id'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>My Digital Student ID Card</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'register'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Class Attendance Register ({currentUnitRecords.length} Present)</span>
        </button>
      </div>

      {/* TAB 1: Live QR Scanner */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Viewport (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Lecture Check-In: {selectedUnitCode}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Point camera at Student ID Card QR Code or class screen
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isScanning ? (
                    <button
                      onClick={startScanner}
                      className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Start Camera</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopScanner}
                      className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <CameraOff className="w-3.5 h-3.5" />
                      <span>Stop Camera</span>
                    </button>
                  )}
                </div>
              </div>

              {/* QR Scanner Frame Container */}
              <div className="relative min-h-[300px] bg-stone-950 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 border border-stone-800">
                <div id="qr-reader-container" className="w-full max-w-[320px] rounded-lg overflow-hidden" />

                {!isScanning && (
                  <div className="text-center p-6 text-stone-400">
                    <QrCode className="w-16 h-16 mx-auto mb-2 text-stone-500 opacity-60" />
                    <p className="text-xs font-medium text-stone-300">
                      Camera scanner is currently standby.
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto">
                      Click <strong>"Start Camera"</strong> to scan student ID cards, or use the instant test check-in buttons below.
                    </p>
                    <button
                      onClick={startScanner}
                      className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Activate Camera Scanner
                    </button>
                  </div>
                )}
              </div>

              {/* Error Callout */}
              {scannerError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{scannerError}</span>
                </div>
              )}

              {/* Secondary Scan Options: Image Upload & Quick Demo Scan */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>Upload ID Card QR Photo</span>
                  </button>
                </div>

                {/* Instant Check-In for Current User */}
                <button
                  onClick={() => {
                    handleDecodedQR(
                      JSON.stringify({
                        type: 'UOE_STUDENT_ID',
                        regNo: currentUser.regNumber,
                        name: currentUser.fullName,
                        email: currentUser.email
                      })
                    );
                  }}
                  className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold rounded-lg border border-emerald-300 flex items-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Quick Test Check-In: {currentUser.fullName.split(' ')[0]} ({currentUser.regNumber})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Result & Active Session QR (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Last Check-In Confirmation Banner */}
            {lastCheckInResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs animate-fade-in space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Verification Successful!</span>
                </div>
                <div className="text-xs text-emerald-800 space-y-1 pt-1 border-t border-emerald-200/60">
                  <p><strong>Student:</strong> {lastCheckInResult.name}</p>
                  <p className="font-mono"><strong>Reg. Number:</strong> {lastCheckInResult.regNo}</p>
                  <p><strong>Lecture Unit:</strong> {lastCheckInResult.unit}</p>
                  <p className="font-mono text-[11px] text-emerald-700"><strong>Timestamp:</strong> {lastCheckInResult.time}</p>
                </div>
              </div>
            )}

            {/* Lecture Hall Projector QR Code */}
            <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm text-center space-y-3">
              <div className="flex items-center justify-between text-left">
                <div>
                  <h4 className="font-bold text-xs text-stone-900">
                    Lecture Hall Session QR Code
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Project on screen for students to scan with their phones
                  </p>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                  {selectedUnitCode}
                </span>
              </div>

              {lectureSessionQrUrl ? (
                <div className="p-3 bg-white inline-block rounded-xl border border-stone-200 shadow-xs">
                  <img
                    src={lectureSessionQrUrl}
                    alt="Lecture Session QR Code"
                    className="w-44 h-44 mx-auto"
                  />
                  <span className="text-[10px] text-stone-500 font-mono block mt-1">
                    {activeSession?.venue || 'Science Complex LH 01'} · {activeSession?.day}
                  </span>
                </div>
              ) : null}

              <div className="text-xs text-stone-600">
                Students who scan this QR code will automatically have their registration number logged into the official attendance sheet.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Digital Student ID Card */}
      {activeTab === 'my_id' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-800 relative overflow-hidden">
            {/* Background Watermark Insignia */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-amber-400/10 pointer-events-none" />

            {/* University Header */}
            <div className="flex items-start justify-between border-b border-emerald-800/80 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                  Republic of Kenya
                </span>
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  UNIVERSITY OF ELDORET
                </h3>
                <p className="text-[10px] text-emerald-200">
                  Flame of Knowledge and Innovation · Student Identification
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-400 text-emerald-950 font-extrabold flex items-center justify-center text-sm shadow-sm">
                UoE
              </div>
            </div>

            {/* Student Info & Scannable QR Code */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Left: Scannable QR Code */}
              <div className="bg-white p-2.5 rounded-xl shadow-md shrink-0 text-center">
                {studentIdQrUrl ? (
                  <img
                    src={studentIdQrUrl}
                    alt="Student ID QR Code"
                    className="w-36 h-36 mx-auto rounded"
                  />
                ) : (
                  <div className="w-36 h-36 bg-stone-100 flex items-center justify-center text-xs text-stone-400">
                    Generating QR...
                  </div>
                )}
                <span className="text-[9px] font-mono text-stone-700 block mt-1 font-bold">
                  OFFICIAL ID QR
                </span>
              </div>

              {/* Right: Student Credentials */}
              <div className="space-y-2 text-xs text-emerald-100 flex-1 w-full">
                <div>
                  <span className="text-[10px] text-emerald-300 block uppercase font-semibold">
                    Student Full Name
                  </span>
                  <span className="font-bold text-sm text-white">
                    {currentUser.fullName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-emerald-300 block uppercase font-semibold">
                    Registration Number
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {currentUser.regNumber}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-emerald-300 block uppercase font-semibold">
                    Student Email
                  </span>
                  <span className="font-mono text-[11px] text-stone-200">
                    {currentUser.email || `${currentUser.regNumber.replace(/[\/\\]/g, '').toLowerCase()}@student.uoeld.ac.ke`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-800/60 text-[11px]">
                  <div>
                    <span className="text-emerald-300 block">Program:</span>
                    <span className="font-medium text-white truncate block">{currentUser.program}</span>
                  </div>
                  <div>
                    <span className="text-emerald-300 block">Academic Stage:</span>
                    <span className="font-medium text-white">Year {currentUser.yearOfStudy}, Sem {currentUser.semester}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ID Footer */}
            <div className="mt-4 pt-3 border-t border-emerald-800/80 flex items-center justify-between text-[10px] text-emerald-300">
              <span>Card Status: Active Valid Student</span>
              <span>Academic Year 2026/2027</span>
            </div>
          </div>

          <div className="text-center text-xs text-stone-500">
            Show this card on your phone screen to the Class Rep or scan it under the attendance camera at the lecture hall entrance.
          </div>
        </div>
      )}

      {/* TAB 3: Class Attendance Register */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Attendance Register: {selectedUnitCode} - {activeSession?.unitTitle}
              </h3>
              <p className="text-xs text-stone-500">
                Lecturer: {activeSession?.lecturer} · Venue: {activeSession?.venue}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAttendance}
                disabled={currentUnitRecords.length === 0}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Attendance Sheet</span>
              </button>
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Reg. Number</th>
                  <th className="px-4 py-3">Student Email</th>
                  <th className="px-4 py-3">Check-In Time</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {currentUnitRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                      No students have checked in for {selectedUnitCode} yet today. Use the Live Camera Scanner or manual check-in below.
                    </td>
                  </tr>
                ) : (
                  currentUnitRecords.map((rec, idx) => (
                    <tr key={rec.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-stone-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-stone-900">{rec.studentName}</td>
                      <td className="px-4 py-3 font-mono text-stone-700">{rec.regNumber}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-stone-500">{rec.email}</td>
                      <td className="px-4 py-3 font-mono text-stone-700">{rec.checkInTime}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                          {rec.verificationMethod === 'qr_scanner' ? 'QR Code Scan' : 'Manual Rep Verify'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          PRESENT
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Manual Check-In Bar for Class Rep */}
          <div className="p-4 bg-stone-50/80 border-t border-stone-200 space-y-2">
            <span className="font-bold text-xs text-stone-800 block">
              Quick Manual Check-In (For students with device or camera issues):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {registeredStudents.map((stud) => {
                const isPresent = currentUnitRecords.some((r) => r.regNumber === stud.regNumber);
                return (
                  <button
                    key={stud.id}
                    disabled={isPresent}
                    onClick={() => handleManualCheckIn(stud)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                      isPresent
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium cursor-default opacity-70'
                        : 'bg-white text-stone-700 hover:border-emerald-600 hover:text-emerald-900 border-stone-300'
                    }`}
                  >
                    {isPresent ? '✓ ' : '+ '}
                    {stud.fullName.split(' ')[0]} ({stud.regNumber})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
