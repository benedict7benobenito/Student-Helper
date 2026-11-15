import sqlite3, os, time, urllib.parse, requests, re
from flask import Flask, render_template, request, redirect, session, jsonify, g, send_from_directory
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

load_dotenv()
app = Flask(__name__)
app.secret_key = "student-helper-secret-2026"
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "").strip()
REP_CODE = "UOE-2026"
PRESIDENT_CODE = "UNI-EXC-2026"
DB = "app.db"
UPLOAD_FOLDER = '/tmp/uploads' if os.environ.get('VERCEL') else 'uploads'
try:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
except OSError:
    pass
ALLOWED_EXT = {"pdf", "docx", "pptx", "jpg", "png", "jpeg"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

BANNED_WORDS = ["fuck","shit","bitch","porn","sex","nude","kill yourself","hate","racist","tribal","idiot","stupid bitch","dick","pussy","asshole"]
def contains_banned(text):
    t = (text or "").lower()
    return any(w in t for w in BANNED_WORDS)

# ============================================================
# ALL KENYAN UNIVERSITIES - CUE APPROVED as at 5 Nov 2026
# 36 Public + 33 Private + 3 Specialised + Constituent Colleges
# Source: Commission for University Education (CUE)
# Format: CODE : (Full Name, website domain, type)
# ============================================================
UNIVERSITY_LIST = [
    # PUBLIC CHARTERED - 36
    ("UoN", "University of Nairobi", "uonbi.ac.ke", "Public"),
    ("Moi", "Moi University", "mu.ac.ke", "Public"),
    ("KU", "Kenyatta University", "ku.ac.ke", "Public"),
    ("Egerton", "Egerton University", "egerton.ac.ke", "Public"),
    ("JKUAT", "Jomo Kenyatta University of Agriculture and Technology", "jkuat.ac.ke", "Public"),
    ("Maseno", "Maseno University", "maseno.ac.ke", "Public"),
    ("MMUST", "Masinde Muliro University of Science and Technology", "mmust.ac.ke", "Public"),
    ("DKUT", "Dedan Kimathi University of Technology", "dkut.ac.ke", "Public"),
    ("Chuka", "Chuka University", "chuka.ac.ke", "Public"),
    ("TUK", "Technical University of Kenya", "tuk.ac.ke", "Public"),
    ("TUM", "Technical University of Mombasa", "tum.ac.ke", "Public"),
    ("Pwani", "Pwani University", "pu.ac.ke", "Public"),
    ("Kisii", "Kisii University", "kisiiuniversity.ac.ke", "Public"),
    ("UoE", "University of Eldoret", "uoeld.ac.ke", "Public"),
    ("MMara", "Maasai Mara University", "mmarau.ac.ke", "Public"),
    ("JOOUST", "Jaramogi Oginga Odinga University of Science and Technology", "jooust.ac.ke", "Public"),
    ("Laikipia", "Laikipia University", "laikipia.ac.ke", "Public"),
    ("SEKU", "South Eastern Kenya University", "seku.ac.ke", "Public"),
    ("MUST", "Meru University of Science and Technology", "must.ac.ke", "Public"),
    ("MMU", "Multimedia University of Kenya", "mmu.ac.ke", "Public"),
    ("Kabianga", "University of Kabianga", "kabianga.ac.ke", "Public"),
    ("Karatina", "Karatina University", "karatinauniversity.ac.ke", "Public"),
    ("Kibabii", "Kibabii University", "kibu.ac.ke", "Public"),
    ("Rongo", "Rongo University", "rongovarsity.ac.ke", "Public"),
    ("CUK", "The Co-operative University of Kenya", "cuk.ac.ke", "Public"),
    ("TTU", "Taita Taveta University", "ttu.ac.ke", "Public"),
    ("MUT", "Murang'a University of Technology", "mut.ac.ke", "Public"),
    ("UoEmbu", "University of Embu", "embuni.ac.ke", "Public"),
    ("Machakos", "Machakos University", "mksu.ac.ke", "Public"),
    ("Kirinyaga", "Kirinyaga University", "kyu.ac.ke", "Public"),
    ("Garissa", "Garissa University", "gau.ac.ke", "Public"),
    ("Alupe", "Alupe University", "au.ac.ke", "Public"),
    ("KAFU", "Kaimosi Friends University", "kafuco.ac.ke", "Public"),
    ("TomMboya", "Tom Mboya University", "tmu.ac.ke", "Public"),
    ("Tharaka", "Tharaka University", "tharaka.ac.ke", "Public"),
    ("Bomet", "Bomet University", "bomet.ac.ke", "Public"),
    # PRIVATE CHARTERED - 33
    ("Baraton", "University of Eastern Africa, Baraton", "ueab.ac.ke", "Private"),
    ("CUEA", "Catholic University of Eastern Africa", "cuea.edu", "Private"),
    ("Daystar", "Daystar University", "daystar.ac.ke", "Private"),
    ("Scott", "Scott Christian University", "scott.ac.ke", "Private"),
    ("USIU", "United States International University - Africa", "usiu.ac.ke", "Private"),
    ("ANU", "Africa Nazarene University", "anu.ac.ke", "Private"),
    ("KeMU", "Kenya Methodist University", "kemu.ac.ke", "Private"),
    ("SPU", "St. Paul's University", "spu.ac.ke", "Private"),
    ("PAC", "Pan Africa Christian University", "pacuniversity.ac.ke", "Private"),
    ("Strathmore", "Strathmore University", "strathmore.edu", "Private"),
    ("Kabarak", "Kabarak University", "kabarak.ac.ke", "Private"),
    ("MKU", "Mount Kenya University", "mku.ac.ke", "Private"),
    ("AIU", "Africa International University", "aiu.ac.ke", "Private"),
    ("KHEU", "Kenya Highlands Evangelical University", "kheu.ac.ke", "Private"),
    ("GLUK", "Great Lakes University of Kisumu", "gluk.ac.ke", "Private"),
    ("KCA", "KCA University", "kca.ac.ke", "Private"),
    ("AUA", "Adventist University of Africa", "aua.ac.ke", "Private"),
    ("KAGEAST", "KAG EAST University", "kag-east.ac.ke", "Private"),
    ("Umma", "Umma University", "umma.ac.ke", "Private"),
    ("PUEA", "Presbyterian University of East Africa", "puea.ac.ke", "Private"),
    ("AKU", "Aga Khan University", "aku.edu", "Private"),
    ("Kiriri", "Kiriri Women's University of Science and Technology", "kwust.ac.ke", "Private"),
    ("EAU", "The East African University", "teau.ac.ke", "Private"),
    ("Zetech", "Zetech University", "zetech.ac.ke", "Private"),
    ("Lukenya", "Lukenya University", "lukenyauniversity.ac.ke", "Private"),
    ("MUA", "Management University of Africa", "mua.ac.ke", "Private"),
    ("Tangaza", "Tangaza University", "tangaza.ac.ke", "Private"),
    ("IUK", "Islamic University of Kenya", "iuk.ac.ke", "Private"),
    ("Riara", "Riara University", "riarauniversity.ac.ke", "Private"),
    ("Uzima", "Uzima University", "uzimauniversity.ac.ke", "Private"),
    ("Amref", "Amref International University", "amref.ac.ke", "Private"),
    ("Gretsa", "Gretsa University", "gretsauniversity.ac.ke", "Private"),
    ("ILU", "International Leadership University", "ilu.ac.ke", "Private"),
    # SPECIALISED / CONSTITUENT / LIA
    ("NDU", "National Defence University-Kenya", "ndu.ac.ke", "Specialised"),
    ("OUK", "Open University of Kenya", "ouk.ac.ke", "Specialised"),
    ("NIRU", "National Intelligence Research University", "niru.ac.ke", "Specialised"),
    ("TurkanaUC", "Turkana University College", "tuc.ac.ke", "Public"),
    ("Koitaleel", "Koitaleel Samoei University College", "ksuc.ac.ke", "Public"),
    ("MamaNgina", "Mama Ngina University College", "mnuc.ac.ke", "Public"),
    ("KAIST", "Kenya Advanced Institute of Science and Technology", "kaist.ac.ke", "Public"),
    ("NyandaruaUC", "Nyandarua University College", "nuc.ac.ke", "Public"),
    ("KabarnetUC", "Kabarnet University College", "kabarnet.ac.ke", "Public"),
    ("MakueniUC", "Makueni University College", "makueni.ac.ke", "Public"),
    ("Pioneer", "Pioneer International University", "piu.ac.ke", "Private"),
    ("Genesis", "Genesis University", "genesis.ac.ke", "Private"),
    ("Hekima", "Hekima University College", "hekima.ac.ke", "Private"),
    ("Marist", "Marist International University College", "miuc.ac.ke", "Private"),
    ("Consolata", "Consolata International University", "ciu.ac.ke", "Private"),
    ("Outspan", "Outspan Global University", "outspan.ac.ke", "Private"),
    ("Other", "Other University - New / Not Yet Listed", "kuccps.net", "Other"),
]

def _build_uni_data():
    data = {}
    for code, name, domain, typ in UNIVERSITY_LIST:
        data[code] = {
            "name": name,
            "portal": f"https://{domain}",
            "portal_name": f"{name} Portal",
            "elearning": f"https://{domain}",
            "helb": "https://www.helb.co.ke",
            "kuccps": "https://students.kuccps.net/",
            "past_papers": f"https://{domain}",
            "emails": f"Check {name} website - {domain} | HELB: contact@helb.co.ke",
            "news": [(f"{name} Official", f"https://{domain}"), ("HELB Updates", "https://www.helb.co.ke"), ("KUCCPS Placement", "https://students.kuccps.net/"), ("Ministry of Education Kenya", "https://www.education.go.ke")],
            "type": typ,
        }
    # Keep detailed info for the 6 most common - overrides generic
    data["UoE"].update({"portal": "https://studentportal.uoeld.ac.ke", "portal_name": "UoE Student Portal", "elearning": "https://ecampus.uoeld.ac.ke", "emails": "ICT: ict@uoeld.ac.ke | Admissions: admissions@uoeld.ac.ke | Exams: exams@uoeld.ac.ke | Registrar: registrar@uoeld.ac.ke", "news": [("UoE Official News","https://www.uoeld.ac.ke"),("HELB Updates","https://www.helb.co.ke"),("KUCCPS Placement","https://students.kuccps.net/"),("Ministry of Education Kenya","https://www.education.go.ke")]})
    data["UoN"].update({"portal": "https://smis.uonbi.ac.ke/", "portal_name": "UoN SMIS Portal", "elearning": "https://eclass.uonbi.ac.ke/", "emails": "ICT: ict@uonbi.ac.ke | Admissions: admissions@uonbi.ac.ke | Exams: exams@uonbi.ac.ke"})
    data["KU"].update({"portal": "https://portal.ku.ac.ke/", "portal_name": "KU Student Portal", "elearning": "https://e-learning.ku.ac.ke/", "emails": "ICT: ict@ku.ac.ke | Admissions: admissions@ku.ac.ke | Exams: exams@ku.ac.ke"})
    data["Moi"].update({"portal": "https://portal.mu.ac.ke/", "portal_name": "Moi Student Portal", "elearning": "https://elearning.mu.ac.ke/", "emails": "ICT: ict@mu.ac.ke | Admissions: admissions@mu.ac.ke | Exams: exams@mu.ac.ke"})
    data["Strathmore"].update({"portal": "https://su-sso.strathmore.edu/", "portal_name": "Strathmore Portal", "elearning": "https://elearning.strathmore.edu/", "emails": "ICT: info@strathmore.edu | Admissions: admissions@strathmore.edu"})
    data["Other"].update({"portal": "https://students.kuccps.net/", "portal_name": "KUCCPS Portal", "elearning": "https://students.kuccps.net/", "emails": "ICT: Check your university website | HELB: contact@helb.co.ke", "news": [("HELB","https://www.helb.co.ke"),("KUCCPS","https://students.kuccps.net/")]})
    return data

UNIVERSITY_DATA = _build_uni_data()
UNIVERSITY_CODES = [c for c,_,_,_ in UNIVERSITY_LIST]

# ============================================================
# ALL COURSES OFFERED IN KENYA - CUE / KUCCPS Accredited
# Master list - every university gets this list.
# Covers: Education, Business, IT, Engineering, Health, Law,
# Agriculture, Arts, Science, Tourism, Media, etc.
# ============================================================
ALL_COURSES = [
    # EDUCATION
    "BEd Arts", "BEd Science", "BEd Early Childhood Education", "BEd Primary Education", "BEd Special Needs Education", "BSc Education - Maths", "BA Education", "BEd Business Studies", "BEd Computer Science", "BEd Agriculture",
    # BUSINESS / ECONOMICS / MANAGEMENT
    "BCom (Commerce)", "BBA - Business Administration", "BCom - Accounting", "BCom - Finance", "BCom - Marketing", "BCom - Human Resource Management", "BCom - Procurement", "BCom - Entrepreneurship", "BSc Actuarial Science", "BSc Economics", "BSc Economics and Finance", "BSc Economics and Statistics", "BSc Agribusiness Management", "BSc Business and Information Technology", "BSc Business Management", "BSc Commerce - Aviation Management", "BSc Procurement and Supply Chain Management", "BSc Project Planning and Management", "BSc Real Estate", "BSc Quantity Surveying", "BSc Construction Management",
    # IT / COMPUTER / DATA
    "BSc Computer Science", "BSc Information Technology", "BSc Software Engineering", "BSc Data Science", "BSc Artificial Intelligence", "BSc Cyber Security", "BSc Information Systems", "BSc Computer Technology", "BSc Applied Computer Science", "BSc Mathematics and Computer Science", "BSc Statistics", "BSc Applied Statistics", "BSc Actuarial Science", "BSc Business Information Technology",
    # ENGINEERING / TECHNOLOGY
    "BSc Civil Engineering", "BSc Electrical and Electronics Engineering", "BSc Mechanical Engineering", "BSc Mechatronic Engineering", "BSc Computer Engineering", "BSc Agricultural Engineering", "BSc Biosystems Engineering", "BSc Chemical Engineering", "BSc Geomatic Engineering", "BSc Geospatial Engineering", "BSc Environmental Engineering", "BSc Telecommunication Engineering", "BSc Automotive Engineering", "BSc Petroleum Engineering", "BSc Mining Engineering", "BTech Electrical Engineering", "BTech Mechanical Engineering", "BTech Civil Engineering",
    # HEALTH / MEDICAL
    "MBChB - Medicine and Surgery", "BSc Nursing", "BPharm - Pharmacy", "BDS - Dental Surgery", "BSc Medical Laboratory Science", "BSc Clinical Medicine", "BSc Public Health", "BSc Environmental Health", "BSc Nutrition and Dietetics", "BSc Human Nutrition", "BSc Physiotherapy", "BSc Occupational Therapy", "BSc Optometry", "BSc Radiography", "BSc Health Records", "BSc Community Health", "BSc Population Health", "BVM - Veterinary Medicine", "BSc Animal Science",
    # AGRICULTURE / ENVIRONMENT / NATURAL RESOURCES
    "BSc Agriculture", "BSc Agricultural Economics", "BSc Agronomy", "BSc Horticulture", "BSc Animal Production", "BSc Food Science and Technology", "BSc Forestry", "BSc Wildlife Management", "BSc Environmental Science", "BSc Environmental Studies", "BSc Natural Resources Management", "BSc Fisheries and Aquaculture", "BSc Range Management", "BSc Water Resources Management",
    # LAW / SOCIAL SCIENCES / ARTS
    "LLB Law", "BA - Communication", "BA - Journalism and Media", "BA - Mass Communication", "BA - Sociology", "BA - Psychology", "BA - Political Science", "BA - International Relations", "BA - Criminology and Security Studies", "BA - Social Work", "BA - Community Development", "BA - Development Studies", "BA - Economics", "BA - Geography", "BA - History", "BA - Literature", "BA - Kiswahili", "BA - Linguistics", "BA - Philosophy", "BA - Anthropology", "BA - Counselling Psychology", "BA - Gender and Development Studies", "BA - Peace and Conflict Studies",
    # SCIENCE / PURE SCIENCES
    "BSc - General Science", "BSc Biology", "BSc Chemistry", "BSc Physics", "BSc Mathematics", "BSc Applied Mathematics", "BSc Biochemistry", "BSc Microbiology", "BSc Biotechnology", "BSc Geology", "BSc Meteorology", "BSc Astronomy", "BSc - Environmental Science", "BSc - Statistics", "BSc - Actuarial Science",
    # TOURISM / HOSPITALITY / ARTS / DESIGN
    "BSc Tourism Management", "BSc Hospitality Management", "BSc Hotel Management", "BSc Travel and Tourism Management", "BA - Design", "BA - Fine Art", "BA - Theatre Arts", "BA - Music", "BA - Film and Television", "BSc Fashion Design", "BSc Interior Design",
    # THEOLOGY / RELIGIOUS
    "BA - Theology", "BA - Religious Studies", "BA - Christian Ministry", "BA - Islamic Studies", "BDiv - Divinity",
    # OTHER
    "Other",
]
# Every university offers the master list - student picks their real course
COURSES = {code: list(ALL_COURSES) for code in UNIVERSITY_CODES}

COMBINATIONS = {
    "BEd Arts": ["English / Literature", "History / Geography", "Kiswahili / CRE", "English / History", "Geography / CRE", "Kiswahili / History", "English / Kiswahili", "Maths / Geography", "Other Combination"],
    "BEd Science": ["Maths / Physics", "Maths / Chemistry", "Biology / Chemistry", "Physics / Chemistry", "Biology / Geography", "Maths / Biology", "Other Combination"],
    "BSc Education - Maths": ["Maths / Physics", "Maths / Chemistry", "Maths / Biology"],
    "BEd Business Studies": ["Business / Maths", "Business / Geography", "Other Combination"],
    "BEd Computer Science": ["Computer / Maths", "Computer / Physics", "Other Combination"],
    "BEd Agriculture": ["Agriculture / Biology", "Agriculture / Chemistry", "Other Combination"],
}
def valid_admission(adm):
    adm = adm.strip().upper()
    if len(adm) < 5: return False
    if not re.search(r"[A-Z]{2,}", adm): return False
    if not re.search(r"\d{2,}", adm): return False
    if "/" not in adm and "-" not in adm and " " not in adm: return False
    return True
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB); g.db.row_factory = sqlite3.Row
    return g.db
