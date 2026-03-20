import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";

function showAlert(title: string, msg?: string) { alert(msg ? title + ': ' + msg : title); }

const C = {
  white: '#FFFFFF', canvas: '#F7F8F5',
  green: '#1B5E3B', greenLight: '#EAF2EC', greenMid: '#2E7D52',
  navy: '#0C1F4A', navyLight: '#E8EDF8',
  grey: '#6B7280', greyLight: '#E5E7EB', greyMid: '#9CA3AF', greyDark: '#374151',
  black: '#0A0C10', border: '#D1D5DB',
  red: '#B91C1C', amber: '#B45309', purple: '#6D28D9', teal: '#0E7490', blue: '#1D4ED8',
};

function Lbl({ text }: { text: string }) {
  return <Text style={A.lbl}>{text}</Text>;
}

function Field({ value, onChange, placeholder, secure, keyboard }: any) {
  return (
    <View style={A.fieldWrap}>
      <TextInput style={A.fieldTxt} value={value} onChangeText={onChange}
        placeholder={placeholder} placeholderTextColor={C.greyMid}
        secureTextEntry={secure} autoCapitalize="none"
        keyboardType={keyboard || 'default'} />
    </View>
  );
}

function BackBtn({ onPress, label = '← Back' }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={A.backBtn}>
      <Text style={A.backBtnTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActionCard({ icon, title, sub, color, onPress }: any) {
  return (
    <TouchableOpacity style={[A.actionCard, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.75}>
      <View style={[A.actionIcon, { backgroundColor: color + '15' }]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={A.actionTitle}>{title}</Text>
        <Text style={A.actionSub}>{sub}</Text>
      </View>
      <Text style={{ color: C.greyMid, fontSize: 20 }}>›</Text>
    </TouchableOpacity>
  );
}

export default function SchoolAdminScreen() {
  const router = useRouter();

  const [token, setToken]       = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser]         = useState<any>(null);
  const [tab, setTab]           = useState('home');
  const [classes, setClasses]   = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [allStudents, setAllStudents]     = useState<any[]>([]);

  const [showRegister,   setShowRegister]   = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showAcademic,   setShowAcademic]   = useState(false);
  const [showHomework,   setShowHomework]   = useState(false);
  const [showSports,     setShowSports]     = useState(false);
  const [showAnnounce,   setShowAnnounce]   = useState(false);
  const [showAlert,      setShowAlert]      = useState(false);

  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [parentName,  setParentName]  = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [registering, setRegistering] = useState(false);
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentMiddleName, setStudentMiddleName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [studentDOB, setStudentDOB] = useState('');
  const [studentSex, setStudentSex] = useState('');
  const [studentReligion, setStudentReligion] = useState('');
  const [studentPhoto, setStudentPhoto] = useState('');

  const [attendance, setAttendance] = useState<any>({});
  const [savingAtt,  setSavingAtt]  = useState(false);

  const [acaStudent,  setAcaStudent]  = useState('');
  const [acaTerm,     setAcaTerm]     = useState('Term 1');
  const [acaSubject,  setAcaSubject]  = useState('');
  const [acaScore,    setAcaScore]    = useState('');
  const [acaGrade,    setAcaGrade]    = useState('');
  const [acaRemarks,  setAcaRemarks]  = useState('');
  const [savingAca,   setSavingAca]   = useState(false);

  const [hwClass,   setHwClass]   = useState('');
  const [hwSubject, setHwSubject] = useState('');
  const [hwDesc,    setHwDesc]    = useState('');
  const [hwDue,     setHwDue]     = useState('');
  const [hwType,    setHwType]    = useState('new');
  const [savingHw,  setSavingHw]  = useState(false);

  const [spStudent, setSpStudent] = useState('');
  const [spSport,   setSpSport]   = useState('general');
  const [spTerm,    setSpTerm]    = useState('Term 1');
  const [spRating,  setSpRating]  = useState('good');
  const [spNotes,   setSpNotes]   = useState('');
  const [savingSp,  setSavingSp]  = useState(false);

  const [annText,   setAnnText]   = useState('');
  const [savingAnn, setSavingAnn] = useState(false);

  const [alStudent, setAlStudent] = useState('');
  const [alTitle,   setAlTitle]   = useState('');
  const [alDesc,    setAlDesc]    = useState('');
  const [savingAl,  setSavingAl]  = useState(false);

  async function resetStudentRecords(studentId: string, studentName: string) {
    if (confirm('Reset all records for ' + studentName + '? This cannot be undone.')) {
      try {
        const res = await fetch(`${API_URL}/schools/${user.school.id}/students/${studentId}/records`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) showAlert('Done', 'Records for ' + studentName + ' have been reset.');
        else showAlert('Error', 'Failed to reset records');
      } catch { showAlert('Error', 'Failed to reset records'); }
    }
  }

  async function deleteStudent(studentId: string, studentName: string) {
    if (confirm('Permanently delete ' + studentName + '?')) {
      try {
        const res = await fetch(`${API_URL}/schools/${user.school.id}/students/${studentId}`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          showAlert('Deleted', studentName + ' has been deleted.');
          loadAllStudents(token, user.school.id);
        } else showAlert('Error', 'Failed to delete student');
      } catch { showAlert('Error', 'Failed to delete student'); }
    }
  }

  const SPORTS = [
    { id:'athletics',   label:'Athletics'    },
    { id:'football',    label:'Football'     },
    { id:'basketball',  label:'Basketball'   },
    { id:'volleyball',  label:'Volleyball'   },
    { id:'swimming',    label:'Swimming'     },
    { id:'gymnastics',  label:'Gymnastics'   },
    { id:'general',     label:'Physical Ed.' },
  ];

  async function login() {
    if (!email || !password) { showAlert('Error', 'Enter email and password'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { showAlert('Login Failed', data.error || 'Invalid credentials'); setLoading(false); return; }
      setToken(data.token); setUser(data.user); setLoggedIn(true); setLoading(false);
      try { localStorage.setItem('admin_session', JSON.stringify({ token: data.token, user: data.user })); } catch {}
      loadClasses(data.token, data.user.school.id);
      loadAllStudents(data.token, data.user.school.id);
    } catch { showAlert('Error', 'Cannot connect to server.'); setLoading(false); }
  }

  async function loadClasses(t: string, schoolId: string) {
    try {
      const res  = await fetch(`${API_URL}/schools/${schoolId}/classes`, { headers: { Authorization: `Bearer ${t || token}` } });
      const data = await res.json();
      if (res.ok) setClasses(data.classes || []);
    } catch {}
  }

  async function loadAllStudents(t: string, schoolId: string) {
    try {
      const res  = await fetch(`${API_URL}/schools/${schoolId}/students`, { headers: { Authorization: `Bearer ${t || token}` } });
      const data = await res.json();
      if (res.ok) setAllStudents(data.students || []);
    } catch {}
  }

  async function loadStudents(classId: string) {
    try {
      const res  = await fetch(`${API_URL}/schools/${user.school.id}/students?classId=${classId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
        const att: any = {};
        (data.students || []).forEach((s: any) => { att[s.id] = 'present'; });
        setAttendance(att);
      }
    } catch {}
  }

  async function registerStudent() {
    if ((!studentFirstName && !studentName) || !studentClass) { showAlert('Error', 'Student name and class are required'); return; }
    setRegistering(true);
    try {
      const fullName = studentFirstName ? [studentFirstName, studentMiddleName, studentLastName].filter(Boolean).join(' ') : studentName;
      const res  = await fetch(`${API_URL}/auth/admin/register-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          name: fullName, 
          firstName: studentFirstName, middleName: studentMiddleName, lastName: studentLastName,
          classId: studentClass, parentName, parentPhone,
          dateOfBirth: studentDOB, sex: studentSex, religion: studentReligion, photo: studentPhoto
        }),
      });
      const data = await res.json();
      if (!res.ok) { showAlert('Error', data.error || 'Failed'); setRegistering(false); return; }
      showAlert('Registered!', fullName + ' is pending Super Admin approval.');
      setRegistering(false); setShowRegister(false);
      setStudentFirstName(''); setStudentMiddleName(''); setStudentLastName('');
      setStudentName(''); setStudentClass(''); setParentName(''); setParentPhone('');
      setStudentDOB(''); setStudentSex(''); setStudentReligion(''); setStudentPhoto('');
    } catch { showAlert('Error', 'Failed'); setRegistering(false); }
  }

  async function saveAttendance() {
    setSavingAtt(true);
    try {
      const today   = new Date().toISOString().slice(0, 10);
      const records = students.map((s: any) => ({ studentId: s.id, classId: selectedClass.id, status: attendance[s.id] || 'present' }));
      const res     = await fetch(`${API_URL}/schools/${user.school.id}/attendance/bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ records, date: today }),
      });
      if (res.ok) { showAlert('✅ Saved!', `Attendance for ${selectedClass.name} recorded.`); setShowAttendance(false); }
      else showAlert('Error', 'Failed to save attendance');
    } catch { showAlert('Error', 'Failed to save attendance'); }
    setSavingAtt(false);
  }

  async function saveAcademic() {
    if (!acaStudent || !acaSubject) { showAlert('Error', 'Student and subject are required'); return; }
    setSavingAca(true);
    try {
      const res  = await fetch(`${API_URL}/schools/${user.school.id}/academic`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: acaStudent, term: acaTerm, subject: acaSubject, score: acaScore ? parseFloat(acaScore) : null, grade: acaGrade, remarks: acaRemarks }),
      });
      const data = await res.json();
      if (res.ok) { showAlert('✅ Saved!', `Academic report for ${acaSubject} saved.`); setShowAcademic(false); setAcaStudent(''); setAcaSubject(''); setAcaScore(''); setAcaGrade(''); setAcaRemarks(''); }
      else showAlert('Error', data.error || 'Failed');
    } catch { showAlert('Error', 'Failed'); }
    setSavingAca(false);
  }

  async function saveHomework() {
    if (!hwSubject) { showAlert('Error', 'Subject is required'); return; }
    setSavingHw(true);
    try {
      const res = await fetch(`${API_URL}/schools/${user.school.id}/homework`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ classId: hwClass || null, subject: hwSubject, description: hwDesc, hwType, dueDate: hwDue || null }),
      });
      if (res.ok) { showAlert('✅ Posted!', `Homework for ${hwSubject} posted.`); setShowHomework(false); setHwSubject(''); setHwDesc(''); setHwDue(''); setHwClass(''); }
      else showAlert('Error', 'Failed');
    } catch { showAlert('Error', 'Failed'); }
    setSavingHw(false);
  }

  async function saveSports() {
    if (!spStudent) { showAlert('Error', 'Select a student'); return; }
    setSavingSp(true);
    try {
      const sc  = SPORTS.find(s => s.id === spSport);
      const res = await fetch(`${API_URL}/schools/${user.school.id}/sports`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: spStudent, sport: spSport, sportLabel: sc?.label, term: spTerm, rating: spRating, notes: spNotes }),
      });
      if (res.ok) { showAlert('✅ Saved!', 'Sports assessment recorded.'); setShowSports(false); setSpStudent(''); setSpNotes(''); }
      else showAlert('Error', 'Failed');
    } catch { showAlert('Error', 'Failed'); }
    setSavingSp(false);
  }

  async function saveAnnouncement() {
    if (!annText) { showAlert('Error', 'Enter announcement text'); return; }
    setSavingAnn(true);
    try {
      const res = await fetch(`${API_URL}/schools/${user.school.id}/announcements`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: annText }),
      });
      if (res.ok) { showAlert('✅ Sent!', 'Announcement posted.'); setShowAnnounce(false); setAnnText(''); }
      else showAlert('Error', 'Failed');
    } catch { showAlert('Error', 'Failed'); }
    setSavingAnn(false);
  }

  async function saveAlert() {
    if (!alStudent || !alTitle) { showAlert('Error', 'Select student and enter title'); return; }
    setSavingAl(true);
    try {
      const res = await fetch(`${API_URL}/schools/${user.school.id}/alerts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: alStudent, title: alTitle, description: alDesc }),
      });
      if (res.ok) { showAlert('✅ Sent!', 'Alert sent to parent.'); setShowAlert(false); setAlStudent(''); setAlTitle(''); setAlDesc(''); }
      else showAlert('Error', 'Failed');
    } catch { showAlert('Error', 'Failed'); }
    setSavingAl(false);
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <View style={[A.fill, { backgroundColor: C.canvas }]}>
        <ScrollView contentContainerStyle={A.pad} keyboardShouldPersistTaps="handled">
          <BackBtn onPress={() => router.back()} label='← Home' />
          <View style={A.loginTop}>
            <View style={A.loginIcon}><Text style={{ fontSize: 28 }}>🏫</Text></View>
            <Text style={A.loginH1}>School Admin</Text>
            <Text style={A.loginH2}>Sign in to manage your school</Text>
          </View>
          <Lbl text="EMAIL ADDRESS" />
          <Field value={email} onChange={setEmail} placeholder="admin@school.educaid.io" keyboard="email-address" />
          <Lbl text="PASSWORD" />
          <Field value={password} onChange={setPassword} placeholder="Your password" secure />
          <TouchableOpacity style={A.signInBtn} onPress={login} disabled={loading}>
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={A.signInBtnTxt}>Sign In →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Attendance Screen ────────────────────────────────────────────────────────
  if (showAttendance && selectedClass) {
    return (
      <View style={[A.fill, { backgroundColor: C.canvas }]}>
        <View style={A.screenHeader}>
          <BackBtn onPress={() => setShowAttendance(false)} label="← Back" />
          <View style={{ flex: 1 }}>
            <Text style={A.screenHeaderTitle}>{selectedClass.name}</Text>
            <Text style={A.screenHeaderSub}>Attendance · {new Date().toDateString()}</Text>
          </View>
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {students.length === 0
            ? <View style={A.empty}><Text style={A.emptyTxt}>No students in this class yet.</Text></View>
            : students.map((s: any) => (
                <View key={s.id} style={A.attCard}>
                  <View style={[A.attAvatar, { backgroundColor: C.navy }]}>
                    <Text style={A.attAvatarTxt}>{s.initials || s.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={A.attName}>{s.name}</Text>
                    <Text style={A.attCode}>{s.student_code}</Text>
                  </View>
                  <View style={A.attBtns}>
                    {[
                      { id: 'present', label: 'P', color: C.green },
                      { id: 'absent',  label: 'A', color: C.red   },
                      { id: 'late',    label: 'L', color: C.amber  },
                      { id: 'excused', label: 'E', color: C.blue   },
                    ].map(st => (
                      <TouchableOpacity key={st.id}
                        style={[A.attBtn, attendance[s.id] === st.id && { backgroundColor: st.color, borderColor: st.color }]}
                        onPress={() => setAttendance({ ...attendance, [s.id]: st.id })}>
                        <Text style={[A.attBtnTxt, attendance[s.id] === st.id && { color: C.white }]}>{st.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
          <View style={{ height: 100 }} />
        </ScrollView>
        {students.length > 0 && (
          <View style={A.saveBar}>
            <TouchableOpacity style={A.saveBtn} onPress={saveAttendance} disabled={savingAtt}>
              {savingAtt ? <ActivityIndicator color={C.white} /> : <Text style={A.saveBtnTxt}>Save Attendance</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'home',       label: '🏠 Home'       },
    { id: 'attendance', label: '📅 Attendance'  },
    { id: 'students',   label: '👥 Students'    },
  ];

  return (
    <View style={[A.fill, { backgroundColor: C.canvas }]}>

      {/* Header */}
      <View style={A.dashHeader}>
        <TouchableOpacity onPress={() => router.back()} style={A.headerBack}>
          <Text style={A.headerBackTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={A.dashHeaderSchool}>{user?.school?.name}</Text>
          <Text style={A.dashHeaderWelcome}>Welcome, {user?.name}</Text>
        </View>
        <TouchableOpacity style={A.signOutBtn} onPress={() => setLoggedIn(false)}>
          <Text style={A.signOutBtnTxt}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View style={A.statsStrip}>
        <View style={A.statItem}>
          <Text style={A.statNum}>{classes.length}</Text>
          <Text style={A.statLbl}>Classes</Text>
        </View>
        <View style={[A.statItem, { borderLeftWidth: 1, borderLeftColor: C.border }]}>
          <Text style={A.statNum}>{allStudents.length}</Text>
          <Text style={A.statLbl}>Students</Text>
        </View>
        <TouchableOpacity style={[A.statItem, { borderLeftWidth: 1, borderLeftColor: C.border }]}
          onPress={() => setShowRegister(true)}>
          <Text style={[A.statNum, { color: C.green }]}>+</Text>
          <Text style={A.statLbl}>Add Student</Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={A.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id}
            style={[A.tabItem, tab === t.id && { borderBottomColor: C.navy, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.id)}>
            <Text style={[A.tabItemTxt, tab === t.id && { color: C.navy, fontWeight: '700' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>

        {/* Home tab */}
        {tab === 'home' && (
          <>
            <Text style={A.secHead}>QUICK ACTIONS</Text>
            <ActionCard icon="📅" title="Mark Attendance"   sub="Record today's attendance"        color={C.green}  onPress={() => setTab('attendance')} />
            <ActionCard icon="📚" title="Academic Report"   sub="Post grades and reports"           color={C.navy}   onPress={() => setShowAcademic(true)} />
            <ActionCard icon="📝" title="Post Homework"     sub="Assign homework to a class"        color={C.purple} onPress={() => setShowHomework(true)} />
            <ActionCard icon="🏃" title="Sports Assessment" sub="Record physical education results" color={C.amber}  onPress={() => setShowSports(true)} />
            <ActionCard icon="📢" title="Announcement"      sub="Send message to all parents"       color={C.teal}   onPress={() => setShowAnnounce(true)} />
            <ActionCard icon="🚨" title="Alert Parent"      sub="Send urgent alert to a parent"     color={C.red}    onPress={() => setShowAlert(true)} />
            <ActionCard icon="👤" title="Register Student"  sub="Add a new student"                 color={C.green}  onPress={() => setShowRegister(true)} />
          </>
        )}

        {/* Attendance tab */}
        {tab === 'attendance' && (
          <>
            <Text style={A.secHead}>SELECT CLASS</Text>
            {classes.length === 0
              ? <View style={A.empty}><Text style={A.emptyTxt}>No classes set up yet.</Text></View>
              : classes.map((cls: any) => (
                  <TouchableOpacity key={cls.id} style={A.classCard}
                    onPress={() => { setSelectedClass(cls); loadStudents(cls.id); setShowAttendance(true); }}>
                    <View style={[A.classDot, { backgroundColor: cls.color || C.green }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={A.className}>{cls.name}</Text>
                      <Text style={A.classSub}>Tap to mark attendance</Text>
                    </View>
                    <Text style={{ color: C.greyMid, fontSize: 20 }}>›</Text>
                  </TouchableOpacity>
                ))
            }
          </>
        )}

        {/* Students tab */}
        {tab === 'students' && (
          <>
            <Text style={A.secHead}>REGISTERED STUDENTS</Text>
            <TouchableOpacity style={A.addStudentBtn} onPress={() => setShowRegister(true)}>
              <Text style={A.addStudentBtnTxt}>+ Register New Student</Text>
            </TouchableOpacity>
            {allStudents.length === 0
              ? <View style={A.empty}><Text style={A.emptyTxt}>No students yet.</Text></View>
              : allStudents.map((s: any) => (
                  <View key={s.id} style={A.studentCard}>
                    <View style={[A.studentAvatar, { backgroundColor: C.navy }]}>
                      <Text style={A.studentAvatarTxt}>{s.initials || s.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={A.studentName}>{s.name}</Text>
                      <Text style={A.studentSub}>{s.class_name} · {s.student_code}</Text>
                    </View>
                    <TouchableOpacity style={A.resetBtn}
                      onPress={() => resetStudentRecords(s.id, s.name)}>
                      <Text style={A.resetBtnTxt}>↺</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[A.resetBtn, { backgroundColor: '#FEE2E2', borderColor: '#B91C1C33', marginLeft: 6 }]}
                      onPress={() => deleteStudent(s.id, s.name)}>
                      <Text style={A.resetBtnTxt}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
            }
          </>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* ── Modals ── */}

      {/* Register Student */}
      <Modal visible={showRegister} animationType="slide">
        <View style={[A.fill, { backgroundColor: C.canvas }]}>
          <ScrollView contentContainerStyle={A.modalPad} keyboardShouldPersistTaps="handled">
            <BackBtn onPress={() => setShowRegister(false)} label="← Cancel" />
            <Text style={A.modalTitle}>Register Student</Text>

            {/* Photo Upload */}
            <Lbl text="STUDENT PHOTO" />
            <TouchableOpacity style={A.photoBox} onPress={() => {
              const input = document.createElement('input');
              input.type = 'file'; input.accept = 'image/*';
              input.onchange = (e: any) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (r: any) => setStudentPhoto(r.target.result);
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}>
              {studentPhoto
                ? <Text style={{ fontSize: 40 }}>✅</Text>
                : <Text style={A.photoBoxTxt}>📷  Tap to upload photo</Text>}
            </TouchableOpacity>

            <Lbl text="FIRST NAME *" />
            <Field value={studentFirstName} onChange={setStudentFirstName} placeholder="e.g. John" />
            <Lbl text="MIDDLE NAME" />
            <Field value={studentMiddleName} onChange={setStudentMiddleName} placeholder="e.g. Paul" />
            <Lbl text="LAST NAME *" />
            <Field value={studentLastName} onChange={setStudentLastName} placeholder="e.g. Fon" />

            <Lbl text="CLASS *" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {classes.map((cls: any) => (
                <TouchableOpacity key={cls.id}
                  style={[A.pill, studentClass === cls.id && A.pillActive]}
                  onPress={() => setStudentClass(cls.id)}>
                  <Text style={[A.pillTxt, studentClass === cls.id && A.pillTxtActive]}>{cls.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Lbl text="DATE OF BIRTH" />
            <Field value={studentDOB} onChange={setStudentDOB} placeholder="YYYY-MM-DD e.g. 2010-05-20" />

            <Lbl text="SEX" />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {['Male', 'Female'].map(s => (
                <TouchableOpacity key={s}
                  style={[A.pill, studentSex === s && A.pillActive, { flex: 1, justifyContent: 'center' }]}
                  onPress={() => setStudentSex(s)}>
                  <Text style={[A.pillTxt, studentSex === s && A.pillTxtActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Lbl text="RELIGION" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {['Christianity', 'Islam', 'Other'].map(r => (
                <TouchableOpacity key={r}
                  style={[A.pill, studentReligion === r && A.pillActive]}
                  onPress={() => setStudentReligion(r)}>
                  <Text style={[A.pillTxt, studentReligion === r && A.pillTxtActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Lbl text="PARENT / GUARDIAN NAME" />
            <Field value={parentName} onChange={setParentName} placeholder="Parent or guardian name" />
            <Lbl text="PARENT PHONE" />
            <Field value={parentPhone} onChange={setParentPhone} placeholder="+237..." keyboard="phone-pad" />
            <TouchableOpacity style={A.signInBtn} onPress={registerStudent} disabled={registering}>
              {registering ? <ActivityIndicator color={C.white} /> : <Text style={A.signInBtnTxt}>Register Student</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Academic Report */}
      <Modal visible={showAcademic} animationType="slide">
        <View style={[A.fill, { backgroundColor: C.canvas }]}>
          <ScrollView contentContainerStyle={A.modalPad} keyboardShouldPersistTaps="handled">
            <BackBtn onPress={() => setShowAcademic(false)} label="← Cancel" />
            <Text style={A.modalTitle}>Academic Report</Text>
            <Lbl text="STUDENT *" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {allStudents.map((s: any) => (
                <TouchableOpacity key={s.id}
                  style={[A.pill, acaStudent === s.id && A.pillActive]}
                  onPress={() => setAcaStudent(s.id)}>
                  <Text style={[A.pillTxt, acaStudent === s.id && A.pillTxtActive]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Lbl text="TERM" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {['Term 1', 'Term 2', 'Term 3'].map(t => (
                <TouchableOpacity key={t}
                  style={[A.pill, acaTerm === t && A.pillActive]}
                  onPress={() => setAcaTerm(t)}>
                  <Text style={[A.pillTxt, acaTerm === t && A.pillTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Lbl text="SUBJECT *" />
            <Field value={acaSubject} onChange={setAcaSubject} placeholder="e.g. Mathematics" />
            <Lbl text="SCORE" />
            <Field value={acaScore} onChange={setAcaScore} placeholder="e.g. 85" keyboard="numeric" />
            <Lbl text="GRADE" />
            <Field value={acaGrade} onChange={setAcaGrade} placeholder="e.g. A" />
            <Lbl text="REMARKS" />
            <Field value={acaRemarks} onChange={setAcaRemarks} placeholder="Optional remarks" />
            <TouchableOpacity style={A.signInBtn} onPress={saveAcademic} disabled={savingAca}>
              {savingAca ? <ActivityIndicator color={C.white} /> : <Text style={A.signInBtnTxt}>Save Report</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Homework */}
      <Modal visible={showHomework} animationType="slide">
        <View style={[A.fill, { backgroundColor: C.canvas }]}>
          <ScrollView contentContainerStyle={A.modalPad} keyboardShouldPersistTaps="handled">
            <BackBtn onPress={() => setShowHomework(false)} label="← Cancel" />
            <Text style={A.modalTitle}>Post Homework</Text>
            <Lbl text="CLASS (optional)" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {classes.map((cls: any) => (
                <TouchableOpacity key={cls.id}
                  style={[A.pill, hwClass === cls.id && A.pillActive]}
                  onPress={() => setHwClass(hwClass === cls.id ? '' : cls.id)}>
                  <Text style={[A.pillTxt, hwClass === cls.id && A.pillTxtActive]}>{cls.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Lbl text="SUBJECT *" />
            <Field value={hwSubject} onChange={setHwSubject} placeholder="e.g. Mathematics" />
            <Lbl text="DESCRIPTION" />
            <Field value={hwDesc} onChange={setHwDesc} placeholder="Homework details" />
            <Lbl text="DUE DATE" />
            <Field value={hwDue} onChange={setHwDue} placeholder="YYYY-MM-DD" />
            <TouchableOpacity style={A.signInBtn} onPress={saveHomework} disabled={savingHw}>
              {savingHw ? <ActivityIndicator color={C.white} /> : <Text style={A.signInBtnTxt}>Post Homework</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Sports */}
      <Modal visible={showSports} animationType="slide">
        <View style={[A.fill, { backgroundColor: C.canvas }]}>
          <ScrollView contentContainerStyle={A.modalPad} keyboardShouldPersistTaps="handled">
            <BackBtn onPress={() => setShowSports(false)} label="← Cancel" />
            <Text style={A.modalTitle}>Sports Assessment</Text>
            <Lbl text="STUDENT *" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {allStudents.map((s: any) => (
                <TouchableOpacity key={s.id}
                  style={[A.pill, spStudent === s.id && A.pillActive]}
                  onPress={() => setSpStudent(s.id)}>
                  <Text style={[A.pillTxt, spStudent === s.id && A.pillTxtActive]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Lbl text="SPORT" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {SPORTS.map(s => (
                <TouchableOpacity key={s.id}
                  style={[A.pill, spSport === s.id && A.pillActive]}
                  onPress={() => setSpSport(s.id)}>
                  <Text style={[A.pillTxt, spSport === s.id && A.pillTxtActive]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Lbl text="TERM" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {['Term 1', 'Term 2', 'Term 3'].map(t => (
                <TouchableOpacity key={t}
                  style={[A.pill, spTerm === t && A.pillActive]}
                  onPress={() => setSpTerm(t)}>
                  <Text style={[A.pillTxt, spTerm === t && A.pillTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Lbl text="RATING" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {['excellent', 'good', 'average', 'needs_work'].map(r => (
                <TouchableOpacity key={r}
                  style={[A.pill, spRating === r && A.pillActive]}
                  onPress={() => setSpRating(r)}>
                  <Text style={[A.pillTxt, spRating === r && A.pillTxtActive]}>{r.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Lbl text="NOTES" />
            <Field value={spNotes} onChange={setSpNotes} placeholder="Optional notes" />
            <TouchableOpacity style={A.signInBtn} onPress={saveSports} disabled={savingSp}>
              {savingSp ? <ActivityIndicator color={C.white} /> : <Text style={A.signInBtnTxt}>Save Assessment</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Announcement */}
      <Modal visible={showAnnounce} animationType="slide">
        <View style={[A.fill, { backgroundColor: C.canvas }]}>
          <ScrollView contentContainerStyle={A.modalPad} keyboardShouldPersistTaps="handled">
            <BackBtn onPress={() => setShowAnnounce(false)} label="← Cancel" />
            <Text style={A.modalTitle}>Send Announcement</Text>
            <Lbl text="MESSAGE" />
            <Field value={annText} onChange={setAnnText} placeholder="Type your announcement here..." />
            <TouchableOpacity style={A.signInBtn} onPress={saveAnnouncement} disabled={savingAnn}>
              {savingAnn ? <ActivityIndicator color={C.white} /> : <Text style={A.signInBtnTxt}>Send Announcement</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Alert */}
      <Modal visible={showAlert} animationType="slide">
        <View style={[A.fill, { backgroundColor: C.canvas }]}>
          <ScrollView contentContainerStyle={A.modalPad} keyboardShouldPersistTaps="handled">
            <BackBtn onPress={() => setShowAlert(false)} label="← Cancel" />
            <Text style={A.modalTitle}>Alert Parent</Text>
            <Lbl text="STUDENT *" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {allStudents.map((s: any) => (
                <TouchableOpacity key={s.id}
                  style={[A.pill, alStudent === s.id && A.pillActive]}
                  onPress={() => setAlStudent(s.id)}>
                  <Text style={[A.pillTxt, alStudent === s.id && A.pillTxtActive]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Lbl text="ALERT TITLE *" />
            <Field value={alTitle} onChange={setAlTitle} placeholder="e.g. Missing homework" />
            <Lbl text="DESCRIPTION" />
            <Field value={alDesc} onChange={setAlDesc} placeholder="Optional details" />
            <TouchableOpacity style={[A.signInBtn, { backgroundColor: C.red }]} onPress={saveAlert} disabled={savingAl}>
              {savingAl ? <ActivityIndicator color={C.white} /> : <Text style={A.signInBtnTxt}>Send Alert</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const A = StyleSheet.create({
  fill:              { flex: 1 },
  pad:               { padding: 24, paddingTop: 60, paddingBottom: 48 },
  modalPad:          { padding: 24, paddingTop: 60, paddingBottom: 48 },
  backBtn:           { alignSelf: 'flex-start', backgroundColor: C.white, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
  backBtnTxt:        { color: C.greyDark, fontSize: 13, fontWeight: '600' },
  loginTop:          { alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  loginIcon:         { width: 64, height: 64, borderRadius: 20, backgroundColor: C.navyLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  loginH1:           { fontSize: 26, fontWeight: '800', color: C.navy, marginBottom: 6 },
  loginH2:           { fontSize: 13, color: C.grey, textAlign: 'center' },
  lbl:               { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 8 },
  fieldWrap:         { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 },
  fieldTxt:          { color: C.black, fontSize: 15, flex: 1 },
  signInBtn:         { backgroundColor: C.navy, borderRadius: 14, padding: 17, alignItems: 'center' },
  signInBtnTxt:      { color: C.white, fontSize: 16, fontWeight: '700' },
  dashHeader:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, padding: 16, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: C.border },
  dashHeaderSchool:  { fontSize: 16, fontWeight: '800', color: C.navy, marginBottom: 2 },
  dashHeaderWelcome: { fontSize: 12, color: C.grey },
  signOutBtn:        { backgroundColor: C.canvas, borderRadius: 8, padding: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border },
  signOutBtnTxt:     { color: C.grey, fontSize: 12, fontWeight: '600' },
  statsStrip:        { flexDirection: 'row', backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  statItem:          { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum:           { fontSize: 22, fontWeight: '900', color: C.navy, marginBottom: 2 },
  statLbl:           { fontSize: 10, color: C.grey, fontWeight: '600' },
  tabBar:            { flexDirection: 'row', backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  tabItem:           { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemTxt:        { fontSize: 12, color: C.grey, fontWeight: '600' },
  secHead:           { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 14, marginTop: 4 },
  actionCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3 },
  actionIcon:        { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  actionTitle:       { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  actionSub:         { fontSize: 12, color: C.grey },
  classCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  classDot:          { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  className:         { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  classSub:          { fontSize: 12, color: C.grey },
  addStudentBtn:     { backgroundColor: C.greenLight, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.green + '44' },
  addStudentBtnTxt:  { color: C.green, fontSize: 14, fontWeight: '700' },
  studentCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  studentAvatar:     { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  studentAvatarTxt:  { color: C.white, fontWeight: '800', fontSize: 13 },
  studentName:       { fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 2 },
  studentSub:        { fontSize: 11, color: C.grey },
  attCard:           { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  attAvatar:         { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  attAvatarTxt:      { color: C.white, fontWeight: '800', fontSize: 13 },
  attName:           { fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 2 },
  attCode:           { fontSize: 11, color: C.grey },
  attBtns:           { flexDirection: 'row', gap: 6 },
  attBtn:            { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.border, backgroundColor: C.canvas },
  attBtnTxt:         { fontSize: 11, fontWeight: '700', color: C.grey },
  saveBar:           { backgroundColor: C.white, padding: 16, borderTopWidth: 1, borderTopColor: C.border },
  saveBtn:           { backgroundColor: C.green, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnTxt:        { color: C.white, fontSize: 15, fontWeight: '700' },
  screenHeader:      { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.white, padding: 16, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  screenHeaderTitle: { fontSize: 16, fontWeight: '800', color: C.navy, marginBottom: 2 },
  screenHeaderSub:   { fontSize: 12, color: C.grey },
  modalTitle:        { fontSize: 24, fontWeight: '800', color: C.navy, marginBottom: 24 },
  pill:              { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, marginRight: 8 },
  pillActive:        { backgroundColor: C.navy, borderColor: C.navy },
  pillTxt:           { fontSize: 13, color: C.grey, fontWeight: '600' },
  pillTxtActive:     { color: C.white },
  headerBack:        { width: 36, height: 36, borderRadius: 10, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border, marginRight: 8 },
  headerBackTxt:     { fontSize: 18, color: C.navy },
  resetBtn:          { width: 34, height: 34, borderRadius: 9, backgroundColor: '#EAF2EC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1B5E3B33', marginLeft: 6 },
  resetBtnTxt:       { fontSize: 16 },
  photoBox:          { backgroundColor: C.white, borderRadius: 14, borderWidth: 2, borderColor: C.border, borderStyle: 'dashed', padding: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20, minHeight: 80 },
  photoBoxTxt:       { color: C.grey, fontSize: 14, fontWeight: '600' },
  empty:             { alignItems: 'center', padding: 40, backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border },
  emptyTxt:          { color: C.grey, fontSize: 13 },

});
