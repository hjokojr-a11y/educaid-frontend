import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";

function showAlert(title: string, msg?: string) { alert(msg ? title + ': ' + msg : title); }

const C = {
  white: '#FFFFFF', canvas: '#F7F8F5',
  green: '#1B5E3B', greenLight: '#EAF2EC',
  navy: '#0C1F4A', navyLight: '#E8EDF8',
  grey: '#6B7280', greyLight: '#E5E7EB', greyMid: '#9CA3AF', greyDark: '#374151',
  black: '#0A0C10', border: '#D1D5DB',
  red: '#B91C1C', amber: '#B45309', purple: '#6D28D9', teal: '#0E7490',
};

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ backgroundColor: color + '20', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: color + '40' }}>
      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

function Empty({ icon, msg }: { icon: string; msg: string }) {
  return (
    <View style={{ alignItems: 'center', padding: 40, backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginTop: 8 }}>
      <Text style={{ fontSize: 32, marginBottom: 10 }}>{icon}</Text>
      <Text style={{ color: C.grey, fontSize: 13 }}>{msg}</Text>
    </View>
  );
}

export default function StudentDashboardScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<'login' | 'pickSchool' | 'dashboard'>('login');
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (session) {
      const iv = setInterval(() => loadData(session.token, session.user.id), 30000);
      return () => clearInterval(iv);
    }
  }, [session]);

  async function loadData(token: string, studentId: string) {
    const h = { Authorization: `Bearer ${token}` };
    try {
      const [a, ac, hw, sp, ann, al] = await Promise.all([
        fetch(`${API_URL}/student/${studentId}/attendance`,    { headers: h }),
        fetch(`${API_URL}/student/${studentId}/academic`,      { headers: h }),
        fetch(`${API_URL}/student/${studentId}/homework`,      { headers: h }),
        fetch(`${API_URL}/student/${studentId}/sports`,        { headers: h }),
        fetch(`${API_URL}/student/${studentId}/announcements`, { headers: h }),
        fetch(`${API_URL}/student/${studentId}/alerts`,        { headers: h }),
      ]);
      if (a.ok)   setAttendance((await a.json()).attendance || []);
      if (ac.ok)  setAcademic((await ac.json()).reports || []);
      if (hw.ok)  setHomework((await hw.json()).homework || []);
      if (sp.ok)  setSports((await sp.json()).assessments || []);
      if (ann.ok) setAnnouncements((await ann.json()).announcements || []);
      if (al.ok)  setAlerts((await al.json()).alerts || []);
    } catch (e) { console.log('load error', e); }
  }

  async function fetchSchools() {
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
    } catch { showAlert('Error', 'Cannot connect to server.'); }
    setLoadingSchools(false);
  }

  async function doLogin() {
    if (!studentCode || !password) { showAlert('Error', 'Please enter your Student ID and password'); return; }
    if (!selectedSchool) { showAlert('Error', 'Please select your school first'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentCode, password, schoolId: selectedSchool.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert('Login Failed', data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }
      setSession({ token: data.token, user: data.user });
      setDataLoading(true);
      await loadData(data.token, data.user.id);
      setDataLoading(false);
      try { localStorage.setItem('student_session', JSON.stringify({ token: data.token, user: data.user, school: selectedSchool })); } catch {}
      setScreen('dashboard');
    } catch (e) {
      showAlert('Error', 'Cannot connect to server.');
    }
    setLoading(false);
  }

  function doLogout() { setShowLogoutModal(true); }

  function confirmLogout() {
    setShowLogoutModal(false);
    setSession(null);
    setScreen('login');
    setStudentCode('');
    setPassword('');
    setTab('home');
    setAttendance([]);
    setAcademic([]);
    setHomework([]);
    setSports([]);
    setAnnouncements([]);
    setAlerts([]);
  }

  // ── Pick school ──────────────────────────────────────────────────────────────
  if (screen === 'pickSchool') {
    return (
      <View style={[S.fill, { backgroundColor: C.canvas }]}>
        <ScrollView contentContainerStyle={S.pad}>
          <TouchableOpacity style={S.backBtn} onPress={() => setScreen('login')}>
            <Text style={S.backBtnTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={S.h1}>Select School</Text>
          <Text style={S.h2}>Choose your institution to continue</Text>
          {loadingSchools
            ? <ActivityIndicator color={C.green} size="large" style={{ marginTop: 32 }} />
            : schools.map((sc: any) => (
                <TouchableOpacity key={sc.id} style={S.schoolCard}
                  onPress={() => { setSelectedSchool(sc); setScreen('login'); }}>
                  <View style={[S.dot, { backgroundColor: sc.theme_primary || C.green }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={S.schoolCardName}>{sc.name}</Text>
                    <Text style={S.schoolCardSub}>{sc.category}</Text>
                  </View>
                  <Text style={{ color: C.greyMid, fontSize: 20 }}>›</Text>
                </TouchableOpacity>
              ))}
        </ScrollView>
      </View>
    );
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <View style={[S.fill, { backgroundColor: C.canvas }]}>
        <ScrollView contentContainerStyle={S.pad} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
            <Text style={S.backBtnTxt}>← Home</Text>
          </TouchableOpacity>
          <View style={S.loginHeader}>
            <View style={S.loginIcon}>
              <Text style={{ fontSize: 28 }}>🎓</Text>
            </View>
            <Text style={S.loginTitle}>Student Portal</Text>
            <Text style={S.loginSub}>Sign in to view your academic records</Text>
          </View>

          {selectedSchool ? (
            <TouchableOpacity
              style={[S.schoolPill, { borderLeftColor: selectedSchool.theme_primary || C.green }]}
              onPress={() => { setScreen('pickSchool'); fetchSchools(); }}>
              <View style={{ flex: 1 }}>
                <Text style={S.schoolPillName}>{selectedSchool.name}</Text>
                <Text style={S.schoolPillSub}>{selectedSchool.category}</Text>
              </View>
              <Text style={{ color: C.grey, fontSize: 12 }}>Change →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={S.pickSchoolBtn}
              onPress={() => { setScreen('pickSchool'); fetchSchools(); }}>
              <Text style={S.pickSchoolBtnTxt}>🏫  Select Your School</Text>
            </TouchableOpacity>
          )}

          <Text style={S.fieldLabel}>STUDENT ID</Text>
          <View style={S.fieldWrap}>
            <TextInput
              style={S.fieldInput}
              placeholder="e.g. LYC-0002"
              placeholderTextColor={C.greyMid}
              value={studentCode}
              onChangeText={setStudentCode}
              autoCapitalize="none"
            />
          </View>

          <Text style={S.fieldLabel}>PASSWORD</Text>
          <View style={S.fieldWrap}>
            <TextInput
              style={[S.fieldInput, { flex: 1 }]}
              placeholder="Your password"
              placeholderTextColor={C.greyMid}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={{ color: C.grey, fontSize: 13 }}>{showPw ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[S.signInBtn, { opacity: loading ? 0.7 : 1 }]}
            onPress={doLogin}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={S.signInBtnTxt}>Sign In →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  const user = session?.user;

  const TABS = [
    { id: 'home',       icon: '⊞',  label: 'Overview'   },
    { id: 'attendance', icon: '📅', label: 'Attendance'  },
    { id: 'academic',   icon: '📚', label: 'Grades'      },
    { id: 'homework',   icon: '📝', label: 'Homework'    },
    { id: 'sports',     icon: '🏃', label: 'Sports'      },
    { id: 'announce',   icon: '📢', label: 'News'        },
    { id: 'alerts',     icon: '🚨', label: 'Alerts'      },
  ];

  const COLORS: Record<string, string> = {
    home: C.navy, attendance: C.green, academic: C.navy,
    homework: C.purple, sports: C.amber, announce: C.teal, alerts: C.red,
  };

  const activeColor = COLORS[tab] || C.navy;

  return (
    <View style={[S.fill, { backgroundColor: C.canvas }]}>

      {/* Logout overlay */}
      {showLogoutModal && (
        <TouchableOpacity
          style={S.overlay}
          activeOpacity={1}
          onPress={() => setShowLogoutModal(false)}>
          <TouchableOpacity activeOpacity={1} style={S.overlayBox}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.navy, marginBottom: 8 }}>Sign Out</Text>
            <Text style={{ fontSize: 14, color: C.grey, marginBottom: 24 }}>Are you sure you want to sign out?</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: C.canvas, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border }}
                onPress={() => setShowLogoutModal(false)}>
                <Text style={{ color: C.greyDark, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: C.red, borderRadius: 10, padding: 14, alignItems: 'center' }}
                onPress={confirmLogout}>
                <Text style={{ color: C.white, fontWeight: '700' }}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Profile slide-up overlay */}
      {showProfile && (
        <TouchableOpacity
          style={S.overlay}
          activeOpacity={1}
          onPress={() => setShowProfile(false)}>
          <TouchableOpacity activeOpacity={1} style={S.profileSheet}>
            <View style={{ width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 26, fontWeight: '900', color: C.white }}>
                  {user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: C.navy }}>{user?.name}</Text>
              <Text style={{ fontSize: 13, color: C.grey, marginTop: 4 }}>Student</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: 'Student ID', value: user?.studentCode },
                { label: 'Class', value: user?.class?.name },
                { label: 'School', value: user?.school?.name },
                { label: 'Email', value: user?.email || 'Not provided' },
                { label: 'Phone', value: user?.phone || 'Not provided' },
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
                  <Text style={{ fontSize: 12, color: C.grey, fontWeight: '600' }}>{item.label}</Text>
                  <Text style={{ fontSize: 14, color: C.navy, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{item.value || 'N/A'}</Text>
                </View>
              ))}
              <View style={{ marginTop: 24, backgroundColor: C.navyLight, borderRadius: 14, padding: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.navy, letterSpacing: 1, marginBottom: 12 }}>ACADEMIC SUMMARY</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {[
                    { label: 'Attendance', count: attendance.length, color: C.green },
                    { label: 'Grades', count: academic.length, color: C.navy },
                    { label: 'Homework', count: homework.length, color: C.purple },
                  ].map((s, i) => (
                    <View key={i} style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 22, fontWeight: '900', color: s.color }}>{s.count}</Text>
                      <Text style={{ fontSize: 10, color: C.grey, fontWeight: '600' }}>{s.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={S.dashHeader}>
        <TouchableOpacity onPress={() => router.back()} style={{ width:36, height:36, borderRadius:10, backgroundColor:C.canvas, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:C.border }}>
          <Text style={{ fontSize:18, color:C.navy }}>←</Text>
        </TouchableOpacity>
 <TouchableOpacity onPress={() => setShowProfile(true)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10, cursor: 'pointer' } as any}>
          <View style={S.dashAvatar}>
            <Text style={S.dashAvatarTxt}>
              {user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={S.dashName}>{user?.name}</Text>
            <Text style={S.dashSub}>{user?.class?.name} · {user?.school?.name}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={S.signOutBtn} onPress={doLogout}>
          <Text style={S.signOutBtnTxt}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* ID strip */}
      <View style={[S.idStrip, { backgroundColor: C.green + '14' }]}>
        <Text style={[S.idStripTxt, { color: C.green }]}>Student ID: {user?.studentCode}</Text>
      </View>

      {/* Tab pills */}
      <View style={S.tabBarWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.tabBarInner}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            const tColor   = COLORS[t.id];
            return (
              <TouchableOpacity key={t.id}
                style={[S.tabPill, isActive && { backgroundColor: tColor, borderColor: tColor }]}
                onPress={() => setTab(t.id)}>
                <Text style={{ fontSize: 13 }}>{t.icon}</Text>
                <Text style={[S.tabPillTxt, isActive && { color: C.white }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {dataLoading
        ? <ActivityIndicator color={C.navy} size="large" style={{ marginTop: 48 }} />
        : (
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View style={S.secHead}>
              <Text style={[S.secHeadTxt, { color: activeColor }]}>
                {TABS.find(t => t.id === tab)?.icon}  {TABS.find(t => t.id === tab)?.label?.toUpperCase()}
              </Text>
              <View style={[S.secHeadLine, { backgroundColor: activeColor }]} />
            </View>

            {tab === 'home' && (
              <View style={S.statsGrid}>
                {[
                  { label: 'Attendance', count: attendance.length,    color: C.green,  id: 'attendance' },
                  { label: 'Grades',     count: academic.length,      color: C.navy,   id: 'academic'   },
                  { label: 'Homework',   count: homework.length,      color: C.purple, id: 'homework'   },
                  { label: 'Sports',     count: sports.length,        color: C.amber,  id: 'sports'     },
                  { label: 'News',       count: announcements.length, color: C.teal,   id: 'announce'   },
                  { label: 'Alerts',     count: alerts.length,        color: C.red,    id: 'alerts'     },
                ].map((s, i) => (
                  <TouchableOpacity key={i}
                    style={[S.statCard, { borderTopColor: s.color }]}
                    onPress={() => setTab(s.id)}>
                    <Text style={[S.statCount, { color: s.color }]}>{s.count}</Text>
                    <Text style={S.statLabel}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {tab === 'attendance' && (
              attendance.length === 0
                ? <Empty icon="📅" msg="No attendance records yet." />
                : attendance.map((r: any) => {
                    const sc = r.status === 'present' ? C.green : r.status === 'absent' ? C.red : r.status === 'late' ? C.amber : C.teal;
                    return (
                      <View key={r.id} style={[S.card, { borderLeftColor: sc }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={S.cardTitle}>{r.date}</Text>
                          <Text style={S.cardSub}>{r.class_name}</Text>
                        </View>
                        <Tag label={r.status?.toUpperCase()} color={sc} />
                      </View>
                    );
                  })
            )}

            {tab === 'academic' && (
              academic.length === 0
                ? <Empty icon="📚" msg="No academic reports yet." />
                : academic.map((r: any) => (
                    <View key={r.id} style={[S.card, { borderLeftColor: C.navy }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={S.cardTitle}>{r.subject}</Text>
                        <Text style={S.cardSub}>{r.term}</Text>
                        {r.remarks ? <Text style={S.cardNote}>{r.remarks}</Text> : null}
                      </View>
                      <View style={S.gradeBox}>
                        <Text style={S.gradeNum}>{r.score}</Text>
                        <Text style={S.gradeLetter}>{r.grade}</Text>
                      </View>
                    </View>
                  ))
            )}

            {tab === 'homework' && (
              homework.length === 0
                ? <Empty icon="📝" msg="No homework posted yet." />
                : homework.map((r: any) => (
                    <View key={r.id} style={[S.card, { borderLeftColor: C.purple }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={S.cardTitle}>{r.subject}</Text>
                        <Text style={S.cardSub}>Due: {r.due_date || 'No date set'}</Text>
                        {r.description ? <Text style={S.cardNote}>{r.description}</Text> : null}
                      </View>
                    </View>
                  ))
            )}

            {tab === 'sports' && (
              sports.length === 0
                ? <Empty icon="🏃" msg="No sports assessments yet." />
                : sports.map((r: any) => {
                    const rc = r.rating === 'excellent' ? C.green : r.rating === 'good' ? C.navy : r.rating === 'average' ? C.amber : C.red;
                    return (
                      <View key={r.id} style={[S.card, { borderLeftColor: C.amber }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={S.cardTitle}>{r.sport_label || r.sport}</Text>
                          <Text style={S.cardSub}>{r.term} · {r.assessment_date}</Text>
                          {r.notes ? <Text style={S.cardNote}>{r.notes}</Text> : null}
                        </View>
                        <Tag label={r.rating?.toUpperCase()} color={rc} />
                      </View>
                    );
                  })
            )}

            {tab === 'announce' && (
              announcements.length === 0
                ? <Empty icon="📢" msg="No announcements yet." />
                : announcements.map((r: any) => (
                    <View key={r.id} style={[S.card, { borderLeftColor: C.teal }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={S.cardTitle}>{r.text}</Text>
                        <Text style={S.cardSub}>{r.created_at?.slice(0, 10)}</Text>
                      </View>
                    </View>
                  ))
            )}

            {tab === 'alerts' && (
              alerts.length === 0
                ? <Empty icon="🚨" msg="No alerts from school." />
                : alerts.map((r: any) => (
                    <View key={r.id} style={[S.card, { borderLeftColor: C.red }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={S.cardTitle}>{r.title}</Text>
                        {r.description ? <Text style={S.cardNote}>{r.description}</Text> : null}
                        <Text style={S.cardSub}>{r.created_at?.slice(0, 10)}</Text>
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

const S = StyleSheet.create({
  fill:            { flex: 1 },
  pad:             { padding: 24, paddingTop: 60, paddingBottom: 48 },
  backBtn:         { alignSelf: 'flex-start', backgroundColor: C.white, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
  backBtnTxt:      { color: C.greyDark, fontSize: 13, fontWeight: '600' },
  h1:              { fontSize: 26, fontWeight: '800', color: C.navy, marginBottom: 4 },
  h2:              { fontSize: 13, color: C.grey, marginBottom: 24 },
  dot:             { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  schoolCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  schoolCardName:  { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  schoolCardSub:   { fontSize: 12, color: C.grey },
  loginHeader:     { alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  loginIcon:       { width: 64, height: 64, borderRadius: 20, backgroundColor: C.navyLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  loginTitle:      { fontSize: 26, fontWeight: '800', color: C.navy, marginBottom: 6 },
  loginSub:        { fontSize: 13, color: C.grey, textAlign: 'center' },
  schoolPill:      { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center' },
  schoolPillName:  { fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 2 },
  schoolPillSub:   { fontSize: 12, color: C.grey },
  pickSchoolBtn:   { backgroundColor: C.white, borderRadius: 12, padding: 16, marginBottom: 24, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  pickSchoolBtnTxt:{ color: C.grey, fontSize: 14, fontWeight: '600' },
  fieldLabel:      { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 8 },
  fieldWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 },
  fieldInput:      { color: C.black, fontSize: 15 },
  signInBtn:       { backgroundColor: C.navy, borderRadius: 14, padding: 17, alignItems: 'center' },
  signInBtnTxt:    { color: C.white, fontSize: 16, fontWeight: '700' },
  dashHeader:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, padding: 16, paddingTop: 52, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  dashAvatar:      { width: 44, height: 44, borderRadius: 14, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  dashAvatarTxt:   { fontWeight: '900', fontSize: 15, color: C.white },
  dashName:        { fontSize: 15, fontWeight: '700', color: C.navy },
  dashSub:         { fontSize: 11, color: C.grey, marginTop: 2 },
  signOutBtn:      { backgroundColor: C.canvas, borderRadius: 8, padding: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border },
  signOutBtnTxt:   { color: C.grey, fontSize: 12, fontWeight: '600' },
  idStrip:         { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  idStripTxt:      { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  tabBarWrap:      { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 10 },
  tabBarInner:     { paddingHorizontal: 16, gap: 8, flexDirection: 'row', alignItems: 'center' },
  tabPill:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.canvas, borderWidth: 1.5, borderColor: C.border },
  tabPillTxt:      { fontSize: 12, fontWeight: '600', color: C.greyDark },
  secHead:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 4 },
  secHeadTxt:      { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  secHeadLine:     { flex: 1, height: 1.5, borderRadius: 1 },
  statsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard:        { width: '30%', backgroundColor: C.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, borderTopWidth: 3, alignItems: 'center' },
  statCount:       { fontSize: 26, fontWeight: '900', marginBottom: 4 },
  statLabel:       { fontSize: 10, color: C.grey, fontWeight: '600', textAlign: 'center' },
  card:            { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3 },
  cardTitle:       { fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 2 },
  cardSub:         { fontSize: 11, color: C.grey },
  cardNote:        { fontSize: 12, color: C.greyDark, marginTop: 4, lineHeight: 18 },
  gradeBox:        { alignItems: 'center', backgroundColor: C.navyLight, borderRadius: 10, padding: 10, minWidth: 52 },
  gradeNum:        { fontSize: 18, fontWeight: '900', color: C.navy },
  gradeLetter:     { fontSize: 11, color: C.grey, marginTop: 2 },
  overlay:         { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, justifyContent: 'center', alignItems: 'center' },
  overlayBox:      { backgroundColor: C.white, borderRadius: 16, padding: 24, width: '85%' },
  profileSheet:    { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '80%' },
});