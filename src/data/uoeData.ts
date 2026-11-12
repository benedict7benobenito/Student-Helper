import { CourseSession, PersonalSession, RevisionMaterial, RegisteredStudentContact, UoELinkItem } from '../types';

export const INITIAL_COURSE_SESSIONS: CourseSession[] = [
  {
    id: 'course-1',
    unitCode: 'COM 220',
    unitTitle: 'Database Management Systems',
    lecturer: 'Dr. Evans Kiprono',
    venue: 'Science Complex LH 01',
    day: 'Monday',
    startTime: '08:00',
    endTime: '11:00',
    status: 'confirmed',
    statusNote: 'Confirmed by Dr. Evans. Carry laptops with MySQL workbench installed. CAT 1 discussion in the last 30 minutes.',
    lastUpdatedBy: 'Kevin Odhiambo (Class Rep)',
    lastUpdatedAt: 'Today at 07:15 AM',
    colorTag: 'emerald'
  },
  {
    id: 'course-2',
    unitCode: 'COM 221',
    unitTitle: 'Data Structures & Algorithms',
    lecturer: 'Prof. Dennis Omondi',
    venue: 'Forestry Annex 102',
    day: 'Monday',
    startTime: '14:00',
    endTime: '17:00',
    status: 'rescheduled',
    statusNote: 'Prof. Omondi shifted this session from 2:00 PM to 3:00 PM - 5:00 PM due to a Senate meeting. Venue remains Forestry Annex.',
    lastUpdatedBy: 'Kevin Odhiambo (Class Rep)',
    lastUpdatedAt: 'Today at 09:30 AM',
    colorTag: 'amber'
  },
  {
    id: 'course-3',
    unitCode: 'STA 210',
    unitTitle: 'Probability & Statistics for Computing',
    lecturer: 'Dr. Gladys Wanjala',
    venue: 'Education Complex LH 104',
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '12:00',
    status: 'confirmed',
    statusNote: 'Confirmed. We will finish Chapter 4 (Continuous Distributions). Please bring your scientific statistical tables.',
    lastUpdatedBy: 'Kevin Odhiambo (Class Rep)',
    lastUpdatedAt: 'Yesterday at 04:20 PM',
    colorTag: 'blue'
  },
  {
    id: 'course-4',
    unitCode: 'COM 223',
    unitTitle: 'System Analysis & Design',
    lecturer: 'Madam Faith Chemutai',
    venue: 'Computer Lab 02 (ICT Directorate)',
    day: 'Wednesday',
    startTime: '11:00',
    endTime: '14:00',
    status: 'pending',
    statusNote: 'Awaiting confirmation from Madam Faith regarding lab availability. Check WhatsApp notifications tomorrow at 9 AM.',
    lastUpdatedBy: 'Kevin Odhiambo (Class Rep)',
    lastUpdatedAt: 'Yesterday at 06:10 PM',
    colorTag: 'purple'
  },
  {
    id: 'course-5',
    unitCode: 'COM 224',
    unitTitle: 'Web Application Development',
    lecturer: 'Mr. Kenneth Koech',
    venue: 'Science Complex LH 02',
    day: 'Thursday',
    startTime: '08:00',
    endTime: '11:00',
    status: 'confirmed',
    statusNote: 'Confirmed. Group project presentations kickoff. Ensure your project repository links are submitted to the rep.',
    lastUpdatedBy: 'Kevin Odhiambo (Class Rep)',
    lastUpdatedAt: 'Today at 08:00 AM',
    colorTag: 'emerald'
  },
  {
    id: 'course-6',
    unitCode: 'PHY 112',
    unitTitle: 'Electricity & Semiconductor Physics',
    lecturer: 'Dr. Peter Wanyonyi',
    venue: 'Pavilion Main Hall',
    day: 'Friday',
    startTime: '09:00',
    endTime: '12:00',
    status: 'cancelled',
    statusNote: 'Cancelled! Dr. Wanyonyi is attending the National Physics Conference in Nairobi. A make-up lecture will be announced next week.',
    lastUpdatedBy: 'Kevin Odhiambo (Class Rep)',
    lastUpdatedAt: 'Today at 10:45 AM',
    colorTag: 'rose'
  }
];

