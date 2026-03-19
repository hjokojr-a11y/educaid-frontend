import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions
} from 'react-native';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";
const { width } = Dimensions.get('window');

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       '#0A0F1E',
  surface:  '#111827',
  card:     '#1A2235',
  border:   '#1F2D45',
  primary:  '#00C896',
  blue:     '#3B82F6',
  purple:   '#8B5CF6',
  red:      '#EF4444',
  amber:    '#F59E0B',
  text:     '#F1F5F9',
  muted:    '#64748B',
  subtle:   '#334155',
};

function FadeIn({ children, delay = 0 }: any) {
  const opacity = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(18))[0];
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const [step, setStep] = useState('home');
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [loginType, setLoginType] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showPw, setShowPw] = useState(false);

  async function loadSchools() {
    setLoadingSchools(true);
    try {
      const r1 = await fetch(`${API_URL}/auth/super/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'hjokojr@gmail.com', password: 'EducAid2024!' }),
      });
      const auth = await r1.json();
      const r2 = await fetch(`${API_URL}/auth/super/schools`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const d = await r2.json();
      setSchools(d.schools || []);
    } catch { Alert.alert('Error', 'Cannot connect to server.'); }
    setLoadingSchools(false);
  }

  async function doLogin() {
    if (!username || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    try {
      const isStudent = loginType === 'student';
      const url = isStudent ? `${API_URL}/auth/student/login` : `${API_URL}/auth/admin/login`;
      const body = isStudent
        ? { studentCode: username, password, schoolId: selectedSchool?.id }
        : { email: username, password };
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert('Login Failed', data.error || 'Invalid credentials'); setLoading(false); return; }
      setSession({ token: data.token, user: data.user });
    } catch { Alert.alert('Error', 'Cannot connect to server.'); }
    setLoading(false);
  }

  function logout() {
    setSession(null); setSelectedSchool(null);
    setUsername(''); setPassword(''); setStep('home');
  }

  // ── Logged in ────────────────────────────────────────────────────────────────
  if (session) {
    const u = session.user;
    const accent = u.school?.theme?.primary || C.primary;
    return (
      <View style={[S.fill, { backgroundColor: C.bg }]}>
        <View style={[S.successHeader, { borderBottomColor: accent + '33' }]}>
          <View style={[S.bigAvatar, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
            <Text style={[S.bigAvatarTxt, { color: accent }]}>
              {u.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={S.successName}>{u.name}</Text>
          <Text style={S.successSchool}>{u.school?.name}</Text>
          <View style={[S.chip, { backgroundColor: accent + '22', borderColor: accent + '44' }]}>
            <Text style={[S.chipTxt, { color: accent }]}>
              {u.role === 'student' ? '🎓 Student' : u.role === 'head_admin' ? '🏫 School Admin' : '👑 Super Admin'}
            </Text>
          </View>
          {u.role === 'student' && (
            <View style={S.infoRow}>
              <View style={S.infoItem}>
                <Text style={S.infoLabel}>CLASS</Text>
                <Text style={S.infoVal}>{u.class?.name || '—'}</Text>
              </View>
              <View style={[S.infoItem, { borderLeftWidth: 1, borderLeftColor: C.border }]}>
                <Text style={S.infoLabel}>STUDENT ID</Text>
                <Text style={S.infoVal}>{u.studentCode}</Text>
              </View>
            </View>
          )}
        </View>
        <TouchableOpacity style={S.signOutBtn} onPress={logout}>
          <Text style={S.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  if (step === 'login' && selectedSchool) {
    const accent = selectedSchool.theme_primary || C.primary;
    return (
      <View style={[S.fill, { backgroundColor: C.bg }]}>
        <ScrollView contentContainerStyle={S.loginScroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setStep('schools')} style={S.back}>
            <Text style={S.backTxt}>← Back</Text>
          </TouchableOpacity>

          <FadeIn>
            <View style={[S.schoolPill, { backgroundColor: accent + '18', borderColor: accent + '44' }]}>
              <View style={[S.schoolPillDot, { backgroundColor: accent }]} />
              <View style={{ flex: 1 }}>
                <Text style={[S.schoolPillName, { color: accent }]}>{selectedSchool.name}</Text>
                <Text style={S.schoolPillCat}>{selectedSchool.category}</Text>
              </View>
            </View>
          </FadeIn>

          <FadeIn delay={80}>
            <View style={S.toggleRow}>
              {[
                { id: 'student', label: '🎓 Student' },
                { id: 'staff',   label: '🏫 Staff' },
              ].map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[S.toggleBtn, loginType === t.id && { backgroundColor: accent, borderColor: accent }]}
                  onPress={() => setLoginType(t.id)}>
                  <Text style={[S.toggleTxt, loginType === t.id && { color: '#fff' }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FadeIn>

          <FadeIn delay={140}>
            <Text style={S.fieldLabel}>{loginType === 'student' ? 'STUDENT ID' : 'EMAIL'}</Text>
            <View style={S.inputBox}>
              <TextInput
                style={S.inputTxt}
                placeholder={loginType === 'student' ? 'e.g. LYC-0002' : 'admin@school.educaid.io'}
                placeholderTextColor={C.muted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </FadeIn>

          <FadeIn delay={200}>
            <Text style={S.fieldLabel}>PASSWORD</Text>
            <View style={S.inputBox}>
              <TextInput
                style={[S.inputTxt, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={C.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                <Text style={{ color: C.muted, fontSize: 13 }}>{showPw ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </FadeIn>

          <FadeIn delay={260}>
            <TouchableOpacity
              style={[S.primaryBtn, { backgroundColor: accent }]}
              onPress={doLogin}
              disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={S.primaryBtnTxt}>Sign In →</Text>}
            </TouchableOpacity>
          </FadeIn>
        </ScrollView>
      </View>
    );
  }

  // ── School picker ────────────────────────────────────────────────────────────
  if (step === 'schools') {
    return (
      <View style={[S.fill, { backgroundColor: C.bg }]}>
        <ScrollView contentContainerStyle={S.listScroll}>
          <TouchableOpacity onPress={() => setStep('home')} style={S.back}>
            <Text style={S.backTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={S.pageH1}>Select School</Text>
          <Text style={S.pageH2}>Choose your school to continue</Text>
          {loadingSchools
            ? <ActivityIndicator color={C.primary} size="large" style={{ marginTop: 40 }} />
            : schools.length === 0
              ? <View style={S.emptyBox}><Text style={S.emptyTxt}>No schools registered yet.</Text></View>
              : schools.map((sc: any, i) => (
                  <FadeIn key={sc.id} delay={i * 60}>
                    <TouchableOpacity
                      style={S.schoolRow}
                      onPress={() => { setSelectedSchool(sc); setStep('login'); }}>
                      <View style={[S.schoolRowDot, { backgroundColor: sc.theme_primary || C.primary }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={S.schoolRowName}>{sc.name}</Text>
                        <Text style={S.schoolRowSub}>{sc.category} · {sc.subsystem?.toUpperCase()}</Text>
                      </View>
                      <Text style={{ color: C.muted, fontSize: 20 }}>›</Text>
                    </TouchableOpacity>
                  </FadeIn>
                ))
          }
        </ScrollView>
      </View>
    );
  }

  // ── Home ─────────────────────────────────────────────────────────────────────
  const portals = [
    { icon: '🎓', title: 'Student Portal',  sub: 'Grades, attendance & reports',  color: C.primary,  onPress: () => router.push('/studentdashboard') },
    { icon: '🏫', title: 'School Login',    sub: 'Students & parents',             color: C.blue,     onPress: () => { setStep('schools'); loadSchools(); } },
    { icon: '👨‍🏫', title: 'School Admin',   sub: 'Manage your school',             color: C.purple,   onPress: () => router.push('/schooladmin') },
    { icon: '👑', title: 'Super Admin',     sub: 'Platform management',            color: C.red,      onPress: () => router.push('/superadmin') },
  ];

  return (
    <View style={[S.fill, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={S.homeScroll}>
        <FadeIn>
          <View style={S.logoArea}>
            <View style={S.logoBadge}>
              <Text style={S.logoE}>E</Text>
            </View>
            <Text style={S.logoText}>EducAid</Text>
            <Text style={S.logoSub}>School Management Platform</Text>
          </View>
        </FadeIn>

        {portals.map((p, i) => (
          <FadeIn key={p.title} delay={100 + i * 70}>
            <TouchableOpacity style={[S.portalCard, { borderLeftColor: p.color }]} onPress={p.onPress} activeOpacity={0.8}>
              <View style={[S.portalIcon, { backgroundColor: p.color + '18' }]}>
                <Text style={{ fontSize: 26 }}>{p.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.portalTitle}>{p.title}</Text>
                <Text style={S.portalSub}>{p.sub}</Text>
              </View>
              <View style={[S.portalArrow, { backgroundColor: p.color + '18' }]}>
                <Text style={[S.portalArrowTxt, { color: p.color }]}>›</Text>
              </View>
            </TouchableOpacity>
          </FadeIn>
        ))}

        <FadeIn delay={500}>
          <Text style={S.footer}>EducAid v1.0 · Secure School Management</Text>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  fill:           { flex: 1 },
  // Home
  homeScroll:     { padding: 24, paddingTop: 72, paddingBottom: 40 },
  logoArea:       { alignItems: 'center', marginBottom: 48 },
  logoBadge:      { width: 64, height: 64, borderRadius: 20, backgroundColor: C.primary + '22', borderWidth: 1.5, borderColor: C.primary + '55', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoE:          { fontSize: 32, fontWeight: '900', color: C.primary },
  logoText:       { fontSize: 34, fontWeight: '900', color: C.text, letterSpacing: -0.5, marginBottom: 4 },
  logoSub:        { fontSize: 13, color: C.muted, letterSpacing: 0.3 },
  portalCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3 },
  portalIcon:     { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  portalTitle:    { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 3 },
  portalSub:      { fontSize: 12, color: C.muted },
  portalArrow:    { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  portalArrowTxt: { fontSize: 20, fontWeight: '700' },
  footer:         { textAlign: 'center', color: C.subtle, fontSize: 11, marginTop: 24, letterSpacing: 0.3 },
  // School list
  listScroll:     { padding: 24, paddingTop: 60 },
  pageH1:         { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 4 },
  pageH2:         { fontSize: 13, color: C.muted, marginBottom: 28 },
  schoolRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  schoolRowDot:   { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  schoolRowName:  { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  schoolRowSub:   { fontSize: 12, color: C.muted },
  emptyBox:       { alignItems: 'center', padding: 48 },
  emptyTxt:       { color: C.muted, fontSize: 14 },
  // Login
  loginScroll:    { padding: 24, paddingTop: 60, paddingBottom: 40 },
  schoolPill:     { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 28, borderWidth: 1 },
  schoolPillDot:  { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  schoolPillName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  schoolPillCat:  { fontSize: 11, color: C.muted },
  toggleRow:      { flexDirection: 'row', gap: 10, marginBottom: 28 },
  toggleBtn:      { flex: 1, padding: 12, borderRadius: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  toggleTxt:      { fontSize: 13, color: C.muted, fontWeight: '600' },
  fieldLabel:     { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 1.2, marginBottom: 8 },
  inputBox:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 },
  inputTxt:       { color: C.text, fontSize: 15 },
  primaryBtn:     { borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 4 },
  primaryBtnTxt:  { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  // Back
  back:           { marginBottom: 24 },
  backTxt:        { color: C.muted, fontSize: 14 },
  // Logged in
  successHeader:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, borderBottomWidth: 1 },
  bigAvatar:      { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 20 },
  bigAvatarTxt:   { fontSize: 28, fontWeight: '900' },
  successName:    { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 4 },
  successSchool:  { fontSize: 14, color: C.muted, marginBottom: 16 },
  chip:           { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, marginBottom: 24 },
  chipTxt:        { fontSize: 13, fontWeight: '600' },
  infoRow:        { flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden', width: '100%' },
  infoItem:       { flex: 1, padding: 16, alignItems: 'center' },
  infoLabel:      { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 1, marginBottom: 6 },
  infoVal:        { fontSize: 15, fontWeight: '700', color: C.text },
  signOutBtn:     { margin: 24, backgroundColor: C.card, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  signOutTxt:     { color: C.muted, fontSize: 14, fontWeight: '600' },
});
