import { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";

export default function StudentDashboardScreen() {
  const [step, setStep]           = useState('login');
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [session, setSession]     = useState(null);
  const [tab, setTab]             = useState('home');
  const [schools, setSchools]     = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // Data
  const [attendance, setAttendance]   = useState([]);
  const [academic, setAcademic]       = useState([]);
  const [homework, setHomework]       = useState([]);
  const [sports, setSports]           = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [alerts, setAlerts]           = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const T = session?.user?.school?.theme || { primary: '#1a7a6e', secondary: '#e8b24a', dark: '#0f1923' };

  // Auto refresh every 30 seconds when logged in
  useEffect(() => {
    if (session) {
      const interval = setInterval(() => {
        refreshData(session.token, session.user);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  async function refreshData(token, user) {
    const headers = { Authorization: `Bearer ${token}` };
    const studentId = user.id;
    try {
      const attRes = await fetch(`${API_URL}/student/${studentId}/attendance`, { headers });
      if (attRes.ok) { const d = await attRes.json(); setAttendance(d.attendance || []); }
      const acaRes = await fetch(`${API_URL}/student/${studentId}/academic`, { headers });
      if (acaRes.ok) { const d = await acaRes.json(); setAcademic(d.reports || []); }
      const hwRes = await fetch(`${API_URL}/student/${studentId}/homework`, { headers });
      if (hwRes.ok) { const d = await hwRes.json(); setHomework(d.homework || []); }
      const spRes = await fetch(`${API_URL}/student/${studentId}/sports`, { headers });
      if (spRes.ok) { const d = await spRes.json(); setSports(d.assessments || []); }
      const annRes = await fetch(`${API_URL}/student/${studentId}/announcements`, { headers });
      if (annRes.ok) { const d = await annRes.json(); setAnnouncements(d.announcements || []); }
      const alRes = await fetch(`${API_URL}/student/${studentId}/alerts`, { headers });
      if (alRes.ok) { const d = await alRes.json(); setAlerts(d.alerts || []); }
    } catch (err) { console.log("Refresh error:", err); }
  }

  async function loadSchools() {
    setLoadingSchools(true);
    try {
      const res = await fetch(`${API_URL}/auth/super/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "hjokojr@gmail.com", password: "EducAid2024!" })
      });
      const auth = await res.json();
      const res2 = await fetch(`${API_URL}/auth/super/schools`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res2.json();
      setSchools(data.schools || []);
    } catch { Alert.alert("Error", "Cannot connect to server."); }
    setLoadingSchools(false);
  }

  async function login() {
    if (!studentCode || !password) { Alert.alert("Error", "Enter Student ID and password"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentCode, password, schoolId: selectedSchool?.id })
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Login Failed", data.error || "Invalid credentials"); setLoading(false); return; }
      setSession({ token: data.token, user: data.user });
      setStep('dashboard');
      setLoading(false);
      loadDashboardData(data.token, data.user);
    } catch { Alert.alert("Error", "Cannot connect to server."); setLoading(false); }
  }

  async function loadDashboardData(token, user) {
    setDataLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    const studentId = user.id;
    try {
      const attRes = await fetch(`${API_URL}/student/${studentId}/attendance`, { headers });
      if (attRes.ok) { const d = await attRes.json(); setAttendance(d.attendance || []); }
      const acaRes = await fetch(`${API_URL}/student/${studentId}/academic`, { headers });
      if (acaRes.ok) { const d = await acaRes.json(); setAcademic(d.reports || []); }
      const hwRes = await fetch(`${API_URL}/student/${studentId}/homework`, { headers });
      if (hwRes.ok) { const d = await hwRes.json(); setHomework(d.homework || []); }
      const spRes = await fetch(`${API_URL}/student/${studentId}/sports`, { headers });
      if (spRes.ok) { const d = await spRes.json(); setSports(d.assessments || []); }
      const annRes = await fetch(`${API_URL}/student/${studentId}/announcements`, { headers });
      if (annRes.ok) { const d = await annRes.json(); setAnnouncements(d.announcements || []); }
      const alRes = await fetch(`${API_URL}/student/${studentId}/alerts`, { headers });
      if (alRes.ok) { const d = await alRes.json(); setAlerts(d.alerts || []); }
    } catch (err) { console.log("Data load error:", err); }
    setDataLoading(false);
  }

  function logout() {
    setSession(null); setStep('login'); setSelectedSchool(null);
    setStudentCode(''); setPassword(''); setTab('home');
    setAttendance([]); setAcademic([]); setHomework([]);
    setSports([]); setAnnouncements([]); setAlerts([]);
  }

  const user = session?.user;

  // School selection
  if (step === 'selectSchool') {
    return (
      <View style={[styles.container, { backgroundColor: '#0f1923' }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => setStep('login')} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Select Your School</Text>
          {loadingSchools ? (
            <ActivityIndicator color="#1a7a6e" size="large" style={{ marginTop: 40 }} />
          ) : (
            schools.map(school => (
              <TouchableOpacity
                key={school.id}
                style={styles.schoolCard}
                onPress={() => { setSelectedSchool(school); setStep('login'); }}>
                <View style={[styles.dot, { backgroundColor: school.theme_primary || '#1a7a6e' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.schoolName}>{school.name}</Text>
                  <Text style={styles.schoolCat}>{school.category}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // Login
  if (step === 'login') {
    return (
      <View style={[styles.container, { backgroundColor: '#0f1923' }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.appTitle}>EducAid</Text>
          <Text style={styles.appSub}>Student & Parent Portal</Text>

          {selectedSchool ? (
            <TouchableOpacity
              style={[styles.schoolBadge, { backgroundColor: selectedSchool.theme_primary || '#1a7a6e' }]}
              onPress={() => { setStep('selectSchool'); loadSchools(); }}>
              <Text style={styles.schoolBadgeName}>{selectedSchool.name}</Text>
              <Text style={styles.schoolBadgeChange}>Change →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.selectSchoolBtn}
              onPress={() => { setStep('selectSchool'); loadSchools(); }}>
              <Text style={styles.selectSchoolText}>🏫 Select Your School</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.label}>Student ID</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🎓</Text>
            <TextInput
              style={styles.inputInner}
              placeholder="e.g. LYC-0002"
              placeholderTextColor="#7a7066"
              value={studentCode}
              onChangeText={setStudentCode}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.inputInner}
              placeholder="Your password"
              placeholderTextColor="#7a7066"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: selectedSchool?.theme_primary || '#1a7a6e', opacity: !selectedSchool ? 0.5 : 1 }]}
            onPress={login}
            disabled={loading || !selectedSchool}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Sign In →</Text>}
          </TouchableOpacity>

          {!selectedSchool && (
            <Text style={styles.hint}>Please select your school first</Text>
          )}
        </ScrollView>
      </View>
    );
  }

  // Dashboard
  return (
    <View style={[styles.container, { backgroundColor: '#f5f0e8' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.dark }]}>
        <View style={[styles.avatar, { backgroundColor: T.primary }]}>
          <Text style={styles.avatarText}>{user?.initials || user?.name?.[0] || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{user?.name}</Text>
          <Text style={styles.headerSub}>{user?.class?.name} · {user?.school?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Student ID bar */}
      <View style={[styles.idBar, { backgroundColor: T.primary }]}>
        <Text style={styles.idBarText}>Student ID: {user?.studentCode}</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        {[
          { id: 'home',      icon: '🏠', label: 'Home' },
          { id: 'attendance',icon: '📅', label: 'Attendance' },
          { id: 'academic',  icon: '📚', label: 'Grades' },
          { id: 'homework',  icon: '📝', label: 'Homework' },
          { id: 'sports',    icon: '🏃', label: 'Sports' },
          { id: 'announce',  icon: '📢', label: 'News' },
          { id: 'alerts',    icon: '🚨', label: 'Alerts' },
        ].map(t => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tabBtn, tab === t.id && { borderBottomColor: T.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.id)}>
            <Text style={{ fontSize: 16 }}>{t.icon}</Text>
            <Text style={[styles.tabText, tab === t.id && { color: T.primary }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {dataLoading ? (
        <ActivityIndicator color={T.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.content}>

          {/* Home Tab */}
          {tab === 'home' && (
            <>
              <Text style={styles.sectionTitle}>QUICK SUMMARY</Text>
              {[
                { icon: '📅', title: 'Attendance', count: attendance.length, color: T.primary, tab: 'attendance' },
                { icon: '📚', title: 'Academic Reports', count: academic.length, color: '#2a6fa8', tab: 'academic' },
                { icon: '📝', title: 'Homework', count: homework.length, color: '#a855f7', tab: 'homework' },
                { icon: '🏃', title: 'Sports Assessments', count: sports.length, color: '#e8692a', tab: 'sports' },
                { icon: '📢', title: 'Announcements', count: announcements.length, color: '#f59e0b', tab: 'announce' },
                { icon: '🚨', title: 'Alerts', count: alerts.length, color: '#ef4444', tab: 'alerts' },
              ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.summaryCard} onPress={() => setTab(item.tab)}>
                  <View style={[styles.summaryIcon, { backgroundColor: item.color + '22' }]}>
                    <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryTitle}>{item.title}</Text>
                    <Text style={styles.summarySub}>{item.count} record{item.count !== 1 ? 's' : ''}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Attendance Tab */}
          {tab === 'attendance' && (
            <>
              <Text style={styles.sectionTitle}>ATTENDANCE HISTORY</Text>
              {attendance.length === 0 ? (
                <EmptyCard icon="📅" message="No attendance records yet." />
              ) : (
                attendance.map(r => (
                  <View key={r.id} style={styles.recordCard}>
                    <View style={[styles.statusDot, {
                      backgroundColor: r.status === 'present' ? '#22c55e' :
                                       r.status === 'absent' ? '#ef4444' :
                                       r.status === 'late' ? '#eab308' : '#3b82f6'
                    }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordTitle}>{r.date}</Text>
                      <Text style={styles.recordSub}>{r.class_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, {
                      backgroundColor: r.status === 'present' ? '#dcfce7' :
                                       r.status === 'absent' ? '#fee2e2' :
                                       r.status === 'late' ? '#fef9c3' : '#dbeafe'
                    }]}>
                      <Text style={[styles.statusText, {
                        color: r.status === 'present' ? '#166534' :
                               r.status === 'absent' ? '#991b1b' :
                               r.status === 'late' ? '#854d0e' : '#1e40af'
                      }]}>{r.status?.toUpperCase()}</Text>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* Academic Tab */}
          {tab === 'academic' && (
            <>
              <Text style={styles.sectionTitle}>ACADEMIC REPORTS</Text>
              {academic.length === 0 ? (
                <EmptyCard icon="📚" message="No academic reports yet." />
              ) : (
                academic.map(r => (
                  <View key={r.id} style={styles.recordCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordTitle}>{r.subject}</Text>
                      <Text style={styles.recordSub}>{r.term}</Text>
                      {r.remarks && <Text style={styles.recordNote}>{r.remarks}</Text>}
                    </View>
                    <View style={styles.gradeBox}>
                      <Text style={styles.gradeScore}>{r.score}</Text>
                      <Text style={styles.gradeLabel}>{r.grade}</Text>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* Homework Tab */}
          {tab === 'homework' && (
            <>
              <Text style={styles.sectionTitle}>HOMEWORK</Text>
              {homework.length === 0 ? (
                <EmptyCard icon="📝" message="No homework posted yet." />
              ) : (
                homework.map(r => (
                  <View key={r.id} style={styles.recordCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordTitle}>{r.subject}</Text>
                      <Text style={styles.recordSub}>{r.hw_type} · Due: {r.due_date || 'No date'}</Text>
                      {r.description && <Text style={styles.recordNote}>{r.description}</Text>}
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* Sports Tab */}
          {tab === 'sports' && (
            <>
              <Text style={styles.sectionTitle}>SPORTS & PHYSICAL</Text>
              {sports.length === 0 ? (
                <EmptyCard icon="🏃" message="No sports assessments yet." />
              ) : (
                sports.map(r => (
                  <View key={r.id} style={styles.recordCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordTitle}>{r.sport_label || r.sport}</Text>
                      <Text style={styles.recordSub}>{r.term} · {r.assessment_date}</Text>
                      {r.notes && <Text style={styles.recordNote}>{r.notes}</Text>}
                    </View>
                    <View style={[styles.ratingBadge, {
                      backgroundColor: r.rating === 'excellent' ? '#dcfce7' :
                                       r.rating === 'good' ? '#dbeafe' :
                                       r.rating === 'average' ? '#fef9c3' : '#fee2e2'
                    }]}>
                      <Text style={styles.ratingText}>{r.rating?.toUpperCase()}</Text>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* Announcements Tab */}
          {tab === 'announce' && (
            <>
              <Text style={styles.sectionTitle}>ANNOUNCEMENTS</Text>
              {announcements.length === 0 ? (
                <EmptyCard icon="📢" message="No announcements yet." />
              ) : (
                announcements.map(r => (
                  <View key={r.id} style={styles.announceCard}>
                    <Text style={styles.announceText}>{r.text}</Text>
                    <Text style={styles.announceDate}>{r.created_at?.slice(0, 10)}</Text>
                  </View>
                ))
              )}
            </>
          )}

          {/* Alerts Tab */}
          {tab === 'alerts' && (
            <>
              <Text style={styles.sectionTitle}>ALERTS FROM SCHOOL</Text>
              {alerts.length === 0 ? (
                <EmptyCard icon="🚨" message="No alerts from school." />
              ) : (
                alerts.map(r => (
                  <View key={r.id} style={[styles.alertCard, { borderLeftColor: '#ef4444' }]}>
                    <Text style={styles.alertTitle}>{r.title}</Text>
                    {r.description && <Text style={styles.alertDesc}>{r.description}</Text>}
                    <Text style={styles.announceDate}>{r.created_at?.slice(0, 10)}</Text>
                  </View>
                ))
              )}
            </>
          )}

        </ScrollView>
      )}
    </View>
  );
}

function EmptyCard({ icon, message }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>{icon}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  scroll:          { padding: 24, paddingTop: 60 },
  appTitle:        { fontSize: 40, fontWeight: '800', color: '#fff', marginBottom: 6 },
  appSub:          { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 32 },
  schoolBadge:     { borderRadius: 12, padding: 14, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  schoolBadgeName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  schoolBadgeChange:{ fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  selectSchoolBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  selectSchoolText:{ fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  label:           { fontSize: 11, fontWeight: '700', color: '#7a8fa8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  inputWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16, paddingHorizontal: 12 },
  inputIcon:       { fontSize: 18, marginRight: 10 },
  inputInner:      { flex: 1, padding: 14, color: '#fff', fontSize: 15 },
  loginBtn:        { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  loginBtnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint:            { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 12 },
  schoolCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 10 },
  dot:             { width: 14, height: 14, borderRadius: 7, marginRight: 14 },
  schoolName:      { fontSize: 15, fontWeight: '700', color: '#fff' },
  schoolCat:       { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  arrow:           { fontSize: 22, color: '#ddd8cc' },
  pageTitle:       { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 24 },
  backBtn:         { marginBottom: 20 },
  backText:        { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  header:          { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 56, gap: 12 },
  avatar:          { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText:      { color: '#fff', fontWeight: '800', fontSize: 16 },
  headerName:      { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerSub:       { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  signOutBtn:      { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 8, paddingHorizontal: 10 },
  signOutText:     { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  idBar:           { paddingHorizontal: 16, paddingVertical: 8 },
  idBarText:       { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  tabScroll:       { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd8cc', maxHeight: 64 },
  tabBtn:          { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText:         { fontSize: 11, color: '#7a7066', fontWeight: '600', marginTop: 2 },
  content:         { flex: 1, padding: 16 },
  sectionTitle:    { fontSize: 10, fontWeight: '700', color: '#7a7066', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 4 },
  summaryCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: '#ddd8cc' },
  summaryIcon:     { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  summaryTitle:    { fontSize: 15, fontWeight: '700', color: '#0f1923', marginBottom: 2 },
  summarySub:      { fontSize: 12, color: '#7a7066' },
  recordCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#ddd8cc' },
  recordTitle:     { fontSize: 14, fontWeight: '700', color: '#0f1923', marginBottom: 2 },
  recordSub:       { fontSize: 12, color: '#7a7066' },
  recordNote:      { fontSize: 12, color: '#3a3530', marginTop: 4, lineHeight: 18 },
  statusDot:       { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  statusBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:      { fontSize: 11, fontWeight: '700' },
  gradeBox:        { alignItems: 'center', backgroundColor: '#f0ebe0', borderRadius: 10, padding: 10, minWidth: 50 },
  gradeScore:      { fontSize: 18, fontWeight: '800', color: '#0f1923' },
  gradeLabel:      { fontSize: 11, color: '#7a7066', marginTop: 2 },
  ratingBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  ratingText:      { fontSize: 11, fontWeight: '700', color: '#0f1923' },
  announceCard:    { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#ddd8cc' },
  announceText:    { fontSize: 14, color: '#0f1923', lineHeight: 20, marginBottom: 6 },
  announceDate:    { fontSize: 11, color: '#7a7066' },
  alertCard:       { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#ddd8cc', borderLeftWidth: 4 },
  alertTitle:      { fontSize: 14, fontWeight: '700', color: '#0f1923', marginBottom: 4 },
  alertDesc:       { fontSize: 13, color: '#3a3530', lineHeight: 18, marginBottom: 6 },
  emptyCard:       { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#ddd8cc' },
  emptyText:       { fontSize: 14, color: '#7a7066', textAlign: 'center' },
});