@app.teardown_appcontext
def close_db(e=None):
    db = g.pop("db", None)
    if db: db.close()
def init_db():
    db = sqlite3.connect(DB)
    db.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, whatsapp TEXT, password TEXT, university TEXT, role TEXT, admission TEXT, course TEXT, year TEXT, combination TEXT, status TEXT DEFAULT 'approved')")
    db.execute("CREATE TABLE IF NOT EXISTS timetable (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, day TEXT, time TEXT, unit TEXT, venue TEXT)")
    db.execute("CREATE TABLE IF NOT EXISTS reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, date TEXT, type TEXT)")
    db.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, university TEXT, course TEXT, year TEXT, combination TEXT, unit TEXT, title TEXT, content TEXT, filename TEXT, uploader_name TEXT, is_shared INTEGER DEFAULT 0)")
    db.execute("CREATE TABLE IF NOT EXISTS past_papers (id INTEGER PRIMARY KEY AUTOINCREMENT, university TEXT, course TEXT, year TEXT, combination TEXT, unit TEXT, title TEXT, filename TEXT, uploader TEXT)")
    db.execute("CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, university TEXT, course TEXT, year TEXT, combination TEXT, author TEXT, title TEXT, message TEXT, filename TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)")
    db.execute("CREATE TABLE IF NOT EXISTS community (id INTEGER PRIMARY KEY AUTOINCREMENT, university TEXT, course TEXT, year TEXT, combination TEXT, name TEXT, message TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)")
    db.execute("CREATE TABLE IF NOT EXISTS planner (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, day TEXT, task TEXT, done INTEGER DEFAULT 0)")
    db.execute("CREATE TABLE IF NOT EXISTS social_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, university TEXT, name TEXT, user_id INTEGER, content TEXT, filename TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)")
    db.execute("CREATE TABLE IF NOT EXISTS social_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, user_id INTEGER, UNIQUE(post_id, user_id))")
    db.execute("CREATE TABLE IF NOT EXISTS social_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, name TEXT, user_id INTEGER, comment TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)")
    db.execute("CREATE TABLE IF NOT EXISTS president_voice (id INTEGER PRIMARY KEY AUTOINCREMENT, university TEXT, author TEXT, title TEXT, message TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)")
    db.execute("CREATE TABLE IF NOT EXISTS president_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, voice_id INTEGER, user_id INTEGER, UNIQUE(voice_id, user_id))")
    db.execute("CREATE TABLE IF NOT EXISTS president_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, voice_id INTEGER, name TEXT, comment TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)")
    db.execute("CREATE TABLE IF NOT EXISTS presidents_lounge (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, university TEXT, message TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)")
    db.execute("CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, university TEXT, title TEXT, company TEXT, link TEXT, has_attachment INTEGER DEFAULT 0, filename TEXT, posted_by TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)")
    db.commit()
    try: db.execute("ALTER TABLE notes ADD COLUMN uploader_name TEXT")
    except: pass
    try: db.execute("ALTER TABLE notes ADD COLUMN is_shared INTEGER DEFAULT 0")
    except: pass
    try: db.execute("ALTER TABLE announcements ADD COLUMN filename TEXT")
    except: pass
    db.commit(); db.close()
