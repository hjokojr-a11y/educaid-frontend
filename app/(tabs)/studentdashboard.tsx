import { useState, useEffect } from 'react';
import {
  ActivityIndicator, Alert, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions
} from 'react-native';
import Svg, { Circle, Line, Rect, G } from 'react-native-svg';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";
const { width } = Dimensions.get('window');

const C = {
  white: '#FFFFFF', canvas: '#F7F8F5',
  green: '#1B5E3B', greenDark: '#0F3D26', greenLight: '#EAF2EC', greenMid: '#2E7D52',
  navy: '#0C1F4A', navyMid: '#1A3366', navyLight: '#E8EDF8',
  grey: '#6B7280', greyLight: '#E5E7EB', greyMid: '#9CA3AF', greyDark: '#374151',
  black: '#0A0C10', border: '#D1D5DB', shadow: 'rgba(12,31,74,0.09)',
  red: '#B91C1C', amber: '#B45309', blue: '#1D4ED8', purple: '#6D28D9', teal: '#0E7490',
};

function AfricanBg() {
  const spots = [
    { x: 24,     y: 60,  s: 40, type: 'adinkra' },
    { x: width - 64, y: 160, s: 34, type: 'diamond' },
    { x: 32,     y: 320, s: 36, type: 'cross' },
    { x: width - 56, y: 480, s: 44, type: 'adinkra' },
    { x: 18,     y: 640, s: 38, type: 'diamond' },
  ];
  return (
    <Svg style={StyleSheet.absoluteFill} width={width} height={900}>
      {spots.map((p, i) => {
        const cx = p.x + p.s / 2;
        const cy = p.y + p.s / 2;
        const r = p.s / 2;
        const col = i % 2 === 0 ? C.navy : C.green;
        if (p.type === 'adinkra') return (
          <G key={i} opacity={0.055}>
            <Circle cx={cx} cy={cy} r={r} stroke={col} strokeWidth={1.8} fill="none" />
            <Circle cx={cx} cy={cy} r={r * 0.5} stroke={col} strokeWidth={1.2} fill="none" />
            <Circle cx={cx} cy={cy} r={r * 0.15} fill={col} />
            <Line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={col} strokeWidth={1} />
            <Line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={col} strokeWidth={1} />
          </G>
        );
        if (p.type === 'diamond') return (
          <G key={i} opacity={0.055}>
            <Rect x={cx - r * 0.7} y={cy - r * 0.7} width={r * 1.4} height={r * 1.4}
              stroke={col} strokeWidth={1.8} fill="none"
              transform={`rotate(45, ${cx}, ${cy})`} />
            <Rect x={cx - r * 0.35} y={cy - r * 0.35} width={r * 0.7} height={r * 0.7}
              stroke={col} strokeWidth={1} fill="none"
              transform={`rotate(45, ${cx}, ${cy})`} />
          </G>
        );
        if (p.type === 'cross') return (
          <G key={i} opacity={0.055}>
            <Rect x={cx - r} y={cy - r * 0.18} width={r * 2} height={r * 0.36} fill={col} rx={2} />
            <Rect x={cx - r * 0.18} y={cy - r} width={r * 0.36} height={r * 2} fill={col} rx={2} />
            <Rect x={cx - r} y={cy - r * 0.18} width={r * 2} height={r * 0.36} fill={col} rx={2}
              transform={`rotate(45, ${cx}, ${cy})`} />
            <Rect x={cx - r * 0.18} y={cy - r} width={r * 0.36} height={r * 2} fill={col} rx={2}
              transform={`rotate(45, ${cx}, ${cy})`} />
          </G>
        );
        return null;
      })}
    </Svg>
  );
}

