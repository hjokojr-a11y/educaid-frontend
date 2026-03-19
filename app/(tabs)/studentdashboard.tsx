import { useState, useEffect } from 'react';
import {
  ActivityIndicator, Alert, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";

const C = {
  bg: '#0A0F1E', surface: '#111827', card: '#1A2235', border: '#1F2D45',
  primary: '#00C896', blue: '#3B82F6', purple: '#8B5CF6', red: '#EF4444',
  amber: '#F59E0B', text: '#F1F5F9', muted: '#64748B', subtle: '#334155',
};

function Tag({ label, color }: any) {
  return (
    <View style={{ backgroundColor: color + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
}

function Empty({ icon, msg }: any) {
  return (
    <View style={DS.empty}>
      <Text style={{ fontSize: 36, marginBottom: 12 }}>{icon}</Text>
      <Text style={DS.emptyTxt}>{msg}</Text>
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
  const accent = selectedSchool?.theme_primary || user?.school?.theme?.primary || C.primary;

  if (step === 'selectSchool') {
    return (
      <View style={[DS.fill, { backgroundColor: C.bg }]}>
        <ScrollView contentContainerStyle={DS.scroll}>
          <TouchableOpacity onPress={() => setStep('login')} style={DS.back}>
            <Text style={DS.backTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={DS.h1}>Select School</Text>
          {loadingSchools
            ? <ActivityIndicator color={C.primary} size="large" style={{ marginTop: 40 }} />
            : schools.map((sc: any) => (
                <TouchableOpacity key={sc.id} style={DS.schoolRow}
                  onPress={() => { setSelectedSchool(sc); setStep('login'); }}>
                  <View style={[DS.dot, { backgroundColor: sc.theme_primary || C.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={DS.schoolName}>{sc.name}</Text>
                    <Text style={DS.schoolSub}>{sc.category}</Text>
                  </View>
                  <Text style={{ color: C.muted, fontSize: 20 }}>›</Text>
                </TouchableOpacity>
              ))
          }
        </ScrollView>
      </View>
    );
  }

  if (step === 'login') {
    return (
      <View style={[DS.fill, { backgroundColor: C.bg }]}>
        <ScrollView contentContainerStyle={DS.scroll} keyboardShouldPersistTaps="handled">
          <View style={DS.loginHeader}>
            <View style={[DS.loginBadge, { backgroundColor: C.primary + '18', borderColor: C.primary + '44' }]}>
              <Text style={[DS.loginBadgeE, { color: C.primary }]}>E</Text>
            </View>
            <Text style={DS.loginTitle}>Student Portal</Text>
            <Text style={DS.loginSub}>Sign in to view your school records</Text>
          </View>

          {selectedSchool ? (
            <TouchableOpacity
              style={[DS.schoolPill, { backgroundColor: accent + '18', borderColor: accent + '44' }]}
              onPress={() => { setStep('selectSchool'); loadSchools(); }}>
              <View style={[DS.dot, { backgroundColor: accent }]} />
              <Text style={[DS.schoolPillName, { color: accent }]}>{selectedSchool.name}</Text>
              <Text style={DS.schoolPillChange}>Change →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={DS.selectBtn}
              onPress={() => { setStep('selectSchool'); loadSchools(); }}>
              <Text style={DS.selectBtnTxt}>🏫  Select Your School</Text>
            </TouchableOpacity>
          )}

          <Text style={DS.label}>STUDENT ID</Text>
          <View style={DS.inputBox}>
            <TextInput style={DS.inputTxt} placeholder="e.g. LYC-0002"
              placeholderTextColor={C.muted} value={studentCode}
              onChangeText={setStudentCode} autoCapitalize="none" />
          </View>

          <Text style={DS.label}>PASSWORD</Text>
          <View style={DS.inputBox}>
            <TextInput style={[DS.inputTxt, { flex: 1 }]} placeholder="Your password"
              placeholderTextColor={C.muted} value={password}
              onChangeText={setPassword} secureTextEntry={!showPw} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={{ color: C.muted, fontSize: 13 }}>{showPw ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[DS.btn, { backgroundColor: selectedSchool ? accent : C.subtle, opacity: !selectedSchool ? 0.6 : 1 }]}
            onPress={login} disabled={loading || !selectedSchool}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={DS.btnTxt}>Sign In →</Text>}
          </TouchableOpacity>

          {!selectedSchool && <Text style={DS.hint}>Please select your school first</Text>}
        </ScrollView>
      </View>
    );
  }

  const TABS = [
    { id: 'home',       icon: '⊞',  label: 'Home' },
    { id: 'attendance', icon: '📅', label: 'Attend.' },
    { id: 'academic',   icon: '📚', label: 'Grades' },
    { id: 'homework',   icon: '📝', label: 'HW' },
    { id: 'sports',     icon: '🏃', label: 'Sports' },
    { id: 'announce',   icon: '📢', label: 'News' },
    { id: 'alerts',     icon: '🚨', label: 'Alerts' },
  ];

  const userAccent = user?.school?.theme?.primary || C.primary;

  return (
    <View style={[DS.fill, { backgroundColor: C.bg }]}>
      <View style={DS.header}>
        <View style={[DS.avatar, { backgroundColor: userAccent + '22', borderColor: userAccent + '55' }]}>
          <Text style={[DS.avatarTxt, { color: userAccent }]}>
            {user?.initials || user?.name?.[0] || '?'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={DS.headerName}>{user?.name}</Text>
          <Text style={DS.headerSub}>{user?.class?.name} · {user?.school?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={DS.signOut}>
          <Text style={DS.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={[DS.idStrip, { backgroundColor: userAccent + '18', borderBottomColor: userAccent + '33' }]}>
        <Text style={[DS.idTxt, { color: userAccent }]}>ID: {user?.studentCode}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={DS.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id}
            style={[DS.tabItem, tab === t.id && { borderBottomColor: userAccent, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.id)}>
            <Text style={{ fontSize: 15 }}>{t.icon}</Text>
            <Text style={[DS.tabLabel, tab === t.id && { color: userAccent }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {dataLoading
        ? <ActivityIndicator color={userAccent} size="large" style={{ marginTop: 48 }} />
        : (
          <ScrollView style={DS.body}>
            {tab === 'home' && (
              <>
                <Text style={DS.sectionHead}>OVERVIEW</Text>
                <View style={DS.statsGrid}>
                  {[
                    { label: 'Attendance', count: attendance.length,    color: C.primary, tab: 'attendance' },
                    { label: 'Grades',     count: academic.length,      color: C.blue,    tab: 'academic' },
                    { label: 'Homework',   count: homework.length,      color: C.purple,  tab: 'homework' },
                    { label: 'Sports',     count: sports.length,        color: C.amber,   tab: 'sports' },
                    { label: 'News',       count: announcements.length, color: '#06B6D4', tab: 'announce' },
                    { label: 'Alerts',     count: alerts.length,        color: C.red,     tab: 'alerts' },
                  ].map((s, i) => (
                    <TouchableOpacity key={i}
                      style={[DS.statCard, { borderTopColor: s.color }]}
                      onPress={() => setTab(s.tab)}>
                      <Text style={[DS.statCount, { color: s.color }]}>{s.count}</Text>
                      <Text style={DS.statLabel}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {tab === 'attendance' && (
              <>
                <Text style={DS.sectionHead}>ATTENDANCE HISTORY</Text>
                {attendance.length === 0 ? <Empty icon="📅" msg="No attendance records yet." /> :
                  attendance.map((r: any) => {
                    const sc = r.status === 'present' ? C.primary : r.status === 'absent' ? C.red : r.status === 'late' ? C.amber : C.blue;
                    return (
                      <View key={r.id} style={DS.row}>
                        <View style={[DS.rowAccent, { backgroundColor: sc }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={DS.rowTitle}>{r.date}</Text>
                          <Text style={DS.rowSub}>{r.class_name}</Text>
                        </View>
                        <Tag label={r.status?.toUpperCase()} color={sc} />
                      </View>
                    );
                  })}
              </>
            )}

            {tab === 'academic' && (
              <>
                <Text style={DS.sectionHead}>ACADEMIC REPORTS</Text>
                {academic.length === 0 ? <Empty icon="📚" msg="No academic reports yet." /> :
                  academic.map((r: any) => (
                    <View key={r.id} style={DS.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={DS.rowTitle}>{r.subject}</Text>
                        <Text style={DS.rowSub}>{r.term}</Text>
                        {r.remarks && <Text style={DS.rowNote}>{r.remarks}</Text>}
                      </View>
                      <View style={DS.gradeBox}>
                        <Text style={DS.gradeNum}>{r.score}</Text>
                        <Text style={DS.gradeLetter}>{r.grade}</Text>
                      </View>
                    </View>
                  ))}
              </>
            )}

            {tab === 'homework' && (
              <>
                <Text style={DS.sectionHead}>HOMEWORK</Text>
                {homework.length === 0 ? <Empty icon="📝" msg="No homework posted yet." /> :
                  homework.map((r: any) => (
                    <View key={r.id} style={DS.row}>
                      <View style={[DS.rowAccent, { backgroundColor: C.purple }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={DS.rowTitle}>{r.subject}</Text>
                        <Text style={DS.rowSub}>Due: {r.due_date || 'No date'}</Text>
                        {r.description && <Text style={DS.rowNote}>{r.description}</Text>}
                      </View>
                    </View>
                  ))}
              </>
            )}

            {tab === 'sports' && (
              <>
                <Text style={DS.sectionHead}>SPORTS & PHYSICAL</Text>
                {sports.length === 0 ? <Empty icon="🏃" msg="No sports assessments yet." /> :
                  sports.map((r: any) => {
                    const rc = r.rating === 'excellent' ? C.primary : r.rating === 'good' ? C.blue : r.rating === 'average' ? C.amber : C.red;
                    return (
                      <View key={r.id} style={DS.row}>
                        <View style={{ flex: 1 }}>
                          <Text style={DS.rowTitle}>{r.sport_label || r.sport}</Text>
                          <Text style={DS.rowSub}>{r.term} · {r.assessment_date}</Text>
                          {r.notes && <Text style={DS.rowNote}>{r.notes}</Text>}
                        </View>
                        <Tag label={r.rating?.toUpperCase()} color={rc} />
                      </View>
                    );
                  })}
              </>
            )}

            {tab === 'announce' && (
              <>
                <Text style={DS.sectionHead}>ANNOUNCEMENTS</Text>
                {announcements.length === 0 ? <Empty icon="📢" msg="No announcements yet." /> :
                  announcements.map((r: any) => (
                    <View key={r.id} style={DS.announceCard}>
                      <Text style={DS.announceTxt}>{r.text}</Text>
                      <Text style={DS.announceDate}>{r.created_at?.slice(0, 10)}</Text>
                    </View>
                  ))}
              </>
            )}

            {tab === 'alerts' && (
              <>
                <Text style={DS.sectionHead}>ALERTS FROM SCHOOL</Text>
                {alerts.length === 0 ? <Empty icon="🚨" msg="No alerts from school." /> :
                  alerts.map((r: any) => (
                    <View key={r.id} style={[DS.row, { borderLeftWidth: 3, borderLeftColor: C.red }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={DS.rowTitle}>{r.title}</Text>
                        {r.description && <Text style={DS.rowNote}>{r.description}</Text>}
                        <Text style={DS.rowSub}>{r.created_at?.slice(0, 10)}</Text>
                      </View>
                    </View>
                  ))}
              </>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
    </View>
  );
}

const DS = StyleSheet.create({
  fill:         { flex: 1 },
  scroll:       { padding: 24, paddingTop: 60 },
  back:         { marginBottom: 20 },
  backTxt:      { color: C.muted, fontSize: 14 },
  h1:           { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 20 },
  schoolRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  dot:          { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  schoolName:   { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  schoolSub:    { fontSize: 12, color: C.muted },
  loginHeader:  { alignItems: 'center', marginBottom: 32, paddingTop: 20 },
  loginBadge:   { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginBottom: 14 },
  loginBadgeE:  { fontSize: 26, fontWeight: '900' },
  loginTitle:   { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 4 },
  loginSub:     { fontSize: 13, color: C.muted },
  schoolPill:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1 },
  schoolPillName: { flex: 1, fontSize: 14, fontWeight: '700', marginLeft: 4 },
  schoolPillChange: { color: C.muted, fontSize: 12 },
  selectBtn:    { backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  selectBtnTxt: { color: C.muted, fontSize: 14, fontWeight: '600' },
  label:        { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 1.2, marginBottom: 8 },
  inputBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 },
  inputTxt:     { color: C.text, fontSize: 15 },
  btn:          { borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 4 },
  btnTxt:       { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint:         { textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 12 },
  header:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, padding: 16, paddingTop: 52, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  avatar:       { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatarTxt:    { fontWeight: '800', fontSize: 15 },
  headerName:   { fontSize: 15, fontWeight: '700', color: C.text },
  headerSub:    { fontSize: 11, color: C.muted, marginTop: 2 },
  signOut:      { backgroundColor: C.card, borderRadius: 8, padding: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: C.border },
  signOutTxt:   { color: C.muted, fontSize: 12, fontWeight: '600' },
  idStrip:      { paddingHorizontal: 16, paddingVertical: 7, borderBottomWidth: 1 },
  idTxt:        { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  tabBar:       { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, maxHeight: 60 },
  tabItem:      { paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabLabel:     { fontSize: 10, color: C.muted, fontWeight: '600', marginTop: 2 },
  body:         { flex: 1, padding: 16 },
  sectionHead:  { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 1.2, marginBottom: 14, marginTop: 4 },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard:     { width: '30%', backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, borderTopWidth: 2, alignItems: 'center' },
  statCount:    { fontSize: 26, fontWeight: '900', marginBottom: 4 },
  statLabel:    { fontSize: 10, color: C.muted, fontWeight: '600' },
  row:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  rowAccent:    { width: 4, borderRadius: 4, marginRight: 12, alignSelf: 'stretch' },
  rowTitle:     { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
  rowSub:       { fontSize: 11, color: C.muted },
  rowNote:      { fontSize: 12, color: '#94A3B8', marginTop: 4, lineHeight: 18 },
  gradeBox:     { alignItems: 'center', backgroundColor: C.surface, borderRadius: 10, padding: 10, minWidth: 50, borderWidth: 1, borderColor: C.border },
  gradeNum:     { fontSize: 18, fontWeight: '900', color: C.text },
  gradeLetter:  { fontSize: 11, color: C.muted, marginTop: 2 },
  announceCard: { backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: '#06B6D4' },
  announceTxt:  { fontSize: 14, color: C.text, lineHeight: 20, marginBottom: 6 },
  announceDate: { fontSize: 11, color: C.muted },
  empty:        { alignItems: 'center', padding: 48, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  emptyTxt:     { fontSize: 13, color: C.muted, textAlign: 'center' },
});