init_db()
def error_page(title, msg, btn_text, btn_link, btn2_text="Go Back", btn2_link="/login"):
    return f"""<html><head><link rel="stylesheet" href="/static/style.css"></head><body><button class="dark-toggle" onclick="toggleDark()">🌙</button><div class="box" style="text-align:center"><h1>{title}</h1><p>{msg}</p><a href="{btn_link}"><button>{btn_text}</button></a><a href="{btn2_link}"><button style="background:#eee;color:#333">{btn2_text}</button></a></div><script src="/static/script.js"></script></body></html>"""
def need_login(): return "user_id" not in session
def my_uni(): return session.get("university", "Other")
def my_course(): return session.get("course", "Other")
def my_year(): return session.get("year", "1")
def my_combo(): return session.get("combination", "None")
def save_file(file):
    if not file or file.filename == "": return None
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXT: return None
    filename = f"{int(time.time())}_{secure_filename(file.filename)}"
    file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
    return filename
def login_user(user):
    session["user_id"] = user["id"]; session["name"] = user["name"]; session["role"] = user["role"]; session["university"] = user["university"]; session["whatsapp"] = user["whatsapp"]; session["admission"] = user["admission"]; session["course"] = user["course"]; session["year"] = user["year"]; session["combination"] = user["combination"]

