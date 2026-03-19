import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions
} from 'react-native';
import Svg, { Circle, Line, Rect, G } from 'react-native-svg';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";
const { width, height } = Dimensions.get('window');

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

// ── African-inspired SVG background ──────────────────────────────────────────
function AfricanBg() {
  const symbols = [
    { x: 28,     y: 80,   s: 44, type: 'adinkra' },
    { x: width - 72, y: 140, s: 36, type: 'diamond' },
    { x: 44,     y: 280,  s: 40, type: 'cross'   },
    { x: width - 60, y: 400, s: 48, type: 'adinkra' },
    { x: 20,     y: 540,  s: 38, type: 'diamond' },
    { x: width - 52, y: 660, s: 42, type: 'cross'   },
    { x: 36,     y: 800,  s: 46, type: 'adinkra' },
  ];
  return (
    <Svg style={StyleSheet.absoluteFill} width={width} height={height + 400}>
      {symbols.map((sym, i) => {
        const cx = sym.x + sym.s / 2;
        const cy = sym.y + sym.s / 2;
        const r  = sym.s / 2;
        const col = i % 2 === 0 ? C.navy : C.green;
        const op  = 0.055;
        if (sym.type === 'adinkra') return (
          <G key={i} opacity={op}>
            <Circle cx={cx} cy={cy} r={r} stroke={col} strokeWidth={1.8} fill="none" />
            <Circle cx={cx} cy={cy} r={r * 0.5} stroke={col} strokeWidth={1.2} fill="none" />
            <Circle cx={cx} cy={cy} r={r * 0.15} fill={col} />
            <Line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={col} strokeWidth={1} />
            <Line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={col} strokeWidth={1} />
          </G>
        );
        if (sym.type === 'diamond') return (
          <G key={i} opacity={op}>
            <Rect x={cx - r * 0.7} y={cy - r * 0.7} width={r * 1.4} height={r * 1.4}
              stroke={col} strokeWidth={1.8} fill="none"
              transform={`rotate(45, ${cx}, ${cy})`} />
            <Rect x={cx - r * 0.35} y={cy - r * 0.35} width={r * 0.7} height={r * 0.7}
              stroke={col} strokeWidth={1} fill="none"
              transform={`rotate(45, ${cx}, ${cy})`} />
          </G>
        );
        if (sym.type === 'cross') return (
          <G key={i} opacity={op}>
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

function FadeIn({ children, delay = 0 }: any) {
  const opacity = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(20))[0];
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 650, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 650, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function BackButton({ onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={S.backBtn}>
      <View style={S.backBtnInner}>
        <Text style={S.backBtnTxt}>← Back</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  // Navigation steps:
  // home → schoolLogin → selectSchool → chooseRole → login → dashboard
  // home → superadmin (router.push)
  const [step, setStep] = useState('home');
  const [schools, setSchools] = useState<any[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [loginType, setLoginType] = useState<'student' | 'staff'>('student');
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
    setUsername(''); setPassword(''); setStep('home');
    setLoginType('student');
  }

  // ── Logged in ────────────────────────────────────────────────────────────────
  if (session) {
    const u = session.user;
    return (
      <View style={[S.fill, { backgroundColor: C.canvas }]}>
        <AfricanBg />
        <ScrollView contentContainerStyle={S.successScroll}>
          <BackButton onPress={goHome} />
          <View style={S.successCard}>
            <View style={S.successTop}>
              <View style={S.successAvatar}>
                <Text style={S.successAvatarTxt}>
                  {u.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={S.successName}>{u.name}</Text>
              <Text style={S.successSchool}>{u.school?.name}</Text>
              <View style={[S.roleChip,
                u.role === 'student' ? { backgroundColor: C.greenLight } : { backgroundColor: C.navyLight }]}>
                <Text style={[S.roleChipTxt,
                  u.role === 'student' ? { color: C.green } : { color: C.navy }]}>
                  {u.role === 'student' ? 'Student' : u.role === 'head_admin' ? 'School Admin' : 'Super Admin'}
                </Text>
              </View>
            </View>
            {u.role === 'student' && (
              <View style={S.infoRow}>
                <View style={S.infoCell}>
                  <Text style={S.infoCellLabel}>CLASS</Text>
                  <Text style={S.infoCellVal}>{u.class?.name || '—'}</Text>
                </View>
                <View style={[S.infoCell, { borderLeftWidth: 1, borderLeftColor: C.border }]}>
                  <Text style={S.infoCellLabel}>STUDENT ID</Text>
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
    const accent = selectedSchool.theme_primary || C.green;
    return (
      <View style={[S.fill, { backgroundColor: C.canvas }]}>
        <AfricanBg />
        <ScrollView contentContainerStyle={S.loginScroll} keyboardShouldPersistTaps="handled">
          <BackButton onPress={() => setStep('chooseRole')} />

          <FadeIn>
            <View style={[S.schoolBadge, { borderLeftColor: accent }]}>
              <Text style={S.schoolBadgeName}>{selectedSchool.name}</Text>
              <Text style={S.schoolBadgeCat}>{selectedSchool.category}</Text>
            </View>
          </FadeIn>

          <FadeIn delay={60}>
            <View style={[S.roleIndicator,
              loginType === 'student' ? { backgroundColor: C.greenLight } : { backgroundColor: C.navyLight }]}>
              <Text style={[S.roleIndicatorTxt,
                loginType === 'student' ? { color: C.green } : { color: C.navy }]}>
                {loginType === 'student' ? '🎓 Student / Parent Login' : '🏫 School Admin Login'}
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={120}>
            <Text style={S.label}>{loginType === 'student' ? 'STUDENT ID' : 'EMAIL ADDRESS'}</Text>
            <View style={S.inputWrap}>
              <TextInput style={S.input}
                placeholder={loginType === 'student' ? 'e.g. LYC-0002' : 'admin@school.educaid.io'}
                placeholderTextColor={C.greyMid} value={username}
                onChangeText={setUsername} autoCapitalize="none" />
            </View>
          </FadeIn>

          <FadeIn delay={180}>
            <Text style={S.label}>PASSWORD</Text>
            <View style={S.inputWrap}>
              <TextInput style={[S.input, { flex: 1 }]} placeholder="Enter your password"
                placeholderTextColor={C.greyMid} value={password}
                onChangeText={setPassword} secureTextEntry={!showPw} />
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                <Text style={{ color: C.grey, fontSize: 13 }}>{showPw ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </FadeIn>

          <FadeIn delay={240}>
            <TouchableOpacity style={[S.primaryBtn,
              { backgroundColor: loginType === 'student' ? C.green : C.navy }]}
              onPress={doLogin} disabled={loading}>
              {loading
                ? <ActivityIndicator color={C.white} />
                : <Text style={S.primaryBtnTxt}>Sign In →</Text>}
            </TouchableOpacity>
          </FadeIn>
        </ScrollView>
      </View>
    );
  }

  // ── Choose role (Student or Staff) ───────────────────────────────────────────
  if (step === 'chooseRole' && selectedSchool) {
    return (
      <View style={[S.fill, { backgroundColor: C.canvas }]}>
        <AfricanBg />
        <ScrollView contentContainerStyle={S.loginScroll}>
          <BackButton onPress={() => setStep('selectSchool')} />

          <FadeIn>
            <View style={[S.schoolBadge, { borderLeftColor: selectedSchool.theme_primary || C.green }]}>
              <Text style={S.schoolBadgeName}>{selectedSchool.name}</Text>
              <Text style={S.schoolBadgeCat}>{selectedSchool.category}</Text>
            </View>
          </FadeIn>

          <FadeIn delay={80}>
            <Text style={S.chooseRoleTitle}>Who are you?</Text>
            <Text style={S.chooseRoleSub}>Select your role to continue</Text>
          </FadeIn>

          <FadeIn delay={140}>
            <TouchableOpacity style={S.roleCard}
              onPress={() => { setLoginType('student'); setStep('login'); }}>
              <View style={[S.roleCardIcon, { backgroundColor: C.greenLight }]}>
                <Text style={{ fontSize: 28 }}>🎓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.roleCardTitle}>Student / Parent</Text>
                <Text style={S.roleCardSub}>View grades, attendance & reports</Text>
              </View>
              <Text style={{ color: C.greyMid, fontSize: 22 }}>›</Text>
            </TouchableOpacity>
          </FadeIn>

          <FadeIn delay={210}>
            <TouchableOpacity style={S.roleCard}
              onPress={() => { setLoginType('staff'); setStep('login'); }}>
              <View style={[S.roleCardIcon, { backgroundColor: C.navyLight }]}>
                <Text style={{ fontSize: 28 }}>🏫</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.roleCardTitle}>School Admin / Staff</Text>
                <Text style={S.roleCardSub}>Manage attendance, grades & more</Text>
              </View>
              <Text style={{ color: C.greyMid, fontSize: 22 }}>›</Text>
            </TouchableOpacity>
          </FadeIn>
        </ScrollView>
      </View>
    );
  }

  // ── Select school ────────────────────────────────────────────────────────────
  if (step === 'selectSchool') {
    return (
      <View style={[S.fill, { backgroundColor: C.canvas }]}>
        <AfricanBg />
        <ScrollView contentContainerStyle={S.listScroll}>
          <BackButton onPress={() => setStep('home')} />
          <Text style={S.pageH1}>Select School</Text>
          <Text style={S.pageH2}>Choose your institution to continue</Text>
          {loadingSchools
            ? <ActivityIndicator color={C.green} size="large" style={{ marginTop: 40 }} />
            : schools.length === 0
              ? <View style={S.emptyBox}><Text style={S.emptyTxt}>No schools registered yet.</Text></View>
              : schools.map((sc: any, i) => (
                  <FadeIn key={sc.id} delay={i * 60}>
                    <TouchableOpacity style={S.schoolRow}
                      onPress={() => { setSelectedSchool(sc); setStep('chooseRole'); }}>
                      <View style={[S.schoolDot, { backgroundColor: sc.theme_primary || C.green }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={S.schoolName}>{sc.name}</Text>
                        <Text style={S.schoolSub}>{sc.category} · {sc.subsystem?.toUpperCase()}</Text>
                      </View>
                      <Text style={{ color: C.greyMid, fontSize: 22 }}>›</Text>
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
      <ScrollView contentContainerStyle={S.homeScroll}>

        <FadeIn>
          <View style={S.hero}>
            <View style={S.heroBadge}>
              <Text style={S.heroBadgeTxt}>EA</Text>
            </View>
            <View style={S.heroText}>
              <Text style={S.heroTitle}>EducAid</Text>
              <Text style={S.heroTagline}>Excellence in Education Management</Text>
            </View>
          </View>
          <View style={S.heroDividerRow}>
            <View style={S.heroDividerGreen} />
            <View style={S.heroDividerNavy} />
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <Text style={S.sectionLabel}>ACCESS PORTAL</Text>
        </FadeIn>

        {/* Main portal — School Login (large) */}
        <FadeIn delay={180}>
          <TouchableOpacity
            style={[S.portalMain, { backgroundColor: C.navyLight, borderColor: C.navy + '22' }]}
            onPress={() => { setStep('selectSchool'); loadSchools(); }}
            activeOpacity={0.75}>
            <View style={S.portalMainLeft}>
              <View style={[S.portalMainIcon, { backgroundColor: C.navy }]}>
                <Text style={{ fontSize: 26 }}>🏫</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[S.portalMainTitle, { color: C.navy }]}>School Login</Text>
                <Text style={[S.portalMainSub, { color: C.navyMid }]}>
                  Students · Parents · Staff
                </Text>
                <View style={S.portalMainBadgeRow}>
                  <View style={[S.portalMainBadge, { backgroundColor: C.greenLight }]}>
                    <Text style={[S.portalMainBadgeTxt, { color: C.green }]}>🎓 Students</Text>
                  </View>
                  <View style={[S.portalMainBadge, { backgroundColor: C.white }]}>
                    <Text style={[S.portalMainBadgeTxt, { color: C.navy }]}>🏫 Admins</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={[S.portalMainArrow, { backgroundColor: C.navy }]}>
              <Text style={S.portalMainArrowTxt}>→</Text>
            </View>
          </TouchableOpacity>
        </FadeIn>

        {/* Super Admin — slim card */}
        <FadeIn delay={300}>
          <TouchableOpacity
            style={[S.portalSlim, { borderLeftColor: C.green }]}
            onPress={() => router.push('/superadmin')}
            activeOpacity={0.75}>
            <View style={[S.portalSlimIcon, { backgroundColor: C.greenLight }]}>
              <Text style={{ fontSize: 22 }}>👑</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.portalSlimTitle}>Super Admin</Text>
              <Text style={S.portalSlimSub}>Platform management · Register schools</Text>
            </View>
            <Text style={{ color: C.greyMid, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        </FadeIn>

        <FadeIn delay={420}>
          <View style={S.footer}>
            <View style={S.footerLine} />
            <Text style={S.footerTxt}>EducAid · Secure School Management</Text>
          </View>
        </FadeIn>

      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  fill:               { flex: 1 },
  // Back button
  backBtn:            { marginBottom: 20 },
  backBtnInner:       { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: C.white, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  backBtnTxt:         { color: C.greyDark, fontSize: 13, fontWeight: '600' },
  // Home
  homeScroll:         { padding: 24, paddingTop: 72, paddingBottom: 48 },
  hero:               { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
  heroBadge:          { width: 60, height: 60, borderRadius: 18, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 6 },
  heroBadgeTxt:       { fontSize: 20, fontWeight: '900', color: C.white, letterSpacing: 1.5 },
  heroText:           { flex: 1 },
  heroTitle:          { fontSize: 32, fontWeight: '900', color: C.navy, letterSpacing: -0.5 },
  heroTagline:        { fontSize: 12, color: C.grey, marginTop: 3, letterSpacing: 0.3 },
  heroDividerRow:     { flexDirection: 'row', gap: 4, marginBottom: 36 },
  heroDividerGreen:   { flex: 1, height: 3, backgroundColor: C.green, borderRadius: 2 },
  heroDividerNavy:    { flex: 2, height: 3, backgroundColor: C.navy, borderRadius: 2 },
  sectionLabel:       { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.5, marginBottom: 14 },
  // Main portal card
  portalMain:         { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 12 },
  portalMainLeft:     { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  portalMainIcon:     { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  portalMainTitle:    { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  portalMainSub:      { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  portalMainBadgeRow: { flexDirection: 'row', gap: 8 },
  portalMainBadge:    { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  portalMainBadgeTxt: { fontSize: 11, fontWeight: '600' },
  portalMainArrow:    { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  portalMainArrowTxt: { color: C.white, fontSize: 16, fontWeight: '700' },
  // Slim portal
  portalSlim:         { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 14, marginBottom: 12, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1, borderLeftWidth: 3 },
  portalSlimIcon:     { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  portalSlimTitle:    { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  portalSlimSub:      { fontSize: 12, color: C.grey },
  footer:             { alignItems: 'center', marginTop: 24 },
  footerLine:         { width: 40, height: 2, backgroundColor: C.greyLight, borderRadius: 1, marginBottom: 10 },
  footerTxt:          { fontSize: 11, color: C.greyMid, letterSpacing: 0.3 },
  // School list
  listScroll:         { padding: 24, paddingTop: 60 },
  pageH1:             { fontSize: 28, fontWeight: '800', color: C.navy, marginBottom: 4 },
  pageH2:             { fontSize: 13, color: C.grey, marginBottom: 28 },
  schoolRow:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1 },
  schoolDot:          { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  schoolName:         { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  schoolSub:          { fontSize: 12, color: C.grey },
  emptyBox:           { alignItems: 'center', padding: 48 },
  emptyTxt:           { color: C.grey, fontSize: 14 },
  // Choose role
  chooseRoleTitle:    { fontSize: 22, fontWeight: '800', color: C.navy, marginBottom: 6, marginTop: 8 },
  chooseRoleSub:      { fontSize: 13, color: C.grey, marginBottom: 28 },
  roleCard:           { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: C.border, gap: 14, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  roleCardIcon:       { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  roleCardTitle:      { fontSize: 16, fontWeight: '700', color: C.navy, marginBottom: 4 },
  roleCardSub:        { fontSize: 12, color: C.grey },
  // Login form
  loginScroll:        { padding: 24, paddingTop: 60, paddingBottom: 48 },
  schoolBadge:        { backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  schoolBadgeName:    { fontSize: 16, fontWeight: '700', color: C.navy, marginBottom: 3 },
  schoolBadgeCat:     { fontSize: 12, color: C.grey },
  roleIndicator:      { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 24, alignItems: 'center' },
  roleIndicatorTxt:   { fontSize: 14, fontWeight: '700' },
  label:              { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 8 },
  inputWrap:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 1 },
  input:              { color: C.black, fontSize: 15 },
  primaryBtn:         { borderRadius: 14, padding: 17, alignItems: 'center', shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 5 },
  primaryBtnTxt:      { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  // Logged in
  successScroll:      { padding: 24, paddingTop: 60 },
  successCard:        { backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 16, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  successTop:         { alignItems: 'center', padding: 32, borderBottomWidth: 1, borderBottomColor: C.border },
  successAvatar:      { width: 72, height: 72, borderRadius: 22, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  successAvatarTxt:   { fontSize: 24, fontWeight: '900', color: C.white },
  successName:        { fontSize: 22, fontWeight: '800', color: C.navy, marginBottom: 4 },
  successSchool:      { fontSize: 13, color: C.grey, marginBottom: 16 },
  roleChip:           { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  roleChipTxt:        { fontSize: 12, fontWeight: '700' },
  infoRow:            { flexDirection: 'row' },
  infoCell:           { flex: 1, padding: 18, alignItems: 'center' },
  infoCellLabel:      { fontSize: 9, fontWeight: '700', color: C.grey, letterSpacing: 1, marginBottom: 6 },
  infoCellVal:        { fontSize: 15, fontWeight: '700', color: C.navy },
  signOutBtn:         { backgroundColor: C.white, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  signOutTxt:         { color: C.grey, fontSize: 14, fontWeight: '600' },
});