function Tag({ label, color }: any) {
  return (
    <View style={{ backgroundColor: color + '18', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: color + '33' }}>
      <Text style={{ color, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
}

function Empty({ icon, msg }: any) {
  return (
    <View style={SD.empty}>
      <Text style={{ fontSize: 36, marginBottom: 12 }}>{icon}</Text>
      <Text style={SD.emptyTxt}>{msg}</Text>
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
      const interval = setInterval(() => doRefresh(session.token, session.user), 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  async function doRefresh(token: string, user: any) {
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
      await doRefresh(data.token, data.user);
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
  const accent = selectedSchool?.theme_primary || user?.school?.theme?.primary || C.green;

  // School picker
  if (step === 'selectSchool') {
    return (
      <View style={[SD.fill, { backgroundColor: C.canvas }]}>
        <AfricanBg />
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
                  <View style={[SD.dot, { backgroundColor: sc.theme_primary || C.green }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={SD.schoolName}>{sc.name}</Text>
                    <Text style={SD.schoolSub}>{sc.category}</Text>
                  </View>
                  <Text style={{ color: C.greyMid, fontSize: 22 }}>›</Text>
                </TouchableOpacity>
              ))}
        </ScrollView>
      </View>
    );
  }

  // Login
  if (step === 'login') {
    return (
      <View style={[SD.fill, { backgroundColor: C.canvas }]}>
        <AfricanBg />
        <ScrollView contentContainerStyle={SD.scroll} keyboardShouldPersistTaps="handled">
          <View style={SD.loginTop}>
            <View style={SD.loginIconBox}>
              <Text style={{ fontSize: 28 }}>🎓</Text>
            </View>
            <Text style={SD.loginH1}>Student Portal</Text>
            <Text style={SD.loginH2}>Sign in to view your academic records</Text>
          </View>

          {selectedSchool ? (
            <TouchableOpacity style={[SD.schoolPill, { borderLeftColor: accent }]}
              onPress={() => { setStep('selectSchool'); loadSchools(); }}>
              <View style={{ flex: 1 }}>
                <Text style={SD.schoolPillName}>{selectedSchool.name}</Text>
                <Text style={SD.schoolPillSub}>{selectedSchool.category}</Text>
              </View>
              <Text style={{ color: C.grey, fontSize: 12 }}>Change →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={SD.selectBtn}
              onPress={() => { setStep('selectSchool'); loadSchools(); }}>
              <Text style={SD.selectBtnTxt}>🏫  Select Your School</Text>
            </TouchableOpacity>
          )}

          <Text style={SD.label}>STUDENT ID</Text>
          <View style={SD.inputWrap}>
            <TextInput style={SD.inputTxt} placeholder="e.g. LYC-0002"
              placeholderTextColor={C.greyMid} value={studentCode}
              onChangeText={setStudentCode} autoCapitalize="none" />
          </View>

          <Text style={SD.label}>PASSWORD</Text>
          <View style={SD.inputWrap}>
            <TextInput style={[SD.inputTxt, { flex: 1 }]} placeholder="Your password"
              placeholderTextColor={C.greyMid} value={password}
              onChangeText={setPassword} secureTextEntry={!showPw} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={{ color: C.grey, fontSize: 13 }}>{showPw ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[SD.btn, { backgroundColor: selectedSchool ? C.navy : C.greyLight, opacity: !selectedSchool ? 0.65 : 1 }]}
            onPress={login} disabled={loading || !selectedSchool}>
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={SD.btnTxt}>Sign In →</Text>}
          </TouchableOpacity>

          {!selectedSchool && <Text style={SD.hint}>Please select your school first</Text>}
        </ScrollView>
      </View>
    );
  }

  // Dashboard
  const TABS = [
    { id: 'home',       emoji: '⊞',  label: 'Overview',  color: C.navy  },
    { id: 'attendance', emoji: '📅', label: 'Attendance', color: C.green },
    { id: 'academic',   emoji: '📚', label: 'Grades',     color: C.navy  },
    { id: 'homework',   emoji: '📝', label: 'Homework',   color: C.purple},
    { id: 'sports',     emoji: '🏃', label: 'Sports',     color: C.amber },
    { id: 'announce',   emoji: '📢', label: 'News',       color: C.teal  },
    { id: 'alerts',     emoji: '🚨', label: 'Alerts',     color: C.red   },
  ];

  const userAccent = user?.school?.theme?.primary || C.green;
  const activeTab = TABS.find(t => t.id === tab);

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
      <View style={[SD.idStrip, { backgroundColor: userAccent + '14' }]}>
        <Text style={[SD.idTxt, { color: userAccent }]}>Student ID: {user?.studentCode}</Text>
      </View>

      {/* Innovative Tab Bar — pill-style horizontal scroll */}
      <View style={SD.tabBarWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={SD.tabBarInner}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <TouchableOpacity key={t.id}
                style={[SD.tabPill, active && { backgroundColor: t.color, borderColor: t.color }]}
                onPress={() => setTab(t.id)}>
                <Text style={{ fontSize: 13 }}>{t.emoji}</Text>
                <Text style={[SD.tabPillTxt, active && { color: C.white }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {dataLoading
        ? <ActivityIndicator color={C.navy} size="large" style={{ marginTop: 48 }} />
        : (
          <ScrollView style={SD.body}>

            {/* Section header */}
            <View style={SD.tabHeader}>
              <Text style={[SD.tabHeaderTxt, { color: activeTab?.color || C.navy }]}>
                {activeTab?.emoji} {activeTab?.label?.toUpperCase()}
              </Text>
              <View style={[SD.tabHeaderLine, { backgroundColor: activeTab?.color || C.navy }]} />
            </View>

            {/* Home */}
            {tab === 'home' && (
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
                    style={[SD.statCard, { borderTopColor: s.color }]}
                    onPress={() => setTab(s.tab)}>
                    <Text style={[SD.statCount, { color: s.color }]}>{s.count}</Text>
                    <Text style={SD.statLabel}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Attendance */}
            {tab === 'attendance' && (
              attendance.length === 0 ? <Empty icon="📅" msg="No attendance records yet." /> :
              attendance.map((r: any) => {
                const sc = r.status === 'present' ? C.green : r.status === 'absent' ? C.red : r.status === 'late' ? C.amber : C.blue;
                return (
                  <View key={r.id} style={[SD.card, { borderLeftColor: sc }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={SD.cardTitle}>{r.date}</Text>
                      <Text style={SD.cardSub}>{r.class_name}</Text>
                    </View>
                    <Tag label={r.status?.toUpperCase()} color={sc} />
                  </View>
                );
              })
            )}

            {/* Academic */}
            {tab === 'academic' && (
              academic.length === 0 ? <Empty icon="📚" msg="No academic reports yet." /> :
              academic.map((r: any) => (
                <View key={r.id} style={[SD.card, { borderLeftColor: C.navy }]}>
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
              ))
            )}

            {/* Homework */}
            {tab === 'homework' && (
              homework.length === 0 ? <Empty icon="📝" msg="No homework posted yet." /> :
              homework.map((r: any) => (
                <View key={r.id} style={[SD.card, { borderLeftColor: C.purple }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={SD.cardTitle}>{r.subject}</Text>
                    <Text style={SD.cardSub}>Due: {r.due_date || 'No date set'}</Text>
                    {r.description && <Text style={SD.cardNote}>{r.description}</Text>}
                  </View>
                </View>
              ))
            )}

            {/* Sports */}
            {tab === 'sports' && (
              sports.length === 0 ? <Empty icon="🏃" msg="No sports assessments yet." /> :
              sports.map((r: any) => {
                const rc = r.rating === 'excellent' ? C.green : r.rating === 'good' ? C.navy : r.rating === 'average' ? C.amber : C.red;
                return (
                  <View key={r.id} style={[SD.card, { borderLeftColor: C.amber }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={SD.cardTitle}>{r.sport_label || r.sport}</Text>
                      <Text style={SD.cardSub}>{r.term} · {r.assessment_date}</Text>
                      {r.notes && <Text style={SD.cardNote}>{r.notes}</Text>}
                    </View>
                    <Tag label={r.rating?.toUpperCase()} color={rc} />
                  </View>
                );
              })
            )}

            {/* Announcements */}
            {tab === 'announce' && (
              announcements.length === 0 ? <Empty icon="📢" msg="No announcements yet." /> :
              announcements.map((r: any) => (
                <View key={r.id} style={[SD.card, { borderLeftColor: C.teal }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={SD.cardTitle}>{r.text}</Text>
                    <Text style={SD.cardSub}>{r.created_at?.slice(0, 10)}</Text>
                  </View>
                </View>
              ))
            )}

            {/* Alerts */}
            {tab === 'alerts' && (
              alerts.length === 0 ? <Empty icon="🚨" msg="No alerts from school." /> :
              alerts.map((r: any) => (
                <View key={r.id} style={[SD.card, { borderLeftColor: C.red }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={SD.cardTitle}>{r.title}</Text>
                    {r.description && <Text style={SD.cardNote}>{r.description}</Text>}
                    <Text style={SD.cardSub}>{r.created_at?.slice(0, 10)}</Text>
                  </View>
                </View>
              ))
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
  schoolRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1 },
  dot:           { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  schoolName:    { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  schoolSub:     { fontSize: 12, color: C.grey },
  loginTop:      { alignItems: 'center', marginBottom: 28, paddingTop: 16 },
  loginIconBox:  { width: 64, height: 64, borderRadius: 20, backgroundColor: C.navyLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  loginH1:       { fontSize: 26, fontWeight: '800', color: C.navy, marginBottom: 6 },
  loginH2:       { fontSize: 13, color: C.grey, textAlign: 'center' },
  schoolPill:    { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center' },
  schoolPillName:{ fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 2 },
  schoolPillSub: { fontSize: 12, color: C.grey },
  selectBtn:     { backgroundColor: C.white, borderRadius: 12, padding: 16, marginBottom: 24, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  selectBtnTxt:  { color: C.grey, fontSize: 14, fontWeight: '600' },
  label:         { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 8 },
  inputWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 1 },
  inputTxt:      { color: C.black, fontSize: 15 },
  btn:           { borderRadius: 14, padding: 17, alignItems: 'center', shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 },
  btnTxt:        { color: C.white, fontSize: 16, fontWeight: '700' },
  hint:          { textAlign: 'center', color: C.grey, fontSize: 12, marginTop: 12 },
  header:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, padding: 16, paddingTop: 52, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2 },
  avatar:        { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:     { fontWeight: '900', fontSize: 15, color: C.white },
  headerName:    { fontSize: 15, fontWeight: '700', color: C.navy },
  headerSub:     { fontSize: 11, color: C.grey, marginTop: 2 },
  signOut:       { backgroundColor: C.canvas, borderRadius: 8, padding: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border },
  signOutTxt:    { color: C.grey, fontSize: 12, fontWeight: '600' },
  idStrip:       { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  idTxt:         { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  // Innovative pill tab bar
  tabBarWrap:    { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 10 },
  tabBarInner:   { paddingHorizontal: 16, gap: 8, flexDirection: 'row', alignItems: 'center' },
  tabPill:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.canvas, borderWidth: 1.5, borderColor: C.border },
  tabPillTxt:    { fontSize: 12, fontWeight: '600', color: C.greyDark },
  body:          { flex: 1, padding: 16 },
  tabHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 4 },
  tabHeaderTxt:  { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  tabHeaderLine: { flex: 1, height: 1.5, borderRadius: 1 },
  // Stats grid
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard:      { width: '30%', backgroundColor: C.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, borderTopWidth: 3, alignItems: 'center', shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 1 },
  statCount:     { fontSize: 26, fontWeight: '900', marginBottom: 4 },
  statLabel:     { fontSize: 10, color: C.grey, fontWeight: '600', textAlign: 'center' },
  // Cards
  card:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 1 },
  cardTitle:     { fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 2 },
  cardSub:       { fontSize: 11, color: C.grey },
  cardNote:      { fontSize: 12, color: C.greyDark, marginTop: 4, lineHeight: 18 },
  gradeBox:      { alignItems: 'center', backgroundColor: C.navyLight, borderRadius: 10, padding: 10, minWidth: 52 },
  gradeNum:      { fontSize: 18, fontWeight: '900', color: C.navy },
  gradeLetter:   { fontSize: 11, color: C.grey, marginTop: 2 },
  empty:         { alignItems: 'center', padding: 48, backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  emptyTxt:      { fontSize: 13, color: C.grey, textAlign: 'center' },
});
