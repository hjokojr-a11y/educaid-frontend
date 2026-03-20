import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions
} from 'react-native';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";
const { width } = Dimensions.get('window');

const C = {
  white:      '#FFFFFF',
  canvas:     '#F7F8F5',
  green:      '#1B5E3B',
  greenDark:  '#0F3D26',
  greenLight: '#EAF2EC',
  greenMid:   '#2E7D52',
  navy:       '#0C1F4A',
  navyMid:    '#1A3366',
  navyLight:  '#E8EDF8',
  grey:       '#6B7280',
  greyLight:  '#E5E7EB',
  greyMid:    '#9CA3AF',
  greyDark:   '#374151',
  black:      '#0A0C10',
  border:     '#D1D5DB',
  shadow:     'rgba(12,31,74,0.09)',
};

// ── African Adinkra-inspired background using pure React Native Views ─────────
function AfricanBg() {
  const symbols = [
    { top: 60,  left: 16,       size: 48, color: C.navy  },
    { top: 160, left: width-68, size: 38, color: C.green },
    { top: 300, left: 24,       size: 44, color: C.green },
    { top: 430, left: width-62, size: 50, color: C.navy  },
    { top: 570, left: 10,       size: 40, color: C.navy  },
    { top: 700, left: width-58, size: 44, color: C.green },
    { top: 840, left: 20,       size: 48, color: C.navy  },
  ];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {symbols.map((s, i) => {
        const cx = s.left + s.size / 2;
        const cy = s.top  + s.size / 2;
        const r  = s.size / 2;
        return (
          <View key={i} style={{ position: 'absolute', top: s.top, left: s.left, width: s.size, height: s.size }}>
            {/* Outer ring */}
            <View style={{
              position: 'absolute', top: 0, left: 0,
              width: s.size, height: s.size, borderRadius: r,
              borderWidth: 1.8, borderColor: s.color, opacity: 0.07,
            }} />
            {/* Inner ring */}
            <View style={{
              position: 'absolute',
              top: s.size * 0.25, left: s.size * 0.25,
              width: s.size * 0.5, height: s.size * 0.5,
              borderRadius: r * 0.5,
              borderWidth: 1.2, borderColor: s.color, opacity: 0.07,
            }} />
            {/* Centre dot */}
            <View style={{
              position: 'absolute',
              top: r - r * 0.14, left: r - r * 0.14,
              width: r * 0.28, height: r * 0.28,
              borderRadius: r * 0.14,
              backgroundColor: s.color, opacity: 0.07,
            }} />
            {/* Horizontal line */}
            <View style={{
              position: 'absolute',
              top: r - 1, left: 0,
              width: s.size, height: 1.5,
              backgroundColor: s.color, opacity: 0.06,
            }} />
            {/* Vertical line */}
            <View style={{
              position: 'absolute',
              top: 0, left: r - 1,
              width: 1.5, height: s.size,
              backgroundColor: s.color, opacity: 0.06,
            }} />
          </View>
        );
      })}
    </View>
  );
}