@app.route("/")
def home(): return redirect("/dashboard" if not need_login() else "/login")
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name", "").strip(); email = request.form.get("email", "").strip().lower()
        whatsapp = request.form.get("whatsapp", "").strip(); password = request.form.get("password", "")
        university = request.form.get("university", "UoE"); role = request.form.get("role", "student"); rep_code = request.form.get("rep_code", ""); pres_code = request.form.get("president_code", "")
        admission = request.form.get("admission", "").strip().upper()
        course = request.form.get("course", "Other"); year = request.form.get("year", "1"); combination = request.form.get("combination", "None")
        if university not in UNIVERSITY_DATA: university = "Other"
        if course == "Other": combination = "None"
        elif course not in COMBINATIONS: combination = "None"
        else:
            if not combination: combination = "None"
        db = get_db()
        existing_email = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if existing_email:
            return error_page("You Already Have Account 😊", f"<b>{email}</b> already registered as {existing_email['name']}. Please login instead.", "Login Here →", "/login", "Forgot Password", "/forgot_password")
        if not valid_admission(admission):
            return error_page("Invalid Admission ❌", f"<b>{admission}</b> does not look like admission. Example: SSCI/87687", "Try Again →", "/register", "Login", "/login")
        if role == "class_rep" and rep_code != REP_CODE:
            return error_page("Wrong Rep Code 🔑", "Only real Class Reps have this code. Tap 'Request Key on WhatsApp' on register page to get it from Benedict.", "Try Again →", "/register", "Login", "/login")
        if role == "president" and pres_code != PRESIDENT_CODE:
            return error_page("Wrong President Code 👑", "Only real University Presidents have this code. Request it from Benedict on WhatsApp.", "Try Again →", "/register", "Login", "/login")
        if role == "class_rep":
            ex = db.execute("SELECT * FROM users WHERE university=? AND course=? AND year=? AND combination=? AND role='class_rep' AND status='approved'", (university, course, year, combination)).fetchone()
            if ex:
                return error_page("Class Rep Already Exists 👑", f"<b>{ex['name']}</b> is already Class Rep for {course} Year {year} - {combination}. Ask them to Step Down or Transfer.", "Register As Student →", "/register", "Login", "/login")
        if role == "president":
            ex = db.execute("SELECT * FROM users WHERE university=? AND role='president' AND status='approved'", (university,)).fetchone()
            if ex:
                return error_page("President Already Exists 👑", f"<b>{ex['name']}</b> is already President of {university}.", "Register As Student →", "/register", "Login", "/login")
        try:
            cur = db.execute("INSERT INTO users (name,email,whatsapp,password,university,role,admission,course,year,combination,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)", (name, email, whatsapp, generate_password_hash(password), university, role, admission, course, year, combination, "approved"))
            db.commit()
            user = db.execute("SELECT * FROM users WHERE id=?", (cur.lastrowid,)).fetchone()
            login_user(user)
            return redirect("/dashboard")
        except sqlite3.IntegrityError:
            return error_page("Email Already Exists 😅", f"<b>{email}</b> already has an account.", "Login Here →", "/login", "Try Different Email", "/register")
    return render_template("register.html", courses=COURSES, combinations=COMBINATIONS)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower(); password = request.form.get("password", "")
        db = get_db(); user = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if user and check_password_hash(user["password"], password):
            login_user(user); return redirect("/dashboard")
        return error_page("Wrong Login 🔒", "Email or password wrong.", "Try Again →", "/login", "Forgot Password", "/forgot_password")
    return render_template("login.html")
