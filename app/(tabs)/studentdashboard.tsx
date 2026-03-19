import { useState, useEffect } from 'react';
import {
  ActivityIndicator, Alert, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions
} from 'react-native';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";
const { width } = Dimensions.get('window');

const C = {
  white: '#FFFFFF', offWhite: '#F8F9FA', canvas: '#F4F6F4',
  green: '#1A5C38', greenMid: '#2E7D52', greenLight: '#E8F2EC',
  navy: '#0D2145', navyMid: '#1A3566', navyLight: '#E8EDF5',
  grey: '#6B7280', greyLight: '#E5E7EB', greyDark: '#374151',
  black: '#0A0E14', border: '#D1D5DB', red: '#DC2626', amber: '#D97706',
  blue: '#1D4ED8', purple: '#7C3AED', teal: '#0891B2',
};

function AfricanPattern() {
  const spots = [
    { top: 60,  left: 20,  size: 44, type: 'diamond' },
    { top: 200, left: width - 64, size: 36, type: 'circle' },
    { top: 380, left: 36,  size: 40, type: 'cross' },
    { top: 560, left: width - 56, size: 48, type: 'diamond' },
    { top: 740, left: 28,  size: 38, type: 'circle' },
  ];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {spots.map((p, i) => (
        <View key={i} style={{ position: 'absolute', top: p.top, left: p.left, width: p.size, height: p.size, opacity: 0.04 }}>
          {p.type === 'diamond' && <View style={{ width: p.size, height: p.size, borderWidth: 2, borderColor: C.navy, transform: [{ rotate: '45deg' }] }} />}
          {p.type === 'circle' && <>
            <View style={{ width: p.size, height: p.size, borderRadius: p.size/2, borderWidth: 2, borderColor: C.navy }} />
            <View style={{ position: 'absolute', top: p.size/4, left: p.size/4, width: p.size/2, height: p.size/2, borderRadius: p.size/4, borderWidth: 1.5, borderColor: C.navy }} />
          </>}
          {p.type === 'cross' && <>
            <View style={{ position: 'absolute', top: p.size/2 - 1, left: 0, width: p.size, height: 2, backgroundColor: C.navy }} />
            <View style={{ position: 'absolute', left: p.size/2 - 1, top: 0, width: 2, height: p.size, backgroundColor: C.navy }} />
            <View style={{ position: 'absolute', top: p.size/2 - 1, left: 0, width: p.size, height: 2, backgroundColor: C.navy, transform: [{ rotate: '45deg' }] }} />
            <View style={{ position: 'absolute', left: p.size/2 - 1, top: 0, width: 2, height: p.size, backgroundColor: C.navy, transform: [{ rotate: '45deg' }] }} />
          </>}
        </View>
      ))}
    </View>
  );
}