function FadeIn({ children, delay = 0 }: any) {
  const opacity   = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(20))[0];
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 650, delay, useNativeDriver: false }),
      Animated.timing(translateY, { toValue: 0, duration: 650, delay, useNativeDriver: false }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function BackBtn({ onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={S.backBtn} activeOpacity={0.7}>
      <Text style={S.backBtnTxt}>← Back</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [step, setStep]                   = useState('home');
  const [schools, setSchools]             = useState<any[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [loginType, setLoginType]         = useState<'student'|'staff'>('student');
  const [username, setUsername]           = useState('');
  const [password, setPassword]           = useState('');
  const [loading, setLoading]             = useState(false);
  const [session, setSession]             = useState<any>(null);
  const [showPw, setShowPw]               = useState(false);

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
      const url  = isStudent ? `${API_URL}/auth/student/login` : `${API_URL}/auth/admin/login`;
      const body = isStudent
        ? { studentCode: username, password, schoolId: selectedSchool?.id }
        : { email: username, password };
      const res  = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert('Login Failed', data.error || 'Invalid credentials'); setLoading(false); return; }
      setSession({ token: data.token, user: data.user });
    } catch { Alert.alert('Error', 'Cannot connect to server.'); }
    setLoading(false);
  }

  function goHome() {
    setSession(null); setSelectedSchool(null);
    setUsername(''); setPassword(''); setStep('home'); setLoginType('student');
  }

  // ── Logged in ────────────────────────────────────────────────────────────────
  if (session) {
    const u = session.user;
    return (
      <View style={[S.fill, { backgroundColor: C.canvas }]}>
        <AfricanBg />
        <ScrollView contentContainerStyle={S.pad}>
          <BackBtn onPress={goHome} />
          <View style={S.successCard}>
            <View style={S.successTop}>
              <View style={S.successAvatar}>
                <Text style={S.successAvatarTxt}>
                  {u.name?.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()}
                </Text>
              </View>
              <Text style={S.successName}>{u.name}</Text>
              <Text style={S.successSchool}>{u.school?.name}</Text>
              <View style={[S.chip, u.role==='student' ? S.chipGreen : S.chipNavy]}>
                <Text style={[S.chipTxt, u.role==='student' ? S.chipTxtGreen : S.chipTxtNavy]}>
                  {u.role==='student' ? 'Student' : u.role==='head_admin' ? 'School Admin' : 'Super Admin'}
                </Text>
              </View>
            </View>
            {u.role === 'student' && (
              <View style={S.infoRow}>
                <View style={S.infoCell}>
                  <Text style={S.infoCellLbl}>CLASS</Text>
                  <Text style={S.infoCellVal}>{u.class?.name || '—'}</Text>
                </View>
                <View style={[S.infoCell, { borderLeftWidth:1, borderLeftColor:C.border }]}>
                  <Text style={S.infoCellLbl}>STUDENT ID</Text>
                  <Text style={S.infoCellVal}>{u.studentCode}</Text>
                </View>
              </View>
            )}
          </View>
          <TouchableOpacity style={S.signOutBtn} onPress={goHome}>
            <Text style={S.signOutTxt}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Login form ───────────────────────────────────────────────────────────────
  if (step === 'login' && selectedSchool) {
    return (
      <View style={[S.fill, { backgroundColor: C.canvas }]}>
        <AfricanBg />
        <ScrollView contentContainerStyle={S.pad} keyboardShouldPersistTaps="handled">
          <BackBtn onPress={() => setStep('chooseRole')} />
          <View style={[S.schoolBadge, { borderLeftColor: selectedSchool.theme_primary || C.green }]}>
            <Text style={S.schoolBadgeName}>{selectedSchool.name}</Text>
            <Text style={S.schoolBadgeCat}>{selectedSchool.category}</Text>
          </View>
          <View style={[S.roleTag, loginType==='student' ? { backgroundColor: C.greenLight } : { backgroundColor: C.navyLight }]}>
            <Text style={[S.roleTagTxt, loginType==='student' ? { color: C.green } : { color: C.navy }]}>
              {loginType==='student' ? '🎓 Student / Parent Login' : '🏫 School Admin Login'}
            </Text>
          </View>
          <Text style={S.label}>{loginType==='student' ? 'STUDENT ID' : 'EMAIL ADDRESS'}</Text>
          <View style={S.inputWrap}>
            <TextInput style={S.input}
              placeholder={loginType==='student' ? 'e.g. LYC-0002' : 'admin@school.educaid.io'}
              placeholderTextColor={C.greyMid} value={username}
              onChangeText={setUsername} autoCapitalize="none" />
          </View>
          <Text style={S.label}>PASSWORD</Text>
          <View style={S.inputWrap}>
            <TextInput style={[S.input, { flex:1 }]} placeholder="Enter your password"
              placeholderTextColor={C.greyMid} value={password}
              onChangeText={setPassword} secureTextEntry={!showPw} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={{ color:C.grey, fontSize:13 }}>{showPw ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[S.primaryBtn, { backgroundColor: loginType==='student' ? C.green : C.navy }]}
            onPress={doLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={S.primaryBtnTxt}>Sign In →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Choose role ──────────────────────────────────────────────────────────────
  if (step === 'chooseRole' && selectedSchool) {
    return (
      <View style={[S.fill, { backgroundColor: C.canvas }]}>
        <AfricanBg />
        <ScrollView contentContainerStyle={S.pad}>
          <BackBtn onPress={() => setStep('selectSchool')} />
          <View style={[S.schoolBadge, { borderLeftColor: selectedSchool.theme_primary || C.green }]}>
            <Text style={S.schoolBadgeName}>{selectedSchool.name}</Text>
            <Text style={S.schoolBadgeCat}>{selectedSchool.category}</Text>
          </View>
          <Text style={S.chooseH1}>Who are you?</Text>
          <Text style={S.chooseH2}>Select your role to continue</Text>
          <TouchableOpacity style={S.roleCard}
            onPress={() => { setLoginType('student'); setStep('login'); }}>
            <View style={[S.roleCardIcon, { backgroundColor: C.greenLight }]}>
              <Text style={{ fontSize:28 }}>🎓</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={S.roleCardTitle}>Student / Parent</Text>
              <Text style={S.roleCardSub}>View grades, attendance & reports</Text>
            </View>
            <Text style={{ color:C.greyMid, fontSize:22 }}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.roleCard}
            onPress={() => { setLoginType('staff'); setStep('login'); }}>
            <View style={[S.roleCardIcon, { backgroundColor: C.navyLight }]}>
              <Text style={{ fontSize:28 }}>🏫</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={S.roleCardTitle}>School Admin / Staff</Text>
              <Text style={S.roleCardSub}>Manage attendance, grades & more</Text>
            </View>
            <Text style={{ color:C.greyMid, fontSize:22 }}>›</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Select school ────────────────────────────────────────────────────────────
  if (step === 'selectSchool') {
    return (
      <View style={[S.fill, { backgroundColor: C.canvas }]}>
        <AfricanBg />
        <ScrollView contentContainerStyle={S.pad}>
          <BackBtn onPress={() => setStep('home')} />
          <Text style={S.pageH1}>Select School</Text>
          <Text style={S.pageH2}>Choose your institution to continue</Text>
          {loadingSchools
            ? <ActivityIndicator color={C.green} size="large" style={{ marginTop:40 }} />
            : schools.length === 0
              ? <View style={{ alignItems:'center', padding:48 }}><Text style={{ color:C.grey }}>No schools registered yet.</Text></View>
              : schools.map((sc:any, i) => (
                  <FadeIn key={sc.id} delay={i * 60}>
                    <TouchableOpacity style={S.schoolRow}
                      onPress={() => { setSelectedSchool(sc); setStep('chooseRole'); }}>
                      <View style={[S.schoolDot, { backgroundColor: sc.theme_primary || C.green }]} />
                      <View style={{ flex:1 }}>
                        <Text style={S.schoolName}>{sc.name}</Text>
                        <Text style={S.schoolSub}>{sc.category} · {sc.subsystem?.toUpperCase()}</Text>
                      </View>
                      <Text style={{ color:C.greyMid, fontSize:22 }}>›</Text>
                    </TouchableOpacity>
                  </FadeIn>
                ))
          }
        </ScrollView>
      </View>
    );
  }

  // ── Home ─────────────────────────────────────────────────────────────────────
  return (
    <View style={[S.fill, { backgroundColor: C.canvas }]}>
      <AfricanBg />
      <ScrollView contentContainerStyle={[S.pad, { paddingTop: 80 }]}>

        {/* Hero */}
        <FadeIn>
          <View style={S.hero}>
            <View style={S.heroBadge}>
              <Text style={S.heroBadgeTxt}>EA</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={S.heroTitle}>EducAid</Text>
              <Text style={S.heroSub}>Excellence in Education Management</Text>
            </View>
          </View>
          <View style={S.heroDivRow}>
            <View style={[S.heroDivLine, { backgroundColor: C.green, flex:1 }]} />
            <View style={[S.heroDivLine, { backgroundColor: C.navy,  flex:2 }]} />
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <Text style={S.sectionLbl}>ACCESS PORTAL</Text>
        </FadeIn>

        {/* School Login — large featured card */}
        <FadeIn delay={200}>
          <TouchableOpacity
            style={S.mainCard}
            onPress={() => { setStep('selectSchool'); loadSchools(); }}
            activeOpacity={0.75}>
            <View style={S.mainCardHeader}>
              <View style={S.mainCardIconBox}>
                <Text style={{ fontSize:28 }}>🏫</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={S.mainCardTitle}>School Login</Text>
                <Text style={S.mainCardSub}>Students · Parents · School Staff</Text>
              </View>
              <View style={S.mainCardArrow}>
                <Text style={S.mainCardArrowTxt}>→</Text>
              </View>
            </View>
            <View style={S.mainCardBadges}>
              <View style={[S.badge, { backgroundColor: C.greenLight, borderColor: C.green+'33' }]}>
                <Text style={[S.badgeTxt, { color: C.green }]}>🎓 Students & Parents</Text>
              </View>
              <View style={[S.badge, { backgroundColor: C.navyLight, borderColor: C.navy+'33' }]}>
                <Text style={[S.badgeTxt, { color: C.navy }]}>🏫 School Admins</Text>
              </View>
            </View>
          </TouchableOpacity>
        </FadeIn>

        {/* Super Admin — slim card */}
        <FadeIn delay={320}>
          <TouchableOpacity
            style={S.slimCard}
            onPress={() => router.push('/superadmin')}
            activeOpacity={0.75}>
            <View style={[S.slimCardIcon, { backgroundColor: C.greenLight }]}>
              <Text style={{ fontSize:22 }}>👑</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={S.slimCardTitle}>Super Admin</Text>
              <Text style={S.slimCardSub}>Platform management · Register schools</Text>
            </View>
            <Text style={{ color:C.greyMid, fontSize:22 }}>›</Text>
          </TouchableOpacity>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={460}>
          <View style={{ alignItems:'center', marginTop:32 }}>
            <View style={{ width:40, height:2, backgroundColor:C.greyLight, borderRadius:1, marginBottom:10 }} />
            <Text style={{ fontSize:11, color:C.greyMid, letterSpacing:0.3 }}>EducAid · Secure School Management</Text>
          </View>
        </FadeIn>

      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  fill:           { flex: 1 },
  pad:            { padding: 24, paddingTop: 60, paddingBottom: 48 },
  // Back button
  backBtn:        { alignSelf: 'flex-start', backgroundColor: C.white, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
  backBtnTxt:     { color: C.greyDark, fontSize: 13, fontWeight: '600' },
  // Hero
  hero:           { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  heroBadge:      { width: 62, height: 62, borderRadius: 18, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 6 },
  heroBadgeTxt:   { fontSize: 20, fontWeight: '900', color: C.white, letterSpacing: 1.5 },
  heroTitle:      { fontSize: 34, fontWeight: '900', color: C.navy, letterSpacing: -0.5 },
  heroSub:        { fontSize: 12, color: C.grey, marginTop: 3, letterSpacing: 0.3 },
  heroDivRow:     { flexDirection: 'row', gap: 4, marginBottom: 36 },
  heroDivLine:    { height: 3, borderRadius: 2 },
  sectionLbl:     { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.5, marginBottom: 14 },
  // Main card
  mainCard:       { backgroundColor: C.navyLight, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.navy+'22', marginBottom: 12 },
  mainCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  mainCardIconBox:{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  mainCardTitle:  { fontSize: 20, fontWeight: '800', color: C.navy, marginBottom: 3 },
  mainCardSub:    { fontSize: 12, color: C.navyMid },
  mainCardArrow:  { width: 36, height: 36, borderRadius: 12, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  mainCardArrowTxt:{ color: C.white, fontSize: 18, fontWeight: '700' },
  mainCardBadges: { flexDirection: 'row', gap: 8 },
  badge:          { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  badgeTxt:       { fontSize: 12, fontWeight: '600' },
  // Slim card
  slimCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: C.green, gap: 14, marginBottom: 12, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1 },
  slimCardIcon:   { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  slimCardTitle:  { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  slimCardSub:    { fontSize: 12, color: C.grey },
  // School list
  pageH1:         { fontSize: 28, fontWeight: '800', color: C.navy, marginBottom: 4 },
  pageH2:         { fontSize: 13, color: C.grey, marginBottom: 28 },
  schoolRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1 },
  schoolDot:      { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  schoolName:     { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  schoolSub:      { fontSize: 12, color: C.grey },
  // Choose role
  chooseH1:       { fontSize: 22, fontWeight: '800', color: C.navy, marginBottom: 6 },
  chooseH2:       { fontSize: 13, color: C.grey, marginBottom: 24 },
  roleCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: C.border, gap: 14, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  roleCardIcon:   { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  roleCardTitle:  { fontSize: 16, fontWeight: '700', color: C.navy, marginBottom: 4 },
  roleCardSub:    { fontSize: 12, color: C.grey },
  // School badge
  schoolBadge:    { backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 22, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  schoolBadgeName:{ fontSize: 16, fontWeight: '700', color: C.navy, marginBottom: 3 },
  schoolBadgeCat: { fontSize: 12, color: C.grey },
  roleTag:        { borderRadius: 12, padding: 12, marginBottom: 22, alignItems: 'center' },
  roleTagTxt:     { fontSize: 14, fontWeight: '700' },
  // Login
  label:          { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 8 },
  inputWrap:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 1 },
  input:          { color: C.black, fontSize: 15 },
  primaryBtn:     { borderRadius: 14, padding: 17, alignItems: 'center', shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 5 },
  primaryBtnTxt:  { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  // Logged in
  successCard:    { backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 16, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  successTop:     { alignItems: 'center', padding: 32, borderBottomWidth: 1, borderBottomColor: C.border },
  successAvatar:  { width: 72, height: 72, borderRadius: 22, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successAvatarTxt:{ fontSize: 24, fontWeight: '900', color: C.white },
  successName:    { fontSize: 22, fontWeight: '800', color: C.navy, marginBottom: 4 },
  successSchool:  { fontSize: 13, color: C.grey, marginBottom: 16 },
  chip:           { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipGreen:      { backgroundColor: C.greenLight },
  chipNavy:       { backgroundColor: C.navyLight },
  chipTxt:        { fontSize: 12, fontWeight: '700' },
  chipTxtGreen:   { color: C.green },
  chipTxtNavy:    { color: C.navy },
  infoRow:        { flexDirection: 'row' },
  infoCell:       { flex: 1, padding: 18, alignItems: 'center' },
  infoCellLbl:    { fontSize: 9, fontWeight: '700', color: C.grey, letterSpacing: 1, marginBottom: 6 },
  infoCellVal:    { fontSize: 15, fontWeight: '700', color: C.navy },
  signOutBtn:     { backgroundColor: C.white, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  signOutTxt:     { color: C.grey, fontSize: 14, fontWeight: '600' },
});