@app.route("/forgot_password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        db = get_db(); user = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if not user:
            return error_page("Check Your Email 📧", "If that email exists in our system, we have sent reset instructions. If you don't see it, try again or register.", "Back To Login →", "/login", "Register", "/register")
        session["reset_email"] = email
        return render_template("reset_password.html", email=email)
    return render_template("forgot_password.html")
@app.route("/reset_password", methods=["POST"])
def reset_password():
    email = session.get("reset_email", "")
    if not email: return redirect("/forgot_password")
    new_pw = request.form.get("new_password", "")
    if len(new_pw) < 4: return "Password too short - use at least 4 characters. <a href='/forgot_password'>Back</a>"
    db = get_db(); db.execute("UPDATE users SET password=? WHERE email=?", (generate_password_hash(new_pw), email)); db.commit()
    session.pop("reset_email", None)
    return error_page("Password Reset ✅", "Your new password is saved. Login with your new password now. Remember to keep it safe.", "Login Now →", "/login", "Home", "/login")
@app.route("/logout")
def logout(): session.clear(); return redirect("/login")

@app.route("/dashboard")
def dashboard():
    if need_login(): return redirect("/login")
    db = get_db(); uid = session["user_id"]; uni = my_uni(); course = my_course(); year = my_year(); combo = my_combo()
    timetable = db.execute("SELECT * FROM timetable WHERE user_id=?", (uid,)).fetchall()
    reminders = db.execute("SELECT * FROM reminders WHERE user_id=?", (uid,)).fetchall()
    notes = db.execute("SELECT * FROM notes WHERE user_id=? ORDER BY id DESC", (uid,)).fetchall()
    shared_notes = db.execute("SELECT * FROM notes WHERE is_shared=1 AND university=? AND course=? AND year=? AND combination=? AND user_id!=? ORDER BY id DESC", (uni, course, year, combo, uid)).fetchall()
    past_papers = db.execute("SELECT * FROM past_papers WHERE university=? AND course=? AND year=? ORDER BY id DESC", (uni, course, year)).fetchall()
    past_papers_all = db.execute("SELECT * FROM past_papers WHERE university=? ORDER BY id DESC LIMIT 20", (uni,)).fetchall()
    announcements_raw = db.execute("SELECT * FROM announcements WHERE university=? AND course=? AND year=? AND combination=? ORDER BY id DESC LIMIT 10", (uni, course, year, combo)).fetchall()
    community = db.execute("SELECT * FROM community WHERE university=? AND course=? AND year=? AND combination=? ORDER BY id DESC LIMIT 50", (uni, course, year, combo)).fetchall()
    planner = db.execute("SELECT * FROM planner WHERE user_id=?", (uid,)).fetchall()
    members = db.execute("SELECT * FROM users WHERE university=? AND course=? AND year=? AND combination=? ORDER BY name", (uni, course, year, combo)).fetchall()
    rep = db.execute("SELECT * FROM users WHERE university=? AND course=? AND year=? AND combination=? AND role='class_rep' AND status='approved'", (uni, course, year, combo)).fetchone()
    pres = db.execute("SELECT * FROM users WHERE university=? AND role='president' AND status='approved'", (uni,)).fetchone()
    social_posts = db.execute("SELECT * FROM social_posts ORDER BY id DESC LIMIT 50").fetchall()
    social_full = []
    for p in social_posts:
        likes = db.execute("SELECT COUNT(*) as c FROM social_likes WHERE post_id=?", (p["id"],)).fetchone()["c"]
        liked = db.execute("SELECT * FROM social_likes WHERE post_id=? AND user_id=?", (p["id"], uid)).fetchone() is not None
        comments = db.execute("SELECT * FROM social_comments WHERE post_id=? ORDER BY id ASC", (p["id"],)).fetchall()
        social_full.append({"post": p, "likes": likes, "liked": liked, "comments": comments})
    voices = db.execute("SELECT * FROM president_voice WHERE university=? ORDER BY id DESC LIMIT 20", (uni,)).fetchall()
    voices_full = []
    for v in voices:
        likes = db.execute("SELECT COUNT(*) as c FROM president_likes WHERE voice_id=?", (v["id"],)).fetchone()["c"]
        liked = db.execute("SELECT * FROM president_likes WHERE voice_id=? AND user_id=?", (v["id"], uid)).fetchone() is not None
        comments = db.execute("SELECT * FROM president_comments WHERE voice_id=? ORDER BY id ASC", (v["id"],)).fetchall()
        voices_full.append({"voice": v, "likes": likes, "liked": liked, "comments": comments})
    lounge = []
    if session.get("role") == "president":
        lounge = db.execute("SELECT * FROM presidents_lounge ORDER BY id DESC LIMIT 100").fetchall()
    jobs = db.execute("SELECT * FROM jobs ORDER BY id DESC LIMIT 50").fetchall()
    wa_ann = []
    for a in announcements_raw:
        text = urllib.parse.quote(f"📢 {a['title']} - {a['message']} - From {a['author']} ({course} Y{year} {combo})")
        wa_ann.append({"data": a, "wa_link": f"https://wa.me/?text={text}"})
    uni_info = UNIVERSITY_DATA.get(uni, UNIVERSITY_DATA["Other"])
    return render_template("index.html", name=session.get("name"), role=session.get("role"), university=uni, course=course, year=year, combination=combo, admission=session.get("admission",""), uni_info=uni_info, timetable=timetable, reminders=reminders, notes=notes, shared_notes=shared_notes, past_papers=past_papers, past_papers_all=past_papers_all, announcements=wa_ann, community=community, planner=planner, members=members, class_rep_name=rep["name"] if rep else "No Rep Yet", president_name=pres["name"] if pres else "No President Yet", social=social_full, voices=voices_full, lounge=lounge, jobs=jobs)

@app.route("/step_down_rep")
def step_down_rep():
    if need_login() or session.get("role") not in ("class_rep","president"): return redirect("/login")
    db = get_db(); db.execute("UPDATE users SET role='student' WHERE id=?", (session["user_id"],)); db.commit(); session["role"] = "student"; return redirect("/dashboard#members")
@app.route("/transfer_rep/<int:id>")
def transfer_rep(id):
    if need_login() or session.get("role") != "class_rep": return redirect("/login")
    db = get_db(); target = db.execute("SELECT * FROM users WHERE id=?", (id,)).fetchone()
    if not target: return redirect("/dashboard#members")
    if target["university"] != my_uni() or target["course"] != my_course() or target["year"] != my_year() or target["combination"] != my_combo(): return redirect("/dashboard#members")
    db.execute("UPDATE users SET role='class_rep' WHERE id=?", (id,)); db.execute("UPDATE users SET role='student' WHERE id=?", (session["user_id"],)); db.commit(); session["role"] = "student"; return redirect("/dashboard#members")
@app.route("/remove_member/<int:id>")
def remove_member(id):
    if need_login() or session.get("role") != "class_rep": return redirect("/login")
    db = get_db(); target = db.execute("SELECT * FROM users WHERE id=?", (id,)).fetchone()
    if target and target["role"] in ("class_rep","president"): return redirect("/dashboard")
    if target and target["id"] == session["user_id"]: return redirect("/dashboard")
    db.execute("DELETE FROM users WHERE id=? AND university=? AND course=? AND year=? AND combination=?", (id, my_uni(), my_course(), my_year(), my_combo())); db.commit(); return redirect("/dashboard#members")

@app.route("/add_timetable", methods=["POST"])
def add_timetable():
    if need_login(): return redirect("/login")
    db = get_db(); db.execute("INSERT INTO timetable (user_id,day,time,unit,venue) VALUES (?,?,?,?,?)", (session["user_id"], request.form.get("day"), request.form.get("time"), request.form.get("unit"), request.form.get("venue"))); db.commit(); return redirect("/dashboard")
@app.route("/add_reminder", methods=["POST"])
def add_reminder():
    if need_login(): return redirect("/login")
    db = get_db(); db.execute("INSERT INTO reminders (user_id,title,date,type) VALUES (?,?,?,?)", (session["user_id"], request.form.get("title"), request.form.get("date"), request.form.get("type"))); db.commit(); return redirect("/dashboard")
@app.route("/add_note", methods=["POST"])
def add_note():
    if need_login(): return redirect("/login")
    filename = save_file(request.files.get("pdf_file"))
    is_shared = 1 if (request.form.get("share_with_class") and session.get("role") in ("class_rep","president")) else 0
    db = get_db()
    db.execute("INSERT INTO notes (user_id,university,course,year,combination,unit,title,content,filename,uploader_name,is_shared) VALUES (?,?,?,?,?,?,?,?,?,?,?)", (session["user_id"], my_uni(), my_course(), my_year(), my_combo(), request.form.get("unit"), request.form.get("title"), request.form.get("content"), filename, session.get("name"), is_shared)); db.commit(); return redirect("/dashboard#notes")
@app.route("/upload_paper", methods=["POST"])
def upload_paper():
    if need_login(): return redirect("/login")
    filename = save_file(request.files.get("paper_file"))
    if filename:
        db = get_db(); db.execute("INSERT INTO past_papers (university,course,year,combination,unit,title,filename,uploader) VALUES (?,?,?,?,?,?,?,?)", (my_uni(), my_course(), my_year(), my_combo(), request.form.get("unit"), request.form.get("title"), filename, session.get("name"))); db.commit()
    return redirect("/dashboard#papers")
@app.route("/uploads/<filename>")
def download_file(filename): return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
@app.route("/add_announcement", methods=["POST"])
def add_announcement():
    if need_login(): return redirect("/login")
    if session.get("role") != "class_rep": return error_page("Only Class Rep 🚫", "Only your Class Rep can announce.", "Back →", "/dashboard")
    filename = save_file(request.files.get("ann_file"))
    db = get_db(); db.execute("INSERT INTO announcements (university,course,year,combination,author,title,message,filename) VALUES (?,?,?,?,?,?,?,?)", (my_uni(), my_course(), my_year(), my_combo(), session.get("name"), request.form.get("title"), request.form.get("message"), filename)); db.commit(); return redirect("/dashboard#announcements")
@app.route("/add_planner", methods=["POST"])
def add_planner():
    if need_login(): return redirect("/login")
    db = get_db(); db.execute("INSERT INTO planner (user_id,day,task) VALUES (?,?,?)", (session["user_id"], request.form.get("day"), request.form.get("task"))); db.commit(); return redirect("/dashboard#planner")
@app.route("/community_post", methods=["POST"])
def community_post():
    if need_login(): return redirect("/login")
    msg = request.form.get("message","")
    if contains_banned(msg): return error_page("Post Blocked 🚫", "Your message goes against community rules (insults / hate / sexual content). Please post respectfully.", "Back →", "/dashboard#community")
    db = get_db(); db.execute("INSERT INTO community (university,course,year,combination,name,message) VALUES (?,?,?,?,?,?)", (my_uni(), my_course(), my_year(), my_combo(), session.get("name"), msg)); db.commit(); return redirect("/dashboard#community")
@app.route("/delete/<kind>/<int:id>")
def delete_item(kind, id):
    if need_login(): return redirect("/login")
    db = get_db(); table = {"timetable": "timetable", "reminders": "reminders", "notes": "notes", "planner": "planner"}.get(kind, "timetable")
    db.execute(f"DELETE FROM {table} WHERE id=? AND user_id=?", (id, session["user_id"])); db.commit(); return redirect("/dashboard")
@app.route("/delete_paper/<int:id>")
def delete_paper(id):
    if need_login(): return redirect("/login")
    db = get_db(); db.execute("DELETE FROM past_papers WHERE id=? AND university=? AND course=?", (id, my_uni(), my_course())); db.commit(); return redirect("/dashboard#papers")
@app.route("/social_post", methods=["POST"])
def social_post():
    if need_login(): return redirect("/login")
    content = request.form.get("content","").strip()
    if not content: return redirect("/dashboard#social")
    if contains_banned(content): return error_page("Post Blocked 🚫", "Your post goes against community rules. No insults, hate, tribal, sexual or violent content. Please post respectfully.", "Back →", "/dashboard#social")
    filename = save_file(request.files.get("social_file"))
    db = get_db(); db.execute("INSERT INTO social_posts (university,name,user_id,content,filename) VALUES (?,?,?,?,?)", (my_uni(), session.get("name"), session["user_id"], content, filename)); db.commit(); return redirect("/dashboard#social")
@app.route("/social_like/<int:id>")
def social_like(id):
    if need_login(): return redirect("/login")
    db = get_db()
    ex = db.execute("SELECT * FROM social_likes WHERE post_id=? AND user_id=?", (id, session["user_id"])).fetchone()
    if ex: db.execute("DELETE FROM social_likes WHERE post_id=? AND user_id=?", (id, session["user_id"]))
    else: db.execute("INSERT INTO social_likes (post_id,user_id) VALUES (?,?)", (id, session["user_id"]))
    db.commit(); return redirect("/dashboard#social")
@app.route("/social_comment/<int:id>", methods=["POST"])
def social_comment(id):
    if need_login(): return redirect("/login")
    c = request.form.get("comment","").strip()
    if contains_banned(c): return error_page("Comment Blocked 🚫", "Your comment goes against community rules.", "Back →", "/dashboard#social")
    db = get_db(); db.execute("INSERT INTO social_comments (post_id,name,user_id,comment) VALUES (?,?,?,?)", (id, session.get("name"), session["user_id"], c)); db.commit(); return redirect("/dashboard#social")
@app.route("/president_voice_post", methods=["POST"])
def president_voice_post():
    if need_login() or session.get("role") != "president": return error_page("Only President 👑", "Only University President can post President Voice.", "Back →", "/dashboard")
    title = request.form.get("title",""); msg = request.form.get("message","")
    if contains_banned(msg+title): return error_page("Post Blocked 🚫", "Goes against community rules.", "Back →", "/dashboard#president")
    db = get_db(); db.execute("INSERT INTO president_voice (university,author,title,message) VALUES (?,?,?,?)", (my_uni(), session.get("name"), title, msg)); db.commit(); return redirect("/dashboard#president")
@app.route("/president_like/<int:id>")
def president_like(id):
    if need_login(): return redirect("/login")
    db = get_db(); ex = db.execute("SELECT * FROM president_likes WHERE voice_id=? AND user_id=?", (id, session["user_id"])).fetchone()
    if ex: db.execute("DELETE FROM president_likes WHERE voice_id=? AND user_id=?", (id, session["user_id"]))
    else: db.execute("INSERT INTO president_likes (voice_id,user_id) VALUES (?,?)", (id, session["user_id"]))
    db.commit(); return redirect("/dashboard#president")
@app.route("/president_comment/<int:id>", methods=["POST"])
def president_comment(id):
    if need_login(): return redirect("/login")
    c = request.form.get("comment","")
    if contains_banned(c): return error_page("Comment Blocked 🚫", "Goes against rules.", "Back →", "/dashboard#president")
    db = get_db(); db.execute("INSERT INTO president_comments (voice_id,name,comment) VALUES (?,?,?)", (id, session.get("name"), c)); db.commit(); return redirect("/dashboard#president")
@app.route("/lounge_post", methods=["POST"])
def lounge_post():
    if need_login() or session.get("role") != "president": return error_page("Presidents Only 🤝", "Only University Presidents can enter Presidents Lounge.", "Back →", "/dashboard")
    msg = request.form.get("message","")
    if contains_banned(msg): return error_page("Blocked 🚫", "Goes against rules.", "Back →", "/dashboard#lounge")
    db = get_db(); db.execute("INSERT INTO presidents_lounge (name,university,message) VALUES (?,?,?)", (session.get("name"), my_uni(), msg)); db.commit(); return redirect("/dashboard#lounge")
@app.route("/add_job", methods=["POST"])
def add_job():
    if need_login(): return redirect("/login")
    if session.get("role") not in ("class_rep","president"): return error_page("Only Leaders 🚫", "Only Class Rep or President can post jobs to avoid spam.", "Back →", "/dashboard#jobs")
    filename = save_file(request.files.get("job_file"))
    db = get_db(); db.execute("INSERT INTO jobs (university,title,company,link,has_attachment,filename,posted_by) VALUES (?,?,?,?,?,?,?)", (my_uni(), request.form.get("title"), request.form.get("company"), request.form.get("link"), 1 if filename else 0, filename, session.get("name"))); db.commit(); return redirect("/dashboard#jobs")
@app.route("/cv", methods=["GET","POST"])
def cv_generator():
    if need_login(): return redirect("/login")
    if request.method == "POST":
        data = {k: request.form.get(k,"") for k in ["full_name","phone","email","course","university","career_goal","skills","experience","education","referee"]}
        return render_template("cv_result.html", d=data, name=session.get("name"))
    return render_template("cv_form.html", name=session.get("name"), course=my_course(), university=my_uni())
def offline_answer(msg):
    m = msg.lower()
    if msg.strip().lower() in ["hi", "hello", "hey"]: return "Hi! I'm your Student Helper. Ask me about photosynthesis, database, CGPA, or any unit."
    if "photosynthesis" in m: return "Photosynthesis = plants use sunlight + water + CO2 to make food + oxygen. 6CO2 + 6H2O + sunlight → C6H12O6 + 6O2. Happens in chloroplasts."
    if "cgpa" in m: return "CGPA: A=4.0 (70+), B=3.0 (60-69), C=2.0 (50-59), D=1.0 (40-49). Use CGPA tab!"
    if "database" in m or "normalization" in m: return "Normalization: 1NF no repeating groups, 2NF no partial dependency, 3NF no transitive dependency."
    return f"Good question about '{msg}'. Break it into small parts, find one example, teach it to a friend."
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}; msg = data.get("message", "").strip()
    if not msg: return jsonify({"reply": "Ask me anything!"})
    if not GEMINI_KEY: return jsonify({"reply": offline_answer(msg) + "\n\n[Offline Mode]"})
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_KEY}"
        r = requests.post(url, json={"contents": [{"parts": [{"text": f"You are Student Helper, friendly tutor for Kenyan university students. Explain simply. Question: {msg}"}]}]}, timeout=15)
        j = r.json()
        if "candidates" in j: return jsonify({"reply": j["candidates"][0]["content"]["parts"][0]["text"]})
        return jsonify({"reply": offline_answer(msg)})
    except Exception as e:
        print(e); return jsonify({"reply": offline_answer(msg)})