function StatusTag({ label, color }: any) {
  return (
    <View style={{ backgroundColor: color + '15', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: color + '30' }}>
      <Text style={{ color, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
}

function EmptyState({ icon, message }: any) {
  return (
    <View style={SD.empty}>
      <Text style={{ fontSize: 40, marginBottom: 14 }}>{icon}</Text>
      <Text style={SD.emptyTxt}>{message}</Text>
    </View>
  );
}

export default function StudentDashboardScreen() {
  const [step, setStep] = useState('login');
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [tab, setTab] = useState('home');
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [academic, setAcademic] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const interval = setInterval(() => refreshData(session.token, session.user), 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  async function refreshData(token: string, user: any) {
    const h = { Authorization: `Bearer ${token}` };
    const id = user.id;
    try {
      const [a, ac, hw, sp, ann, al] = await Promise.all([
        fetch(`${API_URL}/student/${id}/attendance`, { headers: h }),
        fetch(`${API_URL}/student/${id}/academic`, { headers: h }),
        fetch(`${API_URL}/student/${id}/homework`, { headers: h }),
        fetch(`${API_URL}/student/${id}/sports`, { headers: h }),
        fetch(`${API_URL}/student/${id}/announcements`, { headers: h }),
        fetch(`${API_URL}/student/${id}/alerts`, { headers: h }),
      ]);
      if (a.ok)   { const d = await a.json();   setAttendance(d.attendance || []); }
      if (ac.ok)  { const d = await ac.json();  setAcademic(d.reports || []); }
      if (hw.ok)  { const d = await hw.json();  setHomework(d.homework || []); }
      if (sp.ok)  { const d = await sp.json();  setSports(d.assessments || []); }
      if (ann.ok) { const d = await ann.json(); setAnnouncements(d.announcements || []); }
      if (al.ok)  { const d = await al.json();  setAlerts(d.alerts || []); }
    } catch {}
  }

  async function loadSchools() {
    setLoadingSchools(true);
    try {
      const r1 = await fetch(`${API_URL}/auth/super/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'hjokojr@gmail.com', password: 'EducAid2024!' }),
      });
      const auth = await r1.json();
      const r2 = await fetch(`${API_URL}/auth/super/schools`, { headers: { Authorization: `Bearer ${auth.token}` } });
      const d = await r2.json();
      setSchools(d.schools || []);
    } catch { Alert.alert('Error', 'Cannot connect to server.'); }
    setLoadingSchools(false);
  }

  async function login() {
    if (!studentCode || !password) { Alert.alert('Error', 'Enter Student ID and password'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/student/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentCode, password, schoolId: selectedSchool?.id }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert('Login Failed', data.error || 'Invalid credentials'); setLoading(false); return; }
      setSession({ token: data.token, user: data.user });
      setStep('dashboard');
      setDataLoading(true);
      await refreshData(data.token, data.user);
      setDataLoading(false);
    } catch { Alert.alert('Error', 'Cannot connect to server.'); }
    setLoading(false);
  }

  function logout() {
    setSession(null); setStep('login'); setSelectedSchool(null);
    setStudentCode(''); setPassword(''); setTab('home');
    setAttendance([]); setAcademic([]); setHomework([]);
    setSports([]); setAnnouncements([]); setAlerts([]);
  }

  const user = session?.user;
  const schoolAccent = selectedSchool?.theme_primary || user?.school?.theme?.primary || C.green;

  // ── School picker ────────────────────────────────────────────────────────────
  if (step === 'selectSchool') {
    return (
      <View style={[SD.fill, { backgroundColor: C.canvas }]}>
        <AfricanPattern />
        <ScrollView contentContainerStyle={SD.scroll}>
          <TouchableOpacity onPress={() => setStep('login')} style={SD.back}>
            <Text style={SD.backTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={SD.pageH1}>Select School</Text>
          <Text style={SD.pageH2}>Choose your institution</Text>
          {loadingSchools
            ? <ActivityIndicator color={C.green} size="large" style={{ marginTop: 40 }} />
            : schools.map((sc: any) => (
                <TouchableOpacity key={sc.id} style={SD.schoolRow}
                  onPress={() => { setSelectedSchool(sc); setStep('login'); }}>
                  <View style={[SD.schoolDot, { backgroundColor: sc.theme_primary || C.green }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={SD.schoolName}>{sc.name}</Text>
                    <Text style={SD.schoolSub}>{sc.category}</Text>
                  </View>
                  <Text style={{ color: C.grey, fontSize: 22 }}>›</Text>
                </TouchableOpacity>
              ))}
        </ScrollView>
      </View>
    );
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  if (step === 'login') {
    return (
      <View style={[SD.fill, { backgroundColor: C.canvas }]}>
        <AfricanPattern />
        <ScrollView contentContainerStyle={SD.scroll} keyboardShouldPersistTaps="handled">
          <View style={SD.loginTop}>
            <View style={SD.loginIcon}>
              <Text style={SD.loginIconTxt}>🎓</Text>
            </View>
            <Text style={SD.loginH1}>Student Portal</Text>
            <Text style={SD.loginH2}>Sign in to view your academic records</Text>
          </View>

          {selectedSchool ? (
            <TouchableOpacity
              style={[SD.schoolPill, { borderLeftColor: schoolAccent }]}
              onPress={() => { setStep('selectSchool'); loadSchools(); }}>
              <View style={{ flex: 1 }}>
                <Text style={SD.schoolPillName}>{selectedSchool.name}</Text>
                <Text style={SD.schoolPillSub}>{selectedSchool.category}</Text>
              </View>
              <Text style={{ color: C.grey, fontSize: 12 }}>Change →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={SD.selectSchoolBtn}
              onPress={() => { setStep('selectSchool'); loadSchools(); }}>
              <Text style={SD.selectSchoolTxt}>🏫  Select Your School</Text>
            </TouchableOpacity>
          )}

          <Text style={SD.label}>STUDENT ID</Text>
          <View style={SD.inputWrap}>
            <TextInput style={SD.input} placeholder="e.g. LYC-0002"
              placeholderTextColor={C.grey} value={studentCode}
              onChangeText={setStudentCode} autoCapitalize="none" />
          </View>

          <Text style={SD.label}>PASSWORD</Text>
          <View style={SD.inputWrap}>
            <TextInput style={[SD.input, { flex: 1 }]} placeholder="Your password"
              placeholderTextColor={C.grey} value={password}
              onChangeText={setPassword} secureTextEntry={!showPw} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={{ color: C.grey, fontSize: 13 }}>{showPw ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[SD.btn, { backgroundColor: selectedSchool ? C.navy : C.greyLight, opacity: !selectedSchool ? 0.7 : 1 }]}
            onPress={login} disabled={loading || !selectedSchool}>
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={SD.btnTxt}>Sign In →</Text>}
          </TouchableOpacity>

          {!selectedSchool && <Text style={SD.hint}>Please select your school first</Text>}
        </ScrollView>
      </View>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'home',       icon: '⊞',  label: 'Home' },
    { id: 'attendance', icon: '📅', label: 'Attend.' },
    { id: 'academic',   icon: '📚', label: 'Grades' },
    { id: 'homework',   icon: '📝', label: 'HW' },
    { id: 'sports',     icon: '🏃', label: 'Sports' },
    { id: 'announce',   icon: '📢', label: 'News' },
    { id: 'alerts',     icon: '🚨', label: 'Alerts' },
  ];

  const userAccent = user?.school?.theme?.primary || C.green;

  return (
    <View style={[SD.fill, { backgroundColor: C.canvas }]}>
      {/* Header */}
      <View style={SD.header}>
        <View style={[SD.avatar, { backgroundColor: C.navy }]}>
          <Text style={SD.avatarTxt}>
            {user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={SD.headerName}>{user?.name}</Text>
          <Text style={SD.headerSub}>{user?.class?.name} · {user?.school?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={SD.signOut}>
          <Text style={SD.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* ID Strip */}
      <View style={[SD.idStrip, { backgroundColor: userAccent + '15' }]}>
        <Text style={[SD.idTxt, { color: userAccent }]}>Student ID: {user?.studentCode}</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={SD.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id}
            style={[SD.tabItem, tab === t.id && { borderBottomColor: C.navy, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.id)}>
            <Text style={{ fontSize: 14 }}>{t.icon}</Text>
            <Text style={[SD.tabLabel, tab === t.id && { color: C.navy, fontWeight: '700' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {dataLoading
        ? <ActivityIndicator color={C.navy} size="large" style={{ marginTop: 48 }} />
        : (
          <ScrollView style={SD.body}>

            {/* Home */}
            {tab === 'home' && (
              <>
                <Text style={SD.sectionHead}>OVERVIEW</Text>
                <View style={SD.statsGrid}>
                  {[
                    { label: 'Attendance', count: attendance.length,    color: C.green,  tab: 'attendance' },
                    { label: 'Grades',     count: academic.length,      color: C.navy,   tab: 'academic' },
                    { label: 'Homework',   count: homework.length,      color: C.purple, tab: 'homework' },
                    { label: 'Sports',     count: sports.length,        color: C.amber,  tab: 'sports' },
                    { label: 'News',       count: announcements.length, color: C.teal,   tab: 'announce' },
                    { label: 'Alerts',     count: alerts.length,        color: C.red,    tab: 'alerts' },
                  ].map((s, i) => (
                    <TouchableOpacity key={i}
                      style={[SD.statCard, { borderTopColor: s.color, borderTopWidth: 3 }]}
                      onPress={() => setTab(s.tab)}>
                      <Text style={[SD.statCount, { color: s.color }]}>{s.count}</Text>
                      <Text style={SD.statLabel}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Attendance */}
            {tab === 'attendance' && (
              <>
                <Text style={SD.sectionHead}>ATTENDANCE HISTORY</Text>
                {attendance.length === 0 ? <EmptyState icon="📅" message="No attendance records yet." /> :
                  attendance.map((r: any) => {
                    const sc = r.status === 'present' ? C.green : r.status === 'absent' ? C.red : r.status === 'late' ? C.amber : C.blue;
                    return (
                      <View key={r.id} style={[SD.card, { borderLeftColor: sc, borderLeftWidth: 3 }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={SD.cardTitle}>{r.date}</Text>
                          <Text style={SD.cardSub}>{r.class_name}</Text>
                        </View>
                        <StatusTag label={r.status?.toUpperCase()} color={sc} />
                      </View>
                    );
                  })}
              </>
            )}

            {/* Academic */}
            {tab === 'academic' && (
              <>
                <Text style={SD.sectionHead}>ACADEMIC REPORTS</Text>
                {academic.length === 0 ? <EmptyState icon="📚" message="No academic reports yet." /> :
                  academic.map((r: any) => (
                    <View key={r.id} style={[SD.card, { borderLeftColor: C.navy, borderLeftWidth: 3 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={SD.cardTitle}>{r.subject}</Text>
                        <Text style={SD.cardSub}>{r.term}</Text>
                        {r.remarks && <Text style={SD.cardNote}>{r.remarks}</Text>}
                      </View>
                      <View style={SD.gradeBox}>
                        <Text style={SD.gradeNum}>{r.score}</Text>
                        <Text style={SD.gradeLetter}>{r.grade}</Text>
                      </View>
                    </View>
                  ))}
              </>
            )}

            {/* Homework */}
            {tab === 'homework' && (
              <>
                <Text style={SD.sectionHead}>HOMEWORK</Text>
                {homework.length === 0 ? <EmptyState icon="📝" message="No homework posted yet." /> :
                  homework.map((r: any) => (
                    <View key={r.id} style={[SD.card, { borderLeftColor: C.purple, borderLeftWidth: 3 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={SD.cardTitle}>{r.subject}</Text>
                        <Text style={SD.cardSub}>Due: {r.due_date || 'No date set'}</Text>
                        {r.description && <Text style={SD.cardNote}>{r.description}</Text>}
                      </View>
                    </View>
                  ))}
              </>
            )}

            {/* Sports */}
            {tab === 'sports' && (
              <>
                <Text style={SD.sectionHead}>SPORTS & PHYSICAL EDUCATION</Text>
                {sports.length === 0 ? <EmptyState icon="🏃" message="No sports assessments yet." /> :
                  sports.map((r: any) => {
                    const rc = r.rating === 'excellent' ? C.green : r.rating === 'good' ? C.blue : r.rating === 'average' ? C.amber : C.red;
                    return (
                      <View key={r.id} style={[SD.card, { borderLeftColor: C.amber, borderLeftWidth: 3 }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={SD.cardTitle}>{r.sport_label || r.sport}</Text>
                          <Text style={SD.cardSub}>{r.term} · {r.assessment_date}</Text>
                          {r.notes && <Text style={SD.cardNote}>{r.notes}</Text>}
                        </View>
                        <StatusTag label={r.rating?.toUpperCase()} color={rc} />
                      </View>
                    );
                  })}
              </>
            )}

            {/* Announcements */}
            {tab === 'announce' && (
              <>
                <Text style={SD.sectionHead}>SCHOOL ANNOUNCEMENTS</Text>
                {announcements.length === 0 ? <EmptyState icon="📢" message="No announcements yet." /> :
                  announcements.map((r: any) => (
                    <View key={r.id} style={[SD.card, { borderLeftColor: C.teal, borderLeftWidth: 3 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={SD.cardTitle}>{r.text}</Text>
                        <Text style={SD.cardSub}>{r.created_at?.slice(0, 10)}</Text>
                      </View>
                    </View>
                  ))}
              </>
            )}

            {/* Alerts */}
            {tab === 'alerts' && (
              <>
                <Text style={SD.sectionHead}>ALERTS FROM SCHOOL</Text>
                {alerts.length === 0 ? <EmptyState icon="🚨" message="No alerts from school." /> :
                  alerts.map((r: any) => (
                    <View key={r.id} style={[SD.card, { borderLeftColor: C.red, borderLeftWidth: 3 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={SD.cardTitle}>{r.title}</Text>
                        {r.description && <Text style={SD.cardNote}>{r.description}</Text>}
                        <Text style={SD.cardSub}>{r.created_at?.slice(0, 10)}</Text>
                      </View>
                    </View>
                  ))}
              </>
            )}

            <View style={{ height: 48 }} />
          </ScrollView>
        )}
    </View>
  );
}

const SD = StyleSheet.create({
  fill:          { flex: 1 },
  scroll:        { padding: 24, paddingTop: 60 },
  back:          { marginBottom: 20 },
  backTxt:       { color: C.grey, fontSize: 14 },
  pageH1:        { fontSize: 28, fontWeight: '800', color: C.navy, marginBottom: 4 },
  pageH2:        { fontSize: 13, color: C.grey, marginBottom: 24 },
  schoolRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, shadowColor: 'rgba(13,33,69,0.08)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1 },
  schoolDot:     { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  schoolName:    { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  schoolSub:     { fontSize: 12, color: C.grey },
  loginTop:      { alignItems: 'center', marginBottom: 32, paddingTop: 16 },
  loginIcon:     { width: 64, height: 64, borderRadius: 20, backgroundColor: C.navyLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  loginIconTxt:  { fontSize: 30 },
  loginH1:       { fontSize: 26, fontWeight: '800', color: C.navy, marginBottom: 6 },
  loginH2:       { fontSize: 13, color: C.grey, textAlign: 'center' },
  schoolPill:    { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center' },
  schoolPillName:{ fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 2 },
  schoolPillSub: { fontSize: 12, color: C.grey },
  selectSchoolBtn:{ backgroundColor: C.white, borderRadius: 12, padding: 16, marginBottom: 24, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  selectSchoolTxt:{ color: C.grey, fontSize: 14, fontWeight: '600' },
  label:         { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 8 },
  inputWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 },
  input:         { color: C.black, fontSize: 15 },
  btn:           { borderRadius: 14, padding: 17, alignItems: 'center', shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3 },
  btnTxt:        { color: C.white, fontSize: 16, fontWeight: '700' },
  hint:          { textAlign: 'center', color: C.grey, fontSize: 12, marginTop: 12 },
  header:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, padding: 16, paddingTop: 52, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border, shadowColor: 'rgba(13,33,69,0.06)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2 },
  avatar:        { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:     { fontWeight: '900', fontSize: 15, color: C.white },
  headerName:    { fontSize: 15, fontWeight: '700', color: C.navy },
  headerSub:     { fontSize: 11, color: C.grey, marginTop: 2 },
  signOut:       { backgroundColor: C.offWhite, borderRadius: 8, padding: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border },
  signOutTxt:    { color: C.grey, fontSize: 12, fontWeight: '600' },
  idStrip:       { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  idTxt:         { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  tabBar:        { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, maxHeight: 60 },
  tabItem:       { paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabLabel:      { fontSize: 10, color: C.grey, fontWeight: '600', marginTop: 2 },
  body:          { flex: 1, padding: 16 },
  sectionHead:   { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 14, marginTop: 4 },
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  statCard:      { width: '30%', backgroundColor: C.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, alignItems: 'center', shadowColor: 'rgba(13,33,69,0.06)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 1 },
  statCount:     { fontSize: 26, fontWeight: '900', marginBottom: 4 },
  statLabel:     { fontSize: 10, color: C.grey, fontWeight: '600', textAlign: 'center' },
  card:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border, shadowColor: 'rgba(13,33,69,0.05)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 1 },
  cardTitle:     { fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 2 },
  cardSub:       { fontSize: 11, color: C.grey },
  cardNote:      { fontSize: 12, color: C.greyDark, marginTop: 4, lineHeight: 18 },
  gradeBox:      { alignItems: 'center', backgroundColor: C.navyLight, borderRadius: 10, padding: 10, minWidth: 52 },
  gradeNum:      { fontSize: 18, fontWeight: '900', color: C.navy },
  gradeLetter:   { fontSize: 11, color: C.grey, marginTop: 2 },
  empty:         { alignItems: 'center', padding: 48, backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  emptyTxt:      { fontSize: 13, color: C.grey, textAlign: 'center' },
});
