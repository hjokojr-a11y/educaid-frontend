import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions
} from 'react-native';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";
const { width } = Dimensions.get('window');

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  white:    '#FFFFFF',
  offWhite: '#F8F9FA',
  canvas:   '#F4F6F4',
  green:    '#1A5C38',
  greenMid: '#2E7D52',
  greenLight:'#E8F2EC',
  navy:     '#0D2145',
  navyMid:  '#1A3566',
  navyLight:'#E8EDF5',
  grey:     '#6B7280',
  greyLight:'#E5E7EB',
  greyDark: '#374151',
  black:    '#0A0E14',
  border:   '#D1D5DB',
  shadow:   'rgba(13,33,69,0.08)',
};

// ── African-inspired SVG background pattern (as a View overlay) ───────────────
function AfricanPattern() {
  const patterns = [
    // Adinkra-inspired geometric symbols as simple views
    { top: 40,  left: 20,  size: 48, opacity: 0.04, type: 'diamond' },
    { top: 140, left: width - 60, size: 36, opacity: 0.035, type: 'cross' },
    { top: 280, left: 40,  size: 44, opacity: 0.04, type: 'circle' },
    { top: 400, left: width - 80, size: 52, opacity: 0.03, type: 'diamond' },
    { top: 520, left: 60,  size: 40, opacity: 0.04, type: 'cross' },
    { top: 650, left: width - 50, size: 38, opacity: 0.035, type: 'circle' },
    { top: 780, left: 30,  size: 46, opacity: 0.03, type: 'diamond' },
    { top: 900, left: width - 70, size: 42, opacity: 0.04, type: 'cross' },
  ];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {patterns.map((p, i) => (
        <View key={i} style={{
          position: 'absolute', top: p.top, left: p.left,
          width: p.size, height: p.size, opacity: p.opacity,
        }}>
          {p.type === 'diamond' && (
            <View style={{
              width: p.size, height: p.size,
              borderWidth: 2, borderColor: C.navy,
              transform: [{ rotate: '45deg' }],
            }} />
          )}
          {p.type === 'cross' && (
            <>
              <View style={{ position: 'absolute', top: p.size/2 - 1, left: 0, width: p.size, height: 2, backgroundColor: C.navy }} />
              <View style={{ position: 'absolute', left: p.size/2 - 1, top: 0, width: 2, height: p.size, backgroundColor: C.navy }} />
              <View style={{ position: 'absolute', top: p.size/2 - 1, left: 0, width: p.size, height: 2, backgroundColor: C.navy, transform: [{ rotate: '45deg' }] }} />
              <View style={{ position: 'absolute', left: p.size/2 - 1, top: 0, width: 2, height: p.size, backgroundColor: C.navy, transform: [{ rotate: '45deg' }] }} />
            </>
          )}
          {p.type === 'circle' && (
            <>
              <View style={{ width: p.size, height: p.size, borderRadius: p.size/2, borderWidth: 2, borderColor: C.navy }} />
              <View style={{ position: 'absolute', top: p.size/4, left: p.size/4, width: p.size/2, height: p.size/2, borderRadius: p.size/4, borderWidth: 1.5, borderColor: C.navy }} />
            </>
          )}
        </View>
      ))}
    </View>
  );
}