def offline_predict(unit, topic, exam_type, course):
    topic_text = topic if topic else f"the whole {unit} unit"
    return f"""🔥 AI EXAM PREDICTOR - {unit.upper()} ({exam_type})\n\n🎯 HOT TOPICS:\n1. Definitions in {topic_text} - 95% chance\n2. Explain / Discuss on {topic_text} - 90%\n3. Application / Case Study - 85%\n4. Diagrams / Steps - 80%\n5. Advantages / Disadvantages - 75%\n\n❓ PREDICTED QUESTIONS:\n1. Define {topic_text} and explain importance. (5 marks)\n2. Discuss THREE advantages and TWO disadvantages. (10 marks)\n3. Compare TWO types in {topic_text}. (10 marks)\n4. With diagram, explain process of {topic_text}. (10 marks)\n5. Using Kenyan example, explain application. (10 marks)\n6. Explain FIVE factors affecting {topic_text}. (10 marks)\n7. Challenges + solutions. (10 marks)\n8. Steps involved. (10 marks)\n9. Differentiate two terms. (5 marks)\n10. Role in modern society. (10 marks)\n\n✅ HOW TO PASS: Start with DEFINITION, use headings + Kenyan example, draw diagram, end with conclusion."""
@app.route("/predict_exam", methods=["POST"])
def predict_exam():
    if need_login(): return jsonify({"reply": "Please login first."})
    data = request.get_json() or {}; unit = data.get("unit", "").strip() or my_course(); topic = data.get("topic", "").strip(); exam_type = data.get("exam_type", "Final Exam"); course = my_course()
    if not GEMINI_KEY: return jsonify({"reply": offline_predict(unit, topic, exam_type, course)})
    try:
        prompt = f"You are exam predictor for {course}, Year {my_year()} at {my_uni()}. Unit: {unit} Topic: {topic} Exam: {exam_type}. Predict 10 questions with marks, hot topics, how to answer. Kenyan examples."
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_KEY}"
        r = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=25); j = r.json()
        if "candidates" in j: return jsonify({"reply": j["candidates"][0]["content"]["parts"][0]["text"]})
        return jsonify({"reply": offline_predict(unit, topic, exam_type, course)})
    except Exception as e:
        print(e); return jsonify({"reply": offline_predict(unit, topic, exam_type, course)})
@app.route("/test_ai")
def test_ai(): return jsonify({"has_key": bool(GEMINI_KEY)})
@app.route("/portfolio")
def portfolio():
    return render_template("portfolio.html")
# --- PWA ROUTES - Serve sw.js and manifest from root ---
@app.route("/sw.js")
def serve_sw():
    return send_from_directory("static", "sw.js", mimetype="application/javascript")

@app.route("/manifest.json")
def serve_manifest():
    return send_from_directory("static", "manifest.json", mimetype="application/manifest+json")
if __name__ == "__main__": app.run(debug=True, port=5000)