export const INITIAL_PERSONAL_SESSIONS: PersonalSession[] = [
  {
    id: 'pers-1',
    title: 'COM 220: Database Systems',
    category: 'lecture',
    day: 'Monday',
    startTime: '08:00',
    endTime: '11:00',
    venue: 'Science Complex LH 01',
    notes: 'Official lecture with Dr. Evans Kiprono',
    colorTag: 'emerald',
    isSyncedFromCourse: true,
    courseSessionId: 'course-1'
  },
  {
    id: 'pers-2',
    title: 'Library Self-Revision & Assignment Prep',
    category: 'library',
    day: 'Monday',
    startTime: '11:30',
    endTime: '13:30',
    venue: 'New Main Campus Library (2nd Floor quiet carrel)',
    notes: 'Revise SQL queries and ER diagrams before evening class',
    colorTag: 'blue'
  },
  {
    id: 'pers-3',
    title: 'COM 221: Data Structures Lecture',
    category: 'lecture',
    day: 'Monday',
    startTime: '15:00',
    endTime: '17:00',
    venue: 'Forestry Annex 102',
    notes: 'Rescheduled time slot by Prof. Omondi',
    colorTag: 'amber',
    isSyncedFromCourse: true,
    courseSessionId: 'course-2'
  },
  {
    id: 'pers-4',
    title: 'Group 4 Web Dev Discussion',
    category: 'group_discussion',
    day: 'Tuesday',
    startTime: '14:00',
    endTime: '16:00',
    venue: 'Pavilion Gazebo benches',
    notes: 'Review UI mockups and API endpoints with Brian & Faith',
    colorTag: 'purple'
  },
  {
    id: 'pers-5',
    title: 'Campus Football & Athletics Practice',
    category: 'sports_clubs',
    day: 'Wednesday',
    startTime: '16:30',
    endTime: '18:30',
    venue: 'UoE Sports Pavilion Grounds',
    notes: 'Intramural tournament training',
    colorTag: 'rose'
  },
  {
    id: 'pers-6',
    title: 'Late Night Coding / LeetCode Sprint',
    category: 'personal_study',
    day: 'Thursday',
    startTime: '19:30',
    endTime: '21:30',
    venue: 'Hostel Room / Hall 4 Study Area',
    notes: 'Implement Binary Search Trees & Graph traversal in C++',
    colorTag: 'indigo'
  }
];

export const INITIAL_REGISTERED_STUDENTS: RegisteredStudentContact[] = [
  {
    id: 'stud-1',
    fullName: 'Kevin Odhiambo',
    regNumber: 'SC/COM/001/22',
    email: 'kevin.odhiambo@student.uoeld.ac.ke',
    whatsappNumber: '+254 712 984 551',
    program: 'BSc. Computer Science',
    year: 2,
    role: 'class_rep',
    dateAdded: '2024-09-02'
  },
  {
    id: 'stud-2',
    fullName: 'Mercy Wanjiku Ndung’u',
    regNumber: 'SC/COM/014/22',
    email: 'mercy.wanjiku@student.uoeld.ac.ke',
    whatsappNumber: '+254 728 411 902',
    program: 'BSc. Computer Science',
    year: 2,
    role: 'student',
    dateAdded: '2024-09-03'
  },
  {
    id: 'stud-3',
    fullName: 'Brian Kipchumba Rutto',
    regNumber: 'SC/COM/023/22',
    email: 'brian.kipchumba@student.uoeld.ac.ke',
    whatsappNumber: '+254 791 320 847',
    program: 'BSc. Computer Science',
    year: 2,
    role: 'student',
    dateAdded: '2024-09-03'
  },
  {
    id: 'stud-4',
    fullName: 'Faith Cherono',
    regNumber: 'SC/COM/031/22',
    email: 'faith.cherono@student.uoeld.ac.ke',
    whatsappNumber: '+254 745 619 238',
    program: 'BSc. Computer Science',
    year: 2,
    role: 'student',
    dateAdded: '2024-09-04'
  },
  {
    id: 'stud-5',
    fullName: 'Emmanuel Otieno Achieng',
    regNumber: 'SC/COM/042/22',
    email: 'emmanuel.otieno@student.uoeld.ac.ke',
    whatsappNumber: '+254 718 554 901',
    program: 'BSc. Computer Science',
    year: 2,
    role: 'student',
    dateAdded: '2024-09-05'
  },
  {
    id: 'stud-6',
    fullName: 'Cynthia Chepkemoi',
    regNumber: 'SC/COM/055/22',
    email: 'cynthia.chepkemoi@student.uoeld.ac.ke',
    whatsappNumber: '+254 703 147 882',
    program: 'BSc. Computer Science',
    year: 2,
    role: 'student',
    dateAdded: '2024-09-06'
  },
  {
    id: 'stud-7',
    fullName: 'David Mwangi Kariuki',
    regNumber: 'SC/COM/067/22',
    email: 'david.mwangi@student.uoeld.ac.ke',
    whatsappNumber: '+254 799 443 210',
    program: 'BSc. Computer Science',
    year: 2,
    role: 'student',
    dateAdded: '2024-09-07'
  }
];