function FadeIn({ children, delay = 0 }: any) {
  const opacity = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(16))[0];
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const [step, setStep] = useState('home');
  const [schools, setSchools] = useState<any[]>([]);
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
    return (
      <View style={[H.fill, { backgroundColor: C.canvas }]}>
        <AfricanPattern />
        <View style={H.successCard}>
          <View style={H.successAvatar}>
            <Text style={H.successAvatarTxt}>
              {u.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={H.successName}>{u.name}</Text>
          <Text style={H.successSchool}>{u.school?.name}</Text>
          <View style={H.successChip}>
            <Text style={H.successChipTxt}>
              {u.role === 'student' ? '🎓 Student' : u.role === 'head_admin' ? '🏫 School Admin' : '👑 Super Admin'}
            </Text>
          </View>
          {u.role === 'student' && (
            <View style={H.infoRow}>
              <View style={H.infoCell}>
                <Text style={H.infoCellLabel}>CLASS</Text>
                <Text style={H.infoCellVal}>{u.class?.name || '—'}</Text>
              </View>
              <View style={[H.infoCell, { borderLeftWidth: 1, borderLeftColor: C.border }]}>
                <Text style={H.infoCellLabel}>STUDENT ID</Text>
                <Text style={H.infoCellVal}>{u.studentCode}</Text>
              </View>
            </View>
          )}
        </View>
        <TouchableOpacity style={H.signOutBtn} onPress={logout}>
          <Text style={H.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  if (step === 'login' && selectedSchool) {
    return (
      <View style={[H.fill, { backgroundColor: C.canvas }]}>
        <AfricanPattern />
        <ScrollView contentContainerStyle={H.loginScroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setStep('schools')} style={H.back}>
            <Text style={H.backTxt}>← Back</Text>
          </TouchableOpacity>

          <FadeIn>
            <View style={[H.schoolBadge, { borderLeftColor: selectedSchool.theme_primary || C.green }]}>
              <Text style={H.schoolBadgeName}>{selectedSchool.name}</Text>
              <Text style={H.schoolBadgeCat}>{selectedSchool.category} · {selectedSchool.subsystem?.toUpperCase()}</Text>
            </View>
          </FadeIn>

          <FadeIn delay={80}>
            <View style={H.toggleRow}>
              {[
                { id: 'student', label: '🎓 Student / Parent' },
                { id: 'staff',   label: '🏫 Staff' },
              ].map(t => (
                <TouchableOpacity key={t.id}
                  style={[H.toggleBtn, loginType === t.id && H.toggleBtnActive]}
                  onPress={() => setLoginType(t.id)}>
                  <Text style={[H.toggleTxt, loginType === t.id && H.toggleTxtActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FadeIn>

          <FadeIn delay={140}>
            <Text style={H.label}>{loginType === 'student' ? 'STUDENT ID' : 'EMAIL ADDRESS'}</Text>
            <View style={H.inputWrap}>
              <TextInput style={H.input}
                placeholder={loginType === 'student' ? 'e.g. LYC-0002' : 'admin@school.educaid.io'}
                placeholderTextColor={C.grey} value={username}
                onChangeText={setUsername} autoCapitalize="none" />
            </View>
          </FadeIn>

          <FadeIn delay={200}>
            <Text style={H.label}>PASSWORD</Text>
            <View style={H.inputWrap}>
              <TextInput style={[H.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={C.grey} value={password}
                onChangeText={setPassword} secureTextEntry={!showPw} />
              <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ paddingHorizontal: 4 }}>
                <Text style={{ color: C.grey, fontSize: 13 }}>{showPw ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </FadeIn>

          <FadeIn delay={260}>
            <TouchableOpacity style={H.primaryBtn} onPress={doLogin} disabled={loading}>
              {loading
                ? <ActivityIndicator color={C.white} />
                : <Text style={H.primaryBtnTxt}>Sign In →</Text>}
            </TouchableOpacity>
          </FadeIn>
        </ScrollView>
      </View>
    );
  }

  // ── School picker ────────────────────────────────────────────────────────────
  if (step === 'schools') {
    return (
      <View style={[H.fill, { backgroundColor: C.canvas }]}>
        <AfricanPattern />
        <ScrollView contentContainerStyle={H.listScroll}>
          <TouchableOpacity onPress={() => setStep('home')} style={H.back}>
            <Text style={H.backTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={H.pageH1}>Select Your School</Text>
          <Text style={H.pageH2}>Choose your institution to continue</Text>
          {loadingSchools
            ? <ActivityIndicator color={C.green} size="large" style={{ marginTop: 40 }} />
            : schools.length === 0
              ? <View style={H.emptyBox}><Text style={H.emptyTxt}>No schools registered yet.</Text></View>
              : schools.map((sc: any, i) => (
                  <FadeIn key={sc.id} delay={i * 60}>
                    <TouchableOpacity style={H.schoolRow}
                      onPress={() => { setSelectedSchool(sc); setStep('login'); }}>
                      <View style={[H.schoolDot, { backgroundColor: sc.theme_primary || C.green }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={H.schoolName}>{sc.name}</Text>
                        <Text style={H.schoolSub}>{sc.category} · {sc.subsystem?.toUpperCase()}</Text>
                      </View>
                      <Text style={{ color: C.grey, fontSize: 22 }}>›</Text>
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
    { icon: '🎓', title: 'Student Portal',  sub: 'Grades, attendance & reports',  accent: C.green,  onPress: () => router.push('/studentdashboard') },
    { icon: '🏫', title: 'School Login',    sub: 'Students & parents',             accent: C.navy,   onPress: () => { setStep('schools'); loadSchools(); } },
    { icon: '👨‍🏫', title: 'School Admin',  sub: 'Manage attendance & grades',     accent: C.green,  onPress: () => router.push('/schooladmin') },
    { icon: '👑', title: 'Super Admin',     sub: 'Platform management',            accent: C.navy,   onPress: () => router.push('/superadmin') },
  ];

  return (
    <View style={[H.fill, { backgroundColor: C.canvas }]}>
      <AfricanPattern />
      <ScrollView contentContainerStyle={H.homeScroll}>

        <FadeIn>
          <View style={H.heroArea}>
            <View style={H.heroBadge}>
              <Text style={H.heroBadgeTxt}>EA</Text>
            </View>
            <Text style={H.heroTitle}>EducAid</Text>
            <Text style={H.heroSub}>Excellence in School Management</Text>
            <View style={H.heroDivider} />
          </View>
        </FadeIn>

        <FadeIn delay={100}>
          <Text style={H.sectionLabel}>ACCESS PORTAL</Text>
        </FadeIn>

        {portals.map((p, i) => (
          <FadeIn key={p.title} delay={160 + i * 80}>
            <TouchableOpacity style={H.portalCard} onPress={p.onPress} activeOpacity={0.75}>
              <View style={[H.portalIconBox, { backgroundColor: p.accent + '12' }]}>
                <Text style={{ fontSize: 26 }}>{p.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={H.portalTitle}>{p.title}</Text>
                <Text style={H.portalSub}>{p.sub}</Text>
              </View>
              <View style={[H.portalChevron, { backgroundColor: p.accent + '12' }]}>
                <Text style={[H.portalChevronTxt, { color: p.accent }]}>›</Text>
              </View>
            </TouchableOpacity>
          </FadeIn>
        ))}

        <FadeIn delay={600}>
          <View style={H.footerArea}>
            <View style={H.footerLine} />
            <Text style={H.footerTxt}>EducAid · School Management Platform</Text>
            <Text style={H.footerVersion}>Version 1.0</Text>
          </View>
        </FadeIn>

      </ScrollView>
    </View>
  );
}

const H = StyleSheet.create({
  fill:            { flex: 1 },
  // Home
  homeScroll:      { padding: 28, paddingTop: 80, paddingBottom: 48 },
  heroArea:        { alignItems: 'center', marginBottom: 44 },
  heroBadge:       { width: 72, height: 72, borderRadius: 22, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: C.navy, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  heroBadgeTxt:    { fontSize: 26, fontWeight: '900', color: C.white, letterSpacing: 1 },
  heroTitle:       { fontSize: 36, fontWeight: '900', color: C.navy, letterSpacing: -0.5, marginBottom: 6 },
  heroSub:         { fontSize: 13, color: C.grey, letterSpacing: 0.4, marginBottom: 20 },
  heroDivider:     { width: 40, height: 3, backgroundColor: C.green, borderRadius: 2 },
  sectionLabel:    { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.5, marginBottom: 14 },
  portalCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: C.border, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  portalIconBox:   { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  portalTitle:     { fontSize: 16, fontWeight: '700', color: C.navy, marginBottom: 3 },
  portalSub:       { fontSize: 12, color: C.grey },
  portalChevron:   { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  portalChevronTxt:{ fontSize: 22, fontWeight: '700' },
  footerArea:      { alignItems: 'center', marginTop: 28 },
  footerLine:      { width: 32, height: 2, backgroundColor: C.greyLight, borderRadius: 1, marginBottom: 12 },
  footerTxt:       { fontSize: 11, color: C.grey, letterSpacing: 0.3, marginBottom: 3 },
  footerVersion:   { fontSize: 10, color: C.greyLight },
  // Schools
  listScroll:      { padding: 28, paddingTop: 64 },
  pageH1:          { fontSize: 28, fontWeight: '800', color: C.navy, marginBottom: 4 },
  pageH2:          { fontSize: 13, color: C.grey, marginBottom: 28 },
  schoolRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1 },
  schoolDot:       { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  schoolName:      { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  schoolSub:       { fontSize: 12, color: C.grey },
  emptyBox:        { alignItems: 'center', padding: 48 },
  emptyTxt:        { color: C.grey, fontSize: 14 },
  // Login
  loginScroll:     { padding: 28, paddingTop: 64, paddingBottom: 48 },
  schoolBadge:     { backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 28, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  schoolBadgeName: { fontSize: 16, fontWeight: '700', color: C.navy, marginBottom: 3 },
  schoolBadgeCat:  { fontSize: 12, color: C.grey },
  toggleRow:       { flexDirection: 'row', gap: 10, marginBottom: 28 },
  toggleBtn:       { flex: 1, padding: 12, borderRadius: 10, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: C.navy, borderColor: C.navy },
  toggleTxt:       { fontSize: 13, color: C.grey, fontWeight: '600' },
  toggleTxtActive: { color: C.white },
  label:           { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 8 },
  inputWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 },
  input:           { color: C.black, fontSize: 15 },
  primaryBtn:      { backgroundColor: C.navy, borderRadius: 14, padding: 17, alignItems: 'center', shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  primaryBtnTxt:   { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  back:            { marginBottom: 24 },
  backTxt:         { color: C.grey, fontSize: 14 },
  // Logged in
  successCard:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successAvatar:   { width: 80, height: 80, borderRadius: 24, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: C.navy, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 6 },
  successAvatarTxt:{ fontSize: 26, fontWeight: '900', color: C.white },
  successName:     { fontSize: 24, fontWeight: '800', color: C.navy, marginBottom: 4 },
  successSchool:   { fontSize: 14, color: C.grey, marginBottom: 16 },
  successChip:     { backgroundColor: C.greenLight, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7, marginBottom: 24 },
  successChipTxt:  { fontSize: 13, fontWeight: '600', color: C.green },
  infoRow:         { flexDirection: 'row', backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden', width: '100%' },
  infoCell:        { flex: 1, padding: 16, alignItems: 'center' },
  infoCellLabel:   { fontSize: 9, fontWeight: '700', color: C.grey, letterSpacing: 1, marginBottom: 6 },
  infoCellVal:     { fontSize: 15, fontWeight: '700', color: C.navy },
  signOutBtn:      { margin: 28, backgroundColor: C.white, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  signOutTxt:      { color: C.grey, fontSize: 14, fontWeight: '600' },
});
