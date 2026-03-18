import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";

export default function HomeScreen() {
  const router = useRouter();
  const [step, setStep] = useState('home');
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [loginType, setLoginType] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

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

  async function studentLogin() {
    if (!username || !password) { Alert.alert("Error", "Enter Student ID and password"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentCode: username, password, schoolId: selectedSchool?.id })
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Login Failed", data.error || "Invalid credentials"); setLoading(false); return; }
      setSession({ token: data.token, user: data.user });
      setLoading(false);
    } catch { Alert.alert("Error", "Cannot connect to server."); setLoading(false); }
  }

  async function staffLogin() {
    if (!username || !password) { Alert.alert("Error", "Enter email and password"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password })
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Login Failed", data.error || "Invalid credentials"); setLoading(false); return; }
      setSession({ token: data.token, user: data.user });
      setLoading(false);
    } catch { Alert.alert("Error", "Cannot connect to server."); setLoading(false); }
  }

  function handleLogout() {
    setSession(null); setSelectedSchool(null);
    setUsername(''); setPassword(''); setStep('home');
  }

  if (session) {
    const user = session.user;
    const color = user.school?.theme?.primary || '#1a7a6e';
    return (
      <View style={[styles.container, { backgroundColor: color }]}>
        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeEmoji}>{user.role === 'student' ? '🎓' : '🏫'}</Text>
          <Text style={styles.welcomeTitle}>Welcome to EducAid</Text>
          <Text style={styles.welcomeName}>{user.name}</Text>
          <Text style={styles.welcomeSchool}>{user.school?.name}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>
              {user.role === 'student' ? '🎓 Student' : user.role === 'head_admin' ? '🏫 School Admin' : '👨‍🏫 Teacher'}
            </Text>
          </View>
          {user.role === 'student' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Class: {user.class?.name}</Text>
              <Text style={styles.infoText}>Student ID: {user.studentCode}</Text>
            </View>
          )}
          <Text style={styles.welcomeNote}>✅ Login successful!</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'login' && selectedSchool) {
    const color = selectedSchool.theme_primary || '#1a7a6e';
    return (
      <View style={[styles.container, { backgroundColor: '#0f1923' }]}>
        <ScrollView contentContainerStyle={styles.loginScroll}>
          <TouchableOpacity onPress={() => setStep('schools')} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeTitle}>{selectedSchool.name}</Text>
            <Text style={styles.badgeSub}>{selectedSchool.category}</Text>
          </View>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, loginType === 'student' && { backgroundColor: color }]}
              onPress={() => setLoginType('student')}>
              <Text style={[styles.toggleText, loginType === 'student' && { color: '#fff' }]}>👨‍🎓 Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, loginType === 'staff' && { backgroundColor: color }]}
              onPress={() => setLoginType('staff')}>
              <Text style={[styles.toggleText, loginType === 'staff' && { color: '#fff' }]}>🏫 Staff</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>{loginType === 'student' ? 'Student ID' : 'Staff Email'}</Text>
          <TextInput
            style={styles.input}
            placeholder={loginType === 'student' ? 'e.g. LYC-0002' : 'admin@school.educaid.io'}
            placeholderTextColor="#7a7066"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#7a7066"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: color }]}
            onPress={loginType === 'student' ? studentLogin : staffLogin}
            disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (step === 'schools') {
    return (
      <View style={[styles.container, { backgroundColor: '#0f1923' }]}>
        <ScrollView contentContainerStyle={styles.schoolScroll}>
          <TouchableOpacity onPress={() => setStep('home')} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Select School</Text>
          <Text style={styles.pageSub}>Choose your school to continue</Text>
          {loadingSchools ? (
            <ActivityIndicator color="#1a7a6e" size="large" style={{ marginTop: 40 }} />
          ) : schools.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🏫</Text>
              <Text style={styles.emptyText}>No schools registered yet.</Text>
            </View>
          ) : (
            schools.map(school => (
              <TouchableOpacity
                key={school.id}
                style={styles.schoolCard}
                onPress={() => { setSelectedSchool(school); setStep('login'); }}>
                <View style={[styles.dot, { backgroundColor: school.theme_primary || '#1a7a6e' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.schoolName}>{school.name}</Text>
                  <Text style={styles.schoolCat}>{school.category} · {school.subsystem?.toUpperCase()}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#0f1923' }]}>
      <ScrollView contentContainerStyle={styles.homeScroll}>
        <Text style={styles.appTitle}>EducAid</Text>
        <Text style={styles.appSub}>School Management Platform</Text>

        <TouchableOpacity
          style={[styles.homeCard, { borderColor: '#059669' }]}
          onPress={() => router.push('/studentdashboard')}>
          <Text style={styles.homeCardIcon}>🎓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.homeCardTitle}>Student Portal</Text>
            <Text style={styles.homeCardSub}>Grades, Attendance & More</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.homeCard, { borderColor: '#1a7a6e' }]}
          onPress={() => { setStep('schools'); loadSchools(); }}>
          <Text style={styles.homeCardIcon}>🏫</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.homeCardTitle}>School Login</Text>
            <Text style={styles.homeCardSub}>Students & Parents</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.homeCard, { borderColor: '#2a6fa8' }]}
          onPress={() => router.push('/schooladmin')}>
          <Text style={styles.homeCardIcon}>👨‍🏫</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.homeCardTitle}>School Admin</Text>
            <Text style={styles.homeCardSub}>Attendance, Grades & More</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.homeCard, { borderColor: '#c0394b' }]}
          onPress={() => router.push('/superadmin')}>
          <Text style={styles.homeCardIcon}>👑</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.homeCardTitle}>Super Admin</Text>
            <Text style={styles.homeCardSub}>Platform Management</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.version}>EducAid v1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  homeScroll:    { padding: 24, paddingTop: 80 },
  appTitle:      { fontSize: 40, fontWeight: '800', color: '#fff', marginBottom: 6 },
  appSub:        { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 40 },
  homeCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1.5 },
  homeCardIcon:  { fontSize: 32, marginRight: 16 },
  homeCardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 3 },
  homeCardSub:   { fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  arrow:         { fontSize: 22, color: 'rgba(255,255,255,0.3)' },
  version:       { textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 40 },
  schoolScroll:  { padding: 20, paddingTop: 60 },
  pageTitle:     { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 6 },
  pageSub:       { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 },
  schoolCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 10 },
  dot:           { width: 14, height: 14, borderRadius: 7, marginRight: 14 },
  schoolName:    { fontSize: 15, fontWeight: '700', color: '#fff' },
  schoolCat:     { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  loginScroll:   { padding: 24, paddingTop: 60 },
  backBtn:       { marginBottom: 20 },
  backText:      { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  badge:         { borderRadius: 14, padding: 16, marginBottom: 24 },
  badgeTitle:    { fontSize: 18, fontWeight: '700', color: '#fff' },
  badgeSub:      { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  toggleRow:     { flexDirection: 'row', gap: 10, marginBottom: 24 },
  toggleBtn:     { flex: 1, padding: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  toggleText:    { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  label:         { fontSize: 11, fontWeight: '700', color: '#7a8fa8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  input:         { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, color: '#fff', fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btn:           { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText:       { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyCard:     { alignItems: 'center', padding: 40 },
  emptyIcon:     { fontSize: 40, marginBottom: 12 },
  emptyText:     { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  welcomeBox:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  welcomeEmoji:  { fontSize: 60, marginBottom: 16 },
  welcomeTitle:  { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  welcomeName:   { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  welcomeSchool: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 16 },
  roleTag:       { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 16 },
  roleTagText:   { color: '#fff', fontSize: 13, fontWeight: '600' },
  infoBox:       { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: 16, marginBottom: 24, width: '100%' },
  infoText:      { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  welcomeNote:   { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  logoutBtn:     { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 14, paddingHorizontal: 24 },
  logoutText:    { color: '#fff', fontSize: 14, fontWeight: '600' },
});