export const INITIAL_REVISION_MATERIALS: RevisionMaterial[] = [
  {
    id: 'rev-1',
    title: 'COM 220: Complete SQL Normalization & Indexing Guide',
    unitCode: 'COM 220',
    description: 'Detailed lecture notes covering 1NF to BCNF with step-by-step decomposition examples, foreign key constraints, and performance tuning query exercises.',
    category: 'lecture_notes',
    uploadedBy: 'Kevin Odhiambo (Class Rep)',
    uploaderRole: 'class_rep',
    uploaderRegNo: 'SC/COM/001/22',
    uploadedAt: 'Yesterday, 6:40 PM',
    fileSize: '3.4 MB',
    fileType: 'pdf',
    fileName: 'COM220_Database_Normalization_Notes_UoE.pdf',
    isRepOfficial: true,
    isSharedWithClass: true,
    tags: ['Database', 'SQL', 'Normalization', 'Exam Prep'],
    downloadsCount: 48,
    fileContent: `UNIVERSITY OF ELDORET - SCHOOL OF SCIENCE\nDepartment of Mathematics & Computer Science\nUnit: COM 220 Database Management Systems\n\nChapter 3: Relational Database Normalization\n1. Functional Dependencies (X -> Y)\n2. First Normal Form (1NF): Elimination of repeating groups and multi-valued attributes.\n3. Second Normal Form (2NF): Removal of partial dependencies on candidate keys.\n4. Third Normal Form (3NF): Elimination of transitive dependencies (non-prime -> non-prime).\n5. Boyce-Codd Normal Form (BCNF): For every non-trivial FD X -> Y, X must be a superkey.\n\nPractice Question:\nGiven relation R(A, B, C, D, E) with FDs: A -> B, CD -> E, B -> D. Identify candidate keys and decompose to 3NF.`
  },
  {
    id: 'rev-2',
    title: 'COM 221: Past Continuous Assessment Test (CAT 1 & 2) with Marking Schemes',
    unitCode: 'COM 221',
    description: 'Compiled past CAT papers for Data Structures from 2022-2024 academic years with worked solutions for Trees, Linked Lists, and Big-O Complexity.',
    category: 'past_paper',
    uploadedBy: 'Kevin Odhiambo (Class Rep)',
    uploaderRole: 'class_rep',
    uploaderRegNo: 'SC/COM/001/22',
    uploadedAt: 'Nov 8, 2026',
    fileSize: '2.1 MB',
    fileType: 'pdf',
    fileName: 'COM221_Past_CATs_2022_2024_Solutions.pdf',
    isRepOfficial: true,
    isSharedWithClass: true,
    tags: ['Data Structures', 'Past Paper', 'CAT', 'Solutions'],
    downloadsCount: 73,
    fileContent: `UNIVERSITY OF ELDORET\nContinuous Assessment Test (CAT 1) - Semester 2\nUnit: COM 221 Data Structures & Algorithms\nTime: 1.5 Hours\n\nQuestion 1 (10 Marks):\n(a) Define asymptotic time complexity. Differentiate between Big-O and Big-Omega notation.\n(b) Write a recursive algorithm to traverse a Binary Search Tree in-order.\n\nSolution Guide:\nIn-order traversal produces non-decreasing sorted order for BST.\nAlgorithm InOrder(root):\n  if root != null:\n    InOrder(root.left)\n    print(root.data)\n    InOrder(root.right)`
  },
  {
    id: 'rev-3',
    title: 'STA 210: Comprehensive Probability Formulas & Quick Cheat Sheet',
    unitCode: 'STA 210',
    description: 'Handwritten summarized cheat sheet created during group study. Covers Bayes Theorem, Binomial, Poisson, Normal Distribution Z-score transformations, and Hypothesis Testing.',
    category: 'summary_cheat_sheet',
    uploadedBy: 'Mercy Wanjiku',
    uploaderRole: 'student',
    uploaderRegNo: 'SC/COM/014/22',
    uploadedAt: 'Nov 10, 2026',
    fileSize: '1.8 MB',
    fileType: 'pdf',
    fileName: 'STA210_Summary_Formula_Sheet_Wanjiku.pdf',
    isRepOfficial: false,
    isSharedWithClass: true,
    tags: ['Statistics', 'Formulas', 'Cheat Sheet', 'Z-table'],
    downloadsCount: 39,
    fileContent: `STA 210 SUMMARY CHEAT SHEET\n\n1. Probability Axioms & Conditional Probability:\nP(A|B) = P(A ∩ B) / P(B)\nBayes Rule: P(Bi|A) = [P(A|Bi)P(Bi)] / [∑ P(A|Bj)P(Bj)]\n\n2. Discrete Distributions:\nBinomial: P(X = k) = C(n, k) * p^k * (1-p)^(n-k)\nMean = np, Var = np(1-p)\nPoisson: P(X = k) = (e^(-λ) * λ^k) / k!\n\n3. Continuous Distributions:\nNormal Standardization: Z = (X - μ) / σ\nCentral Limit Theorem: For n >= 30, sample mean approaches Normal(μ, σ^2/n).`
  },
  {
    id: 'rev-4',
    title: 'COM 224: Web Technologies Laboratory Manual & Sample Code',
    unitCode: 'COM 224',
    description: 'Official lab sheets for React + Node.js backend setup, REST API design, and Tailwind CSS responsive grid layout assignment.',
    category: 'lab_report',
    uploadedBy: 'Kevin Odhiambo (Class Rep)',
    uploaderRole: 'class_rep',
    uploaderRegNo: 'SC/COM/001/22',
    uploadedAt: 'Nov 6, 2026',
    fileSize: '4.8 MB',
    fileType: 'pdf',
    fileName: 'COM224_WebDev_Lab_Manual_Full.pdf',
    isRepOfficial: true,
    isSharedWithClass: true,
    tags: ['Web Dev', 'React', 'Lab Manual', 'JavaScript'],
    downloadsCount: 55,
    fileContent: `UNIVERSITY OF ELDORET - ICT LABORATORY MANUAL\nCOM 224: Web Application Development\nInstructor: Mr. Kenneth Koech\n\nLab 03: Building a RESTful API and Responsive React Client\nObjectives:\n1. Initialize Vite project with Tailwind CSS.\n2. Create Express endpoint for Student Course Registration.\n3. Handle CORS, JSON payloads, and state persistence.\n\nSubmission deadline: Next Thursday before 5:00 PM.`
  }
];

