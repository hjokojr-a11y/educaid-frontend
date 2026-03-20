import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useState } from 'react';

const API_URL = "http://192.168.100.158:3000";

export default function SchoolAdminScreen() {
  const [token, setToken]         = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [loggedIn, setLoggedIn]   = useState(false);
  const [user, setUser]           = useState(null);
  const [tab, setTab]             = useState('dashboard');
  const [classes, setClasses]     = useState([]);
  const [students, setStudents]   = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);

  // Modals
  const [showRegister, setShowRegister]     = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showAcademic, setShowAcademic]     = useState(false);
  const [showHomework, setShowHomework]     = useState(false);
  const [showSports, setShowSports]         = useState(false);
  const [showAnnounce, setShowAnnounce]     = useState(false);
  const [showAlert, setShowAlert]           = useState(false);

  // Register student
  const [studentName, setStudentName]   = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [parentName, setParentName]     = useState('');
  const [parentPhone, setParentPhone]   = useState('');
  const [registering, setRegistering]   = useState(false);

  // Attendance
  const [attendance, setAttendance]   = useState({});
  const [savingAtt, setSavingAtt]     = useState(false);

  // Academic report
  const [acaStudent, setAcaStudent]   = useState('');
  const [acaTerm, setAcaTerm]         = useState('Term 1');
  const [acaSubject, setAcaSubject]   = useState('');
  const [acaScore, setAcaScore]       = useState('');
  const [acaGrade, setAcaGrade]       = useState('');
  const [acaRemarks, setAcaRemarks]   = useState('');
  const [savingAca, setSavingAca]     = useState(false);

  // Homework
  const [hwClass, setHwClass]         = useState('');
  const [hwSubject, setHwSubject]     = useState('');
  const [hwDesc, setHwDesc]           = useState('');
  const [hwDue, setHwDue]             = useState('');
  const [hwType, setHwType]           = useState('new');
  const [savingHw, setSavingHw]       = useState(false);

  // Sports
  const [spStudent, setSpStudent]     = useState('');
  const [spSport, setSpSport]         = useState('general');
  const [spTerm, setSpTerm]           = useState('Term 1');
  const [spRating, setSpRating]       = useState('good');
  const [spNotes, setSpNotes]         = useState('');
  const [savingSp, setSavingSp]       = useState(false);

  // Announcement
  const [annText, setAnnText]         = useState('');
  const [savingAnn, setSavingAnn]     = useState(false);

  // Alert
  const [alStudent, setAlStudent]     = useState('');
  const [alTitle, setAlTitle]         = useState('');
  const [alDesc, setAlDesc]           = useState('');
  const [savingAl, setSavingAl]       = useState(false);

  const T = user?.school?.theme || { primary: '#1a7a6e', secondary: '#e8b24a', dark: '#0f1923' };

  async function login() {
    if (!email || !password) { Alert.alert("Error", "Enter email and password"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Login Failed", data.error || "Invalid credentials"); setLoading(false); return; }
      setToken(data.token); setUser(data.user); setLoggedIn(true); setLoading(false);
      loadClasses(data.token, data.user.school.id);
      loadAllStudents(data.token, data.user.school.id);
    } catch { Alert.alert("Error", "Cannot connect to server."); setLoading(false); }
  }

  async function loadClasses(t, schoolId) {
    try {
      const res = await fetch(`${API_URL}/schools/${schoolId}/classes`, { headers: { Authorization: `Bearer ${t || token}` } });
      const data = await res.json();
      if (res.ok) setClasses(data.classes || []);
    } catch {}
  }

  async function loadAllStudents(t, schoolId) {
    try {
      const res = await fetch(`${API_URL}/schools/${schoolId}/students`, { headers: { Authorization: `Bearer ${t || token}` } });
      const data = await res.json();
      if (res.ok) setAllStudents(data.students || []);
    } catch {}
  }

  async function loadStudents(classId) {
    try {
      const res = await fetch(`${API_URL}/schools/${user.school.id}/students?classId=${classId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
        const att = {};
        (data.students || []).forEach(s => { att[s.id] = 'present'; });
        setAttendance(att);
      }
    } catch {}
  }

  async function registerStudent() {
    if (!studentName || !studentClass) { Alert.alert("Error", "Student name and class are required"); return; }
    setRegistering(true);
    try {
      const res = await fetch(`${API_URL}/auth/admin/register-student`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: studentName, classId: studentClass, parentName, parentPhone })
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Error", data.error || "Failed"); setRegistering(false); return; }
      Alert.alert("✅ Registered!", `${studentName} is pending Super Admin approval.`);
      setRegistering(false); setShowRegister(false);
      setStudentName(''); setStudentClass(''); setParentName(''); setParentPhone('');
    } catch { Alert.alert("Error", "Failed"); setRegistering(false); }
  }

  async function saveAttendance() {
    setSavingAtt(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const records = students.map(s => ({ studentId: s.id, classId: selectedClass.id, status: attendance[s.id] || 'present' }));
      const res = await fetch(`${API_URL}/schools/${user.school.id}/attendance/bulk`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ records, date: today })
      });
      if (res.ok) { Alert.alert("✅ Saved!", `Attendance for ${selectedClass.name} recorded.`); setShowAttendance(false); }
      else Alert.alert("Error", "Failed to save attendance");
    } catch { Alert.alert("Error", "Failed to save attendance"); }
    setSavingAtt(false);
  }

  async function saveAcademic() {
    if (!acaStudent || !acaSubject) { Alert.alert("Error", "Student and subject are required"); return; }
    setSavingAca(true);
    try {
      const res = await fetch(`${API_URL}/schools/${user.school.id}/academic`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: acaStudent, term: acaTerm, subject: acaSubject, score: acaScore ? parseFloat(acaScore) : null, grade: acaGrade, remarks: acaRemarks })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("✅ Saved!", `Academic report for ${acaSubject} saved.`);
        setShowAcademic(false); setAcaStudent(''); setAcaSubject(''); setAcaScore(''); setAcaGrade(''); setAcaRemarks('');
      } else Alert.alert("Error", data.error || "Failed");
    } catch { Alert.alert("Error", "Failed"); }
    setSavingAca(false);
  }

  async function saveHomework() {
    if (!hwSubject) { Alert.alert("Error", "Subject is required"); return; }
    setSavingHw(true);
    try {
      const res = await fetch(`${API_URL}/schools/${user.school.id}/homework`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ classId: hwClass || null, subject: hwSubject, description: hwDesc, hwType, dueDate: hwDue || null })
      });
      if (res.ok) {
        Alert.alert("✅ Posted!", `Homework for ${hwSubject} posted.`);
        setShowHomework(false); setHwSubject(''); setHwDesc(''); setHwDue(''); setHwClass('');
      } else Alert.alert("Error", "Failed to post homework");
    } catch { Alert.alert("Error", "Failed"); }
    setSavingHw(false);
  }

  async function saveSports() {
    if (!spStudent) { Alert.alert("Error", "Select a student"); return; }
    setSavingSp(true);
    try {
      const sc = SPORTS.find(s => s.id === spSport);
      const res = await fetch(`${API_URL}/schools/${user.school.id}/sports`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: spStudent, sport: spSport, sportLabel: sc?.label, term: spTerm, rating: spRating, notes: spNotes })
      });
      if (res.ok) {
        Alert.alert("✅ Saved!", "Sports assessment recorded.");
        setShowSports(false); setSpStudent(''); setSpNotes('');
      } else Alert.alert("Error", "Failed");
    } catch { Alert.alert("Error", "Failed"); }
    setSavingSp(false);
  }

  async function saveAnnouncement() {
    if (!annText) { Alert.alert("Error", "Enter announcement text"); return; }
    setSavingAnn(true);
    try {
      const res = await fetch(`${API_URL}/schools/${user.school.id}/announcements`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: annText })
      });
      if (res.ok) { Alert.alert("✅ Sent!", "Announcement posted."); setShowAnnounce(false); setAnnText(''); }
      else Alert.alert("Error", "Failed");
    } catch { Alert.alert("Error", "Failed"); }
    setSavingAnn(false);
  }

  async function saveAlert() {
    if (!alStudent || !alTitle) { Alert.alert("Error", "Select student and enter title"); return; }
    setSavingAl(true);
    try {
      const res = await fetch(`${API_URL}/schools/${user.school.id}/alerts`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: alStudent, title: alTitle, description: alDesc })
      });
      if (res.ok) { Alert.alert("✅ Sent!", "Alert sent to parent."); setShowAlert(false); setAlStudent(''); setAlTitle(''); setAlDesc(''); }
      else Alert.alert("Error", "Failed");
    } catch { Alert.alert("Error", "Failed"); }
    setSavingAl(false);
  }

  const SPORTS = [
    { id:'athletics', label:'Athletics' }, { id:'football', label:'Football' },
    { id:'basketball', label:'Basketball' }, { id:'volleyball', label:'Volleyball' },
    { id:'swimming', label:'Swimming' }, { id:'gymnastics', label:'Gymnastics' },
    { id:'general', label:'Physical Ed.' },
  ];

  // Login Screen
  if (!loggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: '#0f1923' }]}>
        <ScrollView contentContainerStyle={styles.loginScroll}>
          <Text style={styles.appTitle}>EducAid</Text>
          <View style={[styles.badge, { backgroundColor: '#1a7a6e' }]}>
            <Text style={styles.badgeTitle}>🏫 School Admin</Text>
            <Text style={styles.badgeSub}>School Management</Text>
          </View>
          <Text style={styles.label}>Staff Email</Text>
          <TextInput style={styles.input} placeholder="admin@school.educaid.io" placeholderTextColor="#7a7066" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#7a7066" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#1a7a6e' }]} onPress={login} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Attendance Modal
  if (showAttendance && selectedClass) {
    return (
      <View style={[styles.container, { backgroundColor: '#f5f0e8' }]}>
        <View style={[styles.attHeader, { backgroundColor: T.primary }]}>
          <TouchableOpacity onPress={() => setShowAttendance(false)}><Text style={styles.attBack}>← Back</Text></TouchableOpacity>
          <Text style={styles.attTitle}>{selectedClass.name} — Attendance</Text>
          <Text style={styles.attDate}>{new Date().toDateString()}</Text>
        </View>
        <ScrollView style={styles.attContent}>
          {students.length === 0 ? (
            <View style={styles.emptyCard}><Text style={styles.emptyIcon}>👥</Text><Text style={styles.emptyText}>No students in this class yet.</Text></View>
          ) : students.map(student => (
            <View key={student.id} style={styles.attCard}>
              <View style={[styles.attAvatar, { backgroundColor: student.avatar_color || T.primary }]}>
                <Text style={styles.attAvatarText}>{student.initials || student.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.attName}>{student.name}</Text>
                <Text style={styles.attCode}>{student.student_code}</Text>
              </View>
              <View style={styles.attBtns}>
                {['present','absent','late','excused'].map(status => (
                  <TouchableOpacity key={status}
                    style={[styles.attBtn, attendance[student.id] === status && { backgroundColor: status==='present'?'#22c55e':status==='absent'?'#ef4444':status==='late'?'#eab308':'#3b82f6' }]}
                    onPress={() => setAttendance({ ...attendance, [student.id]: status })}>
                    <Text style={[styles.attBtnText, attendance[student.id] === status && { color: '#fff' }]}>
                      {status==='present'?'P':status==='absent'?'A':status==='late'?'L':'E'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        {students.length > 0 && (
          <View style={styles.attFooter}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: T.primary, margin: 16 }]} onPress={saveAttendance} disabled={savingAtt}>
              {savingAtt ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>✅ Save Attendance</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Dashboard
  return (
    <View style={[styles.container, { backgroundColor: '#f5f0e8' }]}>
      <View style={[styles.header, { backgroundColor: T.dark }]}>
        <View>
          <Text style={styles.headerTitle}>{user?.school?.name}</Text>
          <Text style={styles.headerSub}>Welcome, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={() => setLoggedIn(false)} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statsRow, { backgroundColor: T.dark }]}>
        <View style={styles.statCard}><Text style={styles.statNum}>{classes.length}</Text><Text style={styles.statLabel}>Classes</Text></View>
        <View style={styles.statCard}><Text style={styles.statNum}>{allStudents.length}</Text><Text style={styles.statLabel}>Students</Text></View>
        <TouchableOpacity style={[styles.statCard, { backgroundColor: T.primary }]} onPress={() => setShowRegister(true)}>
          <Text style={styles.statNum}>+</Text><Text style={styles.statLabel}>Add Student</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {['dashboard','attendance','students'].map(t => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab===t && { borderBottomColor: T.primary, borderBottomWidth: 2 }]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab===t && { color: T.primary }]}>
              {t==='dashboard'?'🏠 Home':t==='attendance'?'📅 Attendance':'👥 Students'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {tab === 'dashboard' && (
          <>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            {[
              { icon:'📅', title:'Mark Attendance',    sub:'Record today\'s attendance',           color:'#1a7a6e', action:()=>setTab('attendance') },
              { icon:'📚', title:'Academic Report',    sub:'Post grades and reports',              color:'#2a6fa8', action:()=>setShowAcademic(true) },
              { icon:'📝', title:'Post Homework',      sub:'Assign homework to a class',           color:'#a855f7', action:()=>setShowHomework(true) },
              { icon:'🏃', title:'Sports Assessment',  sub:'Record physical education results',    color:'#e8692a', action:()=>setShowSports(true) },
              { icon:'📢', title:'Announcement',       sub:'Send message to all parents',          color:'#f59e0b', action:()=>setShowAnnounce(true) },
              { icon:'🚨', title:'Alert Parent',       sub:'Send urgent alert to a parent',        color:'#ef4444', action:()=>setShowAlert(true) },
              { icon:'👤', title:'Register Student',   sub:'Add a new student',                    color:'#059669', action:()=>setShowRegister(true) },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.actionCard} onPress={item.action}>
                <View style={[styles.actionIcon, { backgroundColor: item.color+'22' }]}><Text style={{ fontSize:22 }}>{item.icon}</Text></View>
                <View style={{ flex:1 }}><Text style={styles.actionTitle}>{item.title}</Text><Text style={styles.actionSub}>{item.sub}</Text></View>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {tab === 'attendance' && (
          <>
            <Text style={styles.sectionTitle}>SELECT CLASS</Text>
            {classes.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyIcon}>📅</Text><Text style={styles.emptyText}>No classes set up yet.</Text></View>
            ) : classes.map(cls => (
              <TouchableOpacity key={cls.id} style={styles.classCard} onPress={() => { setSelectedClass(cls); loadStudents(cls.id); setShowAttendance(true); }}>
                <View style={[styles.classDot, { backgroundColor: cls.color || T.primary }]} />
                <View style={{ flex:1 }}><Text style={styles.className}>{cls.name}</Text><Text style={styles.classSub}>Teacher: {cls.teacher}</Text></View>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {tab === 'students' && (
          <>
            <Text style={styles.sectionTitle}>REGISTERED STUDENTS</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: T.primary, marginBottom:16 }]} onPress={() => setShowRegister(true)}>
              <Text style={styles.btnText}>+ Register New Student</Text>
            </TouchableOpacity>
            {allStudents.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyIcon}>👥</Text><Text style={styles.emptyText}>No students yet.</Text></View>
            ) : allStudents.map(s => (
              <View key={s.id} style={styles.classCard}>
                <View style={[styles.attAvatar, { backgroundColor: s.avatar_color || T.primary, width:36, height:36, borderRadius:18 }]}><Text style={styles.attAvatarText}>{s.initials||s.name[0]}</Text></View>
                <View style={{ flex:1, marginLeft:12 }}><Text style={styles.className}>{s.name}</Text><Text style={styles.classSub}>{s.class_name} · {s.student_code}</Text></View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Academic Report Modal */}
      <Modal visible={showAcademic} animationType="slide">
        <View style={[styles.container, { backgroundColor:'#0f1923' }]}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <TouchableOpacity onPress={() => setShowAcademic(false)} style={styles.backBtn}><Text style={styles.backText}>← Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>📚 Academic Report</Text>
            <Text style={styles.label}>Student *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
              {allStudents.map(s => (
                <TouchableOpacity key={s.id} style={[styles.catBtn, acaStudent===s.id && { backgroundColor: T.primary }]} onPress={() => setAcaStudent(s.id)}>
                  <Text style={[styles.catText, acaStudent===s.id && { color:'#fff' }]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Term</Text>
            <View style={styles.toggleRow}>
              {['Term 1','Term 2','Term 3'].map(t => (
                <TouchableOpacity key={t} style={[styles.toggleBtn, acaTerm===t && { backgroundColor: T.primary }]} onPress={() => setAcaTerm(t)}>
                  <Text style={[styles.toggleText, acaTerm===t && { color:'#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Subject *</Text>
            <TextInput style={styles.input} placeholder="e.g. Mathematics" placeholderTextColor="#7a7066" value={acaSubject} onChangeText={setAcaSubject} />
            <View style={{ flexDirection:'row', gap:10 }}>
              <View style={{ flex:1 }}><Text style={styles.label}>Score</Text><TextInput style={styles.input} placeholder="e.g. 85" placeholderTextColor="#7a7066" value={acaScore} onChangeText={setAcaScore} keyboardType="numeric" /></View>
              <View style={{ flex:1 }}><Text style={styles.label}>Grade</Text><TextInput style={styles.input} placeholder="e.g. A" placeholderTextColor="#7a7066" value={acaGrade} onChangeText={setAcaGrade} autoCapitalize="characters" /></View>
            </View>
            <Text style={styles.label}>Remarks</Text>
            <TextInput style={[styles.input, { minHeight:80 }]} placeholder="Teacher's comments..." placeholderTextColor="#7a7066" value={acaRemarks} onChangeText={setAcaRemarks} multiline />
            <TouchableOpacity style={[styles.btn, { backgroundColor:'#2a6fa8', marginTop:8 }]} onPress={saveAcademic} disabled={savingAca}>
              {savingAca ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>✅ Save Report</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Homework Modal */}
      <Modal visible={showHomework} animationType="slide">
        <View style={[styles.container, { backgroundColor:'#0f1923' }]}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <TouchableOpacity onPress={() => setShowHomework(false)} style={styles.backBtn}><Text style={styles.backText}>← Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>📝 Post Homework</Text>
            <Text style={styles.label}>Class (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
              {classes.map(c => (
                <TouchableOpacity key={c.id} style={[styles.catBtn, hwClass===c.id && { backgroundColor: T.primary }]} onPress={() => setHwClass(c.id)}>
                  <Text style={[styles.catText, hwClass===c.id && { color:'#fff' }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Subject *</Text>
            <TextInput style={styles.input} placeholder="e.g. Mathematics" placeholderTextColor="#7a7066" value={hwSubject} onChangeText={setHwSubject} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { minHeight:80 }]} placeholder="What students need to do..." placeholderTextColor="#7a7066" value={hwDesc} onChangeText={setHwDesc} multiline />
            <Text style={styles.label}>Due Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#7a7066" value={hwDue} onChangeText={setHwDue} />
            <TouchableOpacity style={[styles.btn, { backgroundColor:'#a855f7', marginTop:8 }]} onPress={saveHomework} disabled={savingHw}>
              {savingHw ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>✅ Post Homework</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Sports Modal */}
      <Modal visible={showSports} animationType="slide">
        <View style={[styles.container, { backgroundColor:'#0f1923' }]}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <TouchableOpacity onPress={() => setShowSports(false)} style={styles.backBtn}><Text style={styles.backText}>← Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>🏃 Sports Assessment</Text>
            <Text style={styles.label}>Student *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
              {allStudents.map(s => (
                <TouchableOpacity key={s.id} style={[styles.catBtn, spStudent===s.id && { backgroundColor:'#e8692a' }]} onPress={() => setSpStudent(s.id)}>
                  <Text style={[styles.catText, spStudent===s.id && { color:'#fff' }]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Sport</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
              {SPORTS.map(s => (
                <TouchableOpacity key={s.id} style={[styles.catBtn, spSport===s.id && { backgroundColor:'#e8692a' }]} onPress={() => setSpSport(s.id)}>
                  <Text style={[styles.catText, spSport===s.id && { color:'#fff' }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Term</Text>
            <View style={styles.toggleRow}>
              {['Term 1','Term 2','Term 3'].map(t => (
                <TouchableOpacity key={t} style={[styles.toggleBtn, spTerm===t && { backgroundColor:'#e8692a' }]} onPress={() => setSpTerm(t)}>
                  <Text style={[styles.toggleText, spTerm===t && { color:'#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Rating</Text>
            <View style={styles.toggleRow}>
              {['excellent','good','average','needswork'].map(r => (
                <TouchableOpacity key={r} style={[styles.toggleBtn, spRating===r && { backgroundColor:'#e8692a' }]} onPress={() => setSpRating(r)}>
                  <Text style={[styles.toggleText, spRating===r && { color:'#fff' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Notes</Text>
            <TextInput style={[styles.input, { minHeight:80 }]} placeholder="Coach observations..." placeholderTextColor="#7a7066" value={spNotes} onChangeText={setSpNotes} multiline />
            <TouchableOpacity style={[styles.btn, { backgroundColor:'#e8692a', marginTop:8 }]} onPress={saveSports} disabled={savingSp}>
              {savingSp ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>✅ Save Assessment</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Announcement Modal */}
      <Modal visible={showAnnounce} animationType="slide">
        <View style={[styles.container, { backgroundColor:'#0f1923' }]}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <TouchableOpacity onPress={() => setShowAnnounce(false)} style={styles.backBtn}><Text style={styles.backText}>← Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>📢 Announcement</Text>
            <Text style={styles.label}>Message *</Text>
            <TextInput style={[styles.input, { minHeight:120 }]} placeholder="Write your announcement..." placeholderTextColor="#7a7066" value={annText} onChangeText={setAnnText} multiline />
            <TouchableOpacity style={[styles.btn, { backgroundColor:'#f59e0b', marginTop:8 }]} onPress={saveAnnouncement} disabled={savingAnn}>
              {savingAnn ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>✅ Send Announcement</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Alert Modal */}
      <Modal visible={showAlert} animationType="slide">
        <View style={[styles.container, { backgroundColor:'#0f1923' }]}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <TouchableOpacity onPress={() => setShowAlert(false)} style={styles.backBtn}><Text style={styles.backText}>← Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>🚨 Alert Parent</Text>
            <Text style={styles.label}>Student *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
              {allStudents.map(s => (
                <TouchableOpacity key={s.id} style={[styles.catBtn, alStudent===s.id && { backgroundColor:'#ef4444' }]} onPress={() => setAlStudent(s.id)}>
                  <Text style={[styles.catText, alStudent===s.id && { color:'#fff' }]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Alert Title *</Text>
            <TextInput style={styles.input} placeholder="e.g. Disciplinary Issue" placeholderTextColor="#7a7066" value={alTitle} onChangeText={setAlTitle} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { minHeight:80 }]} placeholder="Details of the alert..." placeholderTextColor="#7a7066" value={alDesc} onChangeText={setAlDesc} multiline />
            <TouchableOpacity style={[styles.btn, { backgroundColor:'#ef4444', marginTop:8 }]} onPress={saveAlert} disabled={savingAl}>
              {savingAl ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>✅ Send Alert</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Register Student Modal */}
      <Modal visible={showRegister} animationType="slide">
        <View style={[styles.container, { backgroundColor:'#0f1923' }]}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <TouchableOpacity onPress={() => setShowRegister(false)} style={styles.backBtn}><Text style={styles.backText}>← Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>👤 Register Student</Text>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} placeholder="Student full name" placeholderTextColor="#7a7066" value={studentName} onChangeText={setStudentName} />
            <Text style={styles.label}>Class *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
              {classes.map(cls => (
                <TouchableOpacity key={cls.id} style={[styles.catBtn, studentClass===cls.id && { backgroundColor: T.primary }]} onPress={() => setStudentClass(cls.id)}>
                  <Text style={[styles.catText, studentClass===cls.id && { color:'#fff' }]}>{cls.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Parent Name</Text>
            <TextInput style={styles.input} placeholder="Parent full name" placeholderTextColor="#7a7066" value={parentName} onChangeText={setParentName} />
            <Text style={styles.label}>Parent Phone</Text>
            <TextInput style={styles.input} placeholder="+237 6XX XXX XXX" placeholderTextColor="#7a7066" value={parentPhone} onChangeText={setParentPhone} keyboardType="phone-pad" />
            <TouchableOpacity style={[styles.btn, { backgroundColor: T.primary, marginTop:8 }]} onPress={registerStudent} disabled={registering}>
              {registering ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>✅ Register Student</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1 },
  loginScroll:    { padding:24, paddingTop:80 },
  appTitle:       { fontSize:40, fontWeight:'800', color:'#fff', marginBottom:24 },
  badge:          { borderRadius:14, padding:16, marginBottom:24 },
  badgeTitle:     { fontSize:18, fontWeight:'700', color:'#fff' },
  badgeSub:       { fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:3 },
  label:          { fontSize:11, fontWeight:'700', color:'#7a8fa8', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6 },
  input:          { backgroundColor:'rgba(255,255,255,0.08)', borderRadius:10, padding:14, color:'#fff', fontSize:15, marginBottom:16, borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  btn:            { borderRadius:12, padding:16, alignItems:'center', marginBottom:8 },
  btnText:        { color:'#fff', fontSize:16, fontWeight:'700' },
  header:         { padding:20, paddingTop:60, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  headerTitle:    { fontSize:18, fontWeight:'800', color:'#fff' },
  headerSub:      { fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:2 },
  signOutBtn:     { backgroundColor:'rgba(255,255,255,0.1)', borderRadius:8, padding:8, paddingHorizontal:12 },
  signOutText:    { color:'rgba(255,255,255,0.6)', fontSize:13 },
  statsRow:       { flexDirection:'row', gap:10, padding:16 },
  statCard:       { flex:1, backgroundColor:'rgba(255,255,255,0.07)', borderRadius:12, padding:14, alignItems:'center' },
  statNum:        { fontSize:26, fontWeight:'800', color:'#fff' },
  statLabel:      { fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:2 },
  tabRow:         { flexDirection:'row', backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#ddd8cc' },
  tabBtn:         { flex:1, padding:14, alignItems:'center' },
  tabText:        { fontSize:13, color:'#7a7066', fontWeight:'600' },
  content:        { flex:1, padding:16 },
  sectionTitle:   { fontSize:10, fontWeight:'700', color:'#7a7066', letterSpacing:1, textTransform:'uppercase', marginBottom:12, marginTop:4 },
  actionCard:     { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:14, padding:16, marginBottom:10, borderWidth:1.5, borderColor:'#ddd8cc' },
  actionIcon:     { width:46, height:46, borderRadius:12, alignItems:'center', justifyContent:'center', marginRight:14 },
  actionTitle:    { fontSize:15, fontWeight:'700', color:'#0f1923', marginBottom:2 },
  actionSub:      { fontSize:12, color:'#7a7066' },
  actionArrow:    { fontSize:22, color:'#ddd8cc' },
  classCard:      { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:14, padding:16, marginBottom:10, borderWidth:1.5, borderColor:'#ddd8cc' },
  classDot:       { width:12, height:12, borderRadius:6, marginRight:14 },
  className:      { fontSize:15, fontWeight:'700', color:'#0f1923' },
  classSub:       { fontSize:12, color:'#7a7066', marginTop:2 },
  emptyCard:      { alignItems:'center', padding:40, backgroundColor:'#fff', borderRadius:16, borderWidth:1.5, borderColor:'#ddd8cc' },
  emptyIcon:      { fontSize:40, marginBottom:12 },
  emptyText:      { fontSize:14, color:'#7a7066', textAlign:'center' },
  attHeader:      { padding:20, paddingTop:60 },
  attBack:        { color:'rgba(255,255,255,0.7)', fontSize:14, marginBottom:8 },
  attTitle:       { fontSize:20, fontWeight:'800', color:'#fff' },
  attDate:        { fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:4 },
  attContent:     { flex:1, padding:16 },
  attCard:        { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:12, padding:12, marginBottom:8, borderWidth:1, borderColor:'#ddd8cc' },
  attAvatar:      { width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center', marginRight:12 },
  attAvatarText:  { color:'#fff', fontWeight:'700', fontSize:14 },
  attName:        { fontSize:14, fontWeight:'700', color:'#0f1923' },
  attCode:        { fontSize:11, color:'#7a7066' },
  attBtns:        { flexDirection:'row', gap:6 },
  attBtn:         { width:30, height:30, borderRadius:8, backgroundColor:'#f0ebe0', alignItems:'center', justifyContent:'center' },
  attBtnText:     { fontSize:11, fontWeight:'700', color:'#7a7066' },
  attFooter:      { backgroundColor:'#fff', borderTopWidth:1, borderTopColor:'#ddd8cc' },
  modalScroll:    { padding:24, paddingTop:60, paddingBottom:40 },
  modalTitle:     { fontSize:24, fontWeight:'800', color:'#fff', marginBottom:24 },
  backBtn:        { marginBottom:16 },
  backText:       { color:'rgba(255,255,255,0.5)', fontSize:14 },
  toggleRow:      { flexDirection:'row', gap:8, marginBottom:16, flexWrap:'wrap' },
  toggleBtn:      { flex:1, padding:10, borderRadius:10, backgroundColor:'rgba(255,255,255,0.08)', alignItems:'center', minWidth:70 },
  toggleText:     { fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:'600' },
  catBtn:         { paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:'rgba(255,255,255,0.08)', marginRight:8 },
  catText:        { fontSize:13, color:'rgba(255,255,255,0.5)', fontWeight:'600' },
});
