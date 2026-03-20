import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

const API_URL = "https://elegant-eagerness-production-2114.up.railway.app";

const C = {
  white: '#FFFFFF', canvas: '#F7F8F5',
  green: '#1B5E3B', greenLight: '#EAF2EC',
  navy: '#0C1F4A', navyLight: '#E8EDF8',
  grey: '#6B7280', greyLight: '#E5E7EB', greyMid: '#9CA3AF', greyDark: '#374151',
  black: '#0A0C10', border: '#D1D5DB', red: '#B91C1C', redLight: '#FEE2E2',
};

function Lbl({ text }: { text: string }) {
  return <Text style={P.lbl}>{text}</Text>;
}

function Field({ value, onChange, placeholder, secure, keyboard }: any) {
  return (
    <View style={P.fieldWrap}>
      <TextInput style={P.fieldTxt} value={value} onChangeText={onChange}
        placeholder={placeholder} placeholderTextColor={C.greyMid}
        secureTextEntry={secure} autoCapitalize="none"
        keyboardType={keyboard || 'default'} />
    </View>
  );
}

function BackBtn({ onPress, label = '← Back' }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={P.backBtn}>
      <Text style={P.backBtnTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function SuperAdminScreen() {
  const router = useRouter();
  const [token, setToken]           = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [loggedIn, setLoggedIn]     = useState(false);
  const [tab, setTab]               = useState('schools');
  const [schools, setSchools]       = useState<any[]>([]);
  const [pendingStudents, setPending] = useState<any[]>([]);
  const [showCreateSchool, setShowCreateSchool] = useState(false);

  const [schoolName,      setSchoolName]      = useState('');
  const [schoolCategory,  setSchoolCategory]  = useState('secondary');
  const [schoolSubsystem, setSchoolSubsystem] = useState('en');
  const [schoolAddress,   setSchoolAddress]   = useState('');
  const [schoolPhone,     setSchoolPhone]     = useState('');
  const [schoolEmail,     setSchoolEmail]     = useState('');
  const [schoolMotto,     setSchoolMotto]     = useState('');
  const [principalName,   setPrincipalName]   = useState('');
  const [principalPhone,  setPrincipalPhone]  = useState('');
  const [principalEmail,  setPrincipalEmail]  = useState('');
  const [location,        setLocation]        = useState('');
  const [creating,        setCreating]        = useState(false);

  const CATEGORIES = ['secondary','primary','nursery','creche','highschool','university','technical','professional'];

  async function login() {
    if (!email || !password) { Alert.alert('Error', 'Enter email and password'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/super/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert('Login Failed', data.error || 'Invalid credentials'); setLoading(false); return; }
      setToken(data.token); setLoggedIn(true); setLoading(false);
      loadSchools(data.token);
      loadPending(data.token);
    } catch { Alert.alert('Error', 'Cannot connect to server.'); setLoading(false); }
  }

  async function loadSchools(t: string) {
    try {
      const res  = await fetch(`${API_URL}/auth/super/schools`, { headers: { Authorization: `Bearer ${t || token}` } });
      const data = await res.json();
      if (res.ok) setSchools(data.schools || []);
    } catch {}
  }

  async function loadPending(t: string) {
    try {
      const res  = await fetch(`${API_URL}/auth/super/pending-students`, { headers: { Authorization: `Bearer ${t || token}` } });
      const data = await res.json();
      if (res.ok) setPending(data.students || []);
    } catch {}
  }

  async function createSchool() {
    if (!schoolName || !principalEmail) { Alert.alert('Error', 'School name and principal email are required'); return; }
    setCreating(true);
    try {
      const res  = await fetch(`${API_URL}/auth/super/create-school`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: schoolName, category: schoolCategory, subsystem: schoolSubsystem, address: schoolAddress, phone: schoolPhone, email: schoolEmail, motto: schoolMotto, principalName, principalPhone, principalEmail, location }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert('Error', data.error || 'Failed to create school'); setCreating(false); return; }
      Alert.alert('✅ School Created!', `${schoolName} has been registered.\n\nAdmin username: ${data.admin?.username}\n\nWelcome email sent to ${principalEmail}`);
      setCreating(false); setShowCreateSchool(false);
      setSchoolName(''); setSchoolCategory('secondary'); setSchoolAddress('');
      setSchoolPhone(''); setSchoolEmail(''); setSchoolMotto('');
      setPrincipalName(''); setPrincipalPhone(''); setPrincipalEmail(''); setLocation('');
      loadSchools(token);
    } catch { Alert.alert('Error', 'Failed to create school'); setCreating(false); }
  }

  async function deleteSchool(schoolId: string, schoolName: string) {
    Alert.alert(
      'Delete School',
      `Are you sure you want to delete "${schoolName}"? This will permanently delete all students, classes and records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/schools/${schoolId}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                Alert.alert('✅ Deleted', `${schoolName} has been deleted.`);
                loadSchools(token);
              } else {
                const data = await res.json();
                Alert.alert('Error', data.error || 'Failed to delete school');
              }
            } catch { Alert.alert('Error', 'Failed to delete school'); }
          }
        }
      ]
    );
  }

  async function approveStudent(studentId: string, studentName: string) {
    try {
      const res  = await fetch(`${API_URL}/auth/super/approve-student/${studentId}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('✅ Approved!', `${studentName} has been approved.\nStudent ID: ${data.studentCode}\nCredentials sent to school admin.`);
        loadPending(token);
      } else Alert.alert('Error', data.error || 'Failed to approve student');
    } catch { Alert.alert('Error', 'Failed to approve student'); }
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <View style={[P.fill, { backgroundColor: C.canvas }]}>
        <ScrollView contentContainerStyle={P.pad} keyboardShouldPersistTaps="handled">
          <BackBtn onPress={() => router.back()} label="← Home" />
          <View style={P.loginTop}>
            <View style={P.loginIcon}><Text style={{ fontSize: 28 }}>👑</Text></View>
            <Text style={P.loginH1}>Super Admin</Text>
            <Text style={P.loginH2}>Platform management & school registration</Text>
          </View>
          <Lbl text="EMAIL ADDRESS" />
          <Field value={email} onChange={setEmail} placeholder="your@email.com" keyboard="email-address" />
          <Lbl text="PASSWORD" />
          <Field value={password} onChange={setPassword} placeholder="Your password" secure />
          <TouchableOpacity style={P.signInBtn} onPress={login} disabled={loading}>
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={P.signInBtnTxt}>Sign In →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  return (
    <View style={[P.fill, { backgroundColor: C.canvas }]}>

      {/* Header */}
      <View style={P.dashHeader}>
        <TouchableOpacity onPress={() => router.back()} style={P.headerBack}>
          <Text style={P.headerBackTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={P.dashHeaderTitle}>Super Admin</Text>
          <Text style={P.dashHeaderSub}>EducAid Platform Management</Text>
        </View>
        <TouchableOpacity style={P.signOutBtn} onPress={() => { setLoggedIn(false); setEmail(''); setPassword(''); }}>
          <Text style={P.signOutBtnTxt}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={P.statsStrip}>
        <View style={P.statItem}>
          <Text style={P.statNum}>{schools.length}</Text>
          <Text style={P.statLbl}>Schools</Text>
        </View>
        <View style={[P.statItem, { borderLeftWidth: 1, borderLeftColor: C.border }]}>
          <Text style={[P.statNum, { color: pendingStudents.length > 0 ? C.red : C.navy }]}>{pendingStudents.length}</Text>
          <Text style={P.statLbl}>Pending</Text>
        </View>
        <TouchableOpacity
          style={[P.statItem, { borderLeftWidth: 1, borderLeftColor: C.border }]}
          onPress={() => setShowCreateSchool(true)}>
          <Text style={[P.statNum, { color: C.green }]}>+</Text>
          <Text style={P.statLbl}>New School</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={P.tabBar}>
        {[
          { id: 'schools', label: `🏫 Schools (${schools.length})` },
          { id: 'pending', label: `⏳ Pending (${pendingStudents.length})` },
        ].map(t => (
          <TouchableOpacity key={t.id}
            style={[P.tabItem, tab === t.id && { borderBottomColor: C.navy, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.id)}>
            <Text style={[P.tabItemTxt, tab === t.id && { color: C.navy, fontWeight: '700' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1, padding: 16 }}>

        {/* Schools tab */}
        {tab === 'schools' && (
          <>
            <TouchableOpacity style={P.newSchoolBtn} onPress={() => setShowCreateSchool(true)}>
              <Text style={P.newSchoolBtnTxt}>+ Register New School</Text>
            </TouchableOpacity>
            {schools.length === 0
              ? <View style={P.empty}><Text style={P.emptyTxt}>No schools registered yet.</Text></View>
              : schools.map((sc: any) => (
                  <View key={sc.id} style={P.schoolCard}>
                    <View style={[P.schoolDot, { backgroundColor: sc.theme_primary || C.green }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={P.schoolName}>{sc.name}</Text>
                      <Text style={P.schoolSub}>{sc.category} · {sc.subsystem?.toUpperCase()}</Text>
                      <Text style={P.schoolMeta}>{sc.student_count || 0} students · {sc.class_count || 0} classes</Text>
                    </View>
                    <TouchableOpacity
                      style={P.deleteBtn}
                      onPress={() => deleteSchool(sc.id, sc.name)}>
                      <Text style={P.deleteBtnTxt}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
            }
          </>
        )}

        {/* Pending tab */}
        {tab === 'pending' && (
          <>
            {pendingStudents.length === 0
              ? <View style={P.empty}><Text style={{ fontSize: 32, marginBottom: 12 }}>✅</Text><Text style={P.emptyTxt}>No pending students.{'\n'}All students are approved.</Text></View>
              : pendingStudents.map((st: any) => (
                  <View key={st.id} style={P.pendingCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={P.pendingName}>{st.name}</Text>
                      <Text style={P.pendingSub}>{st.school_name} · {st.class_name}</Text>
                      <Text style={P.pendingMeta}>Awaiting approval</Text>
                    </View>
                    <TouchableOpacity style={P.approveBtn} onPress={() => approveStudent(st.id, st.name)}>
                      <Text style={P.approveBtnTxt}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                ))
            }
          </>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Create School Modal */}
      <Modal visible={showCreateSchool} animationType="slide">
        <View style={[P.fill, { backgroundColor: C.canvas }]}>
          <ScrollView contentContainerStyle={P.modalPad} keyboardShouldPersistTaps="handled">
            <BackBtn onPress={() => setShowCreateSchool(false)} />
            <Text style={P.modalTitle}>Register New School</Text>

            <Text style={P.secHead}>SCHOOL INFORMATION</Text>
            <Lbl text="SCHOOL NAME *" />
            <Field value={schoolName} onChange={setSchoolName} placeholder="e.g. Greenview Academy" />
            <Lbl text="CATEGORY *" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat}
                  style={[P.pill, schoolCategory === cat && P.pillActive]}
                  onPress={() => setSchoolCategory(cat)}>
                  <Text style={[P.pillTxt, schoolCategory === cat && P.pillTxtActive]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Lbl text="SUBSYSTEM" />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {[{ id: 'en', label: '🇬🇧 English' }, { id: 'fr', label: '🇫🇷 French' }].map(s => (
                <TouchableOpacity key={s.id}
                  style={[P.pill, schoolSubsystem === s.id && P.pillActive, { flex: 1, justifyContent: 'center' }]}
                  onPress={() => setSchoolSubsystem(s.id)}>
                  <Text style={[P.pillTxt, schoolSubsystem === s.id && P.pillTxtActive]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Lbl text="ADDRESS" />
            <Field value={schoolAddress} onChange={setSchoolAddress} placeholder="Street address" />
            <Lbl text="PHONE" />
            <Field value={schoolPhone} onChange={setSchoolPhone} placeholder="+237 6XX XXX XXX" keyboard="phone-pad" />
            <Lbl text="SCHOOL EMAIL" />
            <Field value={schoolEmail} onChange={setSchoolEmail} placeholder="info@school.com" keyboard="email-address" />
            <Lbl text="SCHOOL MOTTO" />
            <Field value={schoolMotto} onChange={setSchoolMotto} placeholder="e.g. Excellence Through Knowledge" />
            <Lbl text="LOCATION" />
            <Field value={location} onChange={setLocation} placeholder="e.g. Yaoundé, Cameroon" />

            <Text style={P.secHead}>PRINCIPAL / ADMIN INFORMATION</Text>
            <Lbl text="PRINCIPAL NAME" />
            <Field value={principalName} onChange={setPrincipalName} placeholder="Full name" />
            <Lbl text="PRINCIPAL PHONE" />
            <Field value={principalPhone} onChange={setPrincipalPhone} placeholder="+237 6XX XXX XXX" keyboard="phone-pad" />
            <Lbl text="PRINCIPAL EMAIL * (credentials sent here)" />
            <Field value={principalEmail} onChange={setPrincipalEmail} placeholder="principal@email.com" keyboard="email-address" />

            <TouchableOpacity style={P.signInBtn} onPress={createSchool} disabled={creating}>
              {creating ? <ActivityIndicator color={C.white} /> : <Text style={P.signInBtnTxt}>Register School</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const P = StyleSheet.create({
  fill:            { flex: 1 },
  pad:             { padding: 24, paddingTop: 60, paddingBottom: 48 },
  modalPad:        { padding: 24, paddingTop: 60, paddingBottom: 48 },
  backBtn:         { alignSelf: 'flex-start', backgroundColor: C.white, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
  backBtnTxt:      { color: C.greyDark, fontSize: 13, fontWeight: '600' },
  loginTop:        { alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  loginIcon:       { width: 64, height: 64, borderRadius: 20, backgroundColor: C.navyLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  loginH1:         { fontSize: 26, fontWeight: '800', color: C.navy, marginBottom: 6 },
  loginH2:         { fontSize: 13, color: C.grey, textAlign: 'center' },
  lbl:             { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 8 },
  fieldWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 },
  fieldTxt:        { color: C.black, fontSize: 15, flex: 1 },
  signInBtn:       { backgroundColor: C.navy, borderRadius: 14, padding: 17, alignItems: 'center' },
  signInBtnTxt:    { color: C.white, fontSize: 16, fontWeight: '700' },
  dashHeader:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, padding: 16, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: C.border, gap: 10 },
  headerBack:      { width: 36, height: 36, borderRadius: 10, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  headerBackTxt:   { fontSize: 18, color: C.navy },
  dashHeaderTitle: { fontSize: 18, fontWeight: '800', color: C.navy, marginBottom: 2 },
  dashHeaderSub:   { fontSize: 12, color: C.grey },
  signOutBtn:      { backgroundColor: C.canvas, borderRadius: 8, padding: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border },
  signOutBtnTxt:   { color: C.grey, fontSize: 12, fontWeight: '600' },
  statsStrip:      { flexDirection: 'row', backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  statItem:        { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum:         { fontSize: 22, fontWeight: '900', color: C.navy, marginBottom: 2 },
  statLbl:         { fontSize: 10, color: C.grey, fontWeight: '600' },
  tabBar:          { flexDirection: 'row', backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  tabItem:         { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemTxt:      { fontSize: 13, color: C.grey, fontWeight: '600' },
  newSchoolBtn:    { backgroundColor: C.greenLight, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.green + '44' },
  newSchoolBtnTxt: { color: C.green, fontSize: 14, fontWeight: '700' },
  schoolCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  schoolDot:       { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  schoolName:      { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  schoolSub:       { fontSize: 12, color: C.grey, marginBottom: 2 },
  schoolMeta:      { fontSize: 11, color: C.greyMid },
  deleteBtn:       { width: 36, height: 36, borderRadius: 10, backgroundColor: C.redLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.red + '33' },
  deleteBtnTxt:    { fontSize: 16 },
  pendingCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: C.red },
  pendingName:     { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  pendingSub:      { fontSize: 12, color: C.grey, marginBottom: 2 },
  pendingMeta:     { fontSize: 11, color: C.red },
  approveBtn:      { backgroundColor: C.greenLight, borderRadius: 10, padding: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: C.green + '44' },
  approveBtnTxt:   { color: C.green, fontSize: 13, fontWeight: '700' },
  empty:           { alignItems: 'center', padding: 48, backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  emptyTxt:        { color: C.grey, fontSize: 13, textAlign: 'center', lineHeight: 22 },
  modalTitle:      { fontSize: 24, fontWeight: '800', color: C.navy, marginBottom: 24 },
  secHead:         { fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1.2, marginBottom: 14, marginTop: 8 },
  pill:            { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, marginRight: 8 },
  pillActive:      { backgroundColor: C.navy, borderColor: C.navy },
  pillTxt:         { fontSize: 13, color: C.grey, fontWeight: '600' },
  pillTxtActive:   { color: C.white },
});