export const UOE_PORTAL_LINKS: UoELinkItem[] = [
  {
    id: 'link-portal',
    title: 'UoE Student Portal (ERP)',
    category: 'portal',
    description: 'Official university ERP portal for semester course registration, semester fee statements, provisional exam results, exam card downloading, and room clearance.',
    url: 'https://portal.uoeld.ac.ke/',
    badge: 'Core Academic ERP',
    actionText: 'Open Student Portal',
    iconName: 'GraduationCap',
    importantInfo: 'Login with your Student Registration Number (e.g., SC/COM/042/22) and national ID or password.',
    helpSteps: [
      'Enter Registration Number without spaces (e.g. SC/COM/042/22)',
      'First-time students default password is your National ID number or KCSE Index number',
      'Download and print your Exam Card at least 1 week before the start of University Examinations',
      'Ensure 100% tuition fees clearance for finance validation stamp'
    ]
  },
  {
    id: 'link-ecampus',
    title: 'UoE E-Campus (Moodle LMS)',
    category: 'ecampus',
    description: 'University of Eldoret Virtual Learning Environment. Access lecture slides, submit assignments, take online CATs, and join virtual classes.',
    url: 'https://ecampus.uoeld.ac.ke/',
    badge: 'Online Learning LMS',
    actionText: 'Launch E-Campus LMS',
    iconName: 'Monitor',
    importantInfo: 'Lecturers publish course outlines, online quizzes, and digital submission links here.',
    helpSteps: [
      'Username is your student email (e.g., surname.regno@student.uoeld.ac.ke) or Reg Number',
      'If your course units are not visible, click "Self-Enrollment" or inform your Class Representative with course unit code',
      'Keep files under 20MB when submitting assignment attachments'
    ]
  },
  {
    id: 'link-ict-help',
    title: 'E-Campus Helpdesk & ICT Support',
    category: 'support',
    description: 'Dedicated support for forgotten portal passwords, student institutional email provisioning, Wi-Fi onboarding (Eduroam), and LMS enrollments.',
    url: 'https://helpdesk.uoeld.ac.ke/',
    badge: 'ICT Directorate Help',
    actionText: 'Submit Support Ticket',
    iconName: 'Headphones',
    importantInfo: 'Email: ictsupport@uoeld.ac.ke | Location: ICT Center next to Science Complex.',
    helpSteps: [
      'Email ictsupport@uoeld.ac.ke from your personal email with your Full Name, Reg No, and clear screenshot of error',
      'For immediate Eduroam Wi-Fi configuration, visit the ICT Helpdesk Counter on 1st Floor Science Complex',
      'Operating Hours: Mon - Fri: 8:00 AM – 5:00 PM'
    ]
  },
  {
    id: 'link-fees',
    title: 'Tuition Fee Payment & Bank Accounts',
    category: 'finance',
    description: 'Official University of Eldoret Bank Accounts and verified M-Pesa Paybill instructions for instant automatic fee statement reconciliation.',
    url: 'https://www.uoeld.ac.ke/fees-payment',
    badge: 'M-Pesa & Bank Pay',
    actionText: 'View Fee Payment Guide',
    iconName: 'CreditCard',
    importantInfo: 'UoE Official Paybill: 837400 | Account No: Your Student Registration Number (e.g. SC/COM/042/22)',
    helpSteps: [
      'Go to M-Pesa -> Lipa na M-Pesa -> Paybill',
      'Enter Business Number: 837400',
      'Enter Account Number: Your exact Reg Number (e.g. SC/COM/042/22)',
      'Enter fee amount and your M-Pesa PIN',
      'Wait for M-Pesa confirmation SMS; portal statement updates within 15–30 minutes',
      'For Bank deposit: National Bank (A/C 0102107336100 Eldoret Branch) or Co-op Bank (A/C 01129183170000)'
    ]
  },
  {
    id: 'link-library',
    title: 'UoE University Library & Past Papers Repository',
    category: 'library',
    description: 'Digital catalog (OPAC), past university examination papers repository, e-journals, Research4Life, Emerald Insight, and JSTOR off-campus access.',
    url: 'https://library.uoeld.ac.ke/',
    badge: 'E-Resources & Past Papers',
    actionText: 'Access Library Repository',
    iconName: 'BookOpen',
    importantInfo: 'Search by unit code (e.g. "COM 220") to find past university exam papers from 2018-2025.',
    helpSteps: [
      'Access the Digital Institutional Repository (DSpace) for archived past papers',
      'Request off-campus RemotLog / OpenAthens library login credentials from the reference desk',
      'Book postgraduate and undergraduate group study discussion carrels in advance'
    ]
  },
  {
    id: 'link-emergency',
    title: 'University Health Services & Emergency Contacts',
    category: 'emergency',
    description: 'Main Campus Health Center (Dispensary), 24/7 campus ambulance standby, campus security control, and Dean of Students counseling office.',
    url: 'tel:+254774249552',
    badge: '24/7 Emergency Line',
    actionText: 'Call Dispensary (+254 774 249 552)',
    iconName: 'ShieldAlert',
    importantInfo: 'Campus Security Hotlines: 0774 249 550 / 0774 249 551 | Dispensary: 0774 249 552',
    helpSteps: [
      'Dispensary provides outpatient medical services, pharmacy, laboratory tests and emergency ambulance transfer',
      'Carry your Valid University Student ID card for clinic registration',
      'Dean of Students Welfare office located at Administration Block Ground Floor'
    ]
  }
];
