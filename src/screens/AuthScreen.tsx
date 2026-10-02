import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme';

export function AuthScreen() {
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError('');
    if (!email.includes('@')) return setError('Enter a valid email address.');
    setBusy(true);
    const message = mode === 'login' ? await login(email, password) : await register(email, password);
    setBusy(false);
    if (message) setError(message);
  }

  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
    <View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>✓</Text></View><Text style={styles.kicker}>TASKFLOW</Text><Text style={styles.title}>Make room for{ '\n' }what matters.</Text><Text style={styles.subtitle}>A calm place to plan your day and finish the important things.</Text></View>
    <View style={styles.form}><Text style={styles.formTitle}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
      <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email address" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput secureTextEntry placeholder="Password" placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} style={styles.input} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable onPress={submit} disabled={busy} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>{busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}</Text></Pressable>
      <Pressable onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}><Text style={styles.switch}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}</Text></Pressable>
    </View>
  </KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, container: { flex: 1, padding: 28, justifyContent: 'space-between' },
  brand: { paddingTop: 42 }, mark: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }, markText: { color: colors.white, fontSize: 25, fontWeight: '800' }, kicker: { color: colors.green, fontFamily: fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 2 }, title: { color: colors.ink, fontFamily: fonts.display, fontSize: 39, fontWeight: '800', lineHeight: 44, marginTop: 12 }, subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 310 },
  form: { paddingBottom: 12 }, formTitle: { color: colors.ink, fontSize: 20, fontWeight: '700', marginBottom: 14 }, input: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 14, color: colors.ink, fontSize: 16, paddingHorizontal: 16, height: 54, marginBottom: 10 }, error: { color: colors.red, marginBottom: 10 }, button: { alignItems: 'center', backgroundColor: colors.green, borderRadius: 14, height: 54, justifyContent: 'center', marginTop: 4 }, pressed: { opacity: 0.8 }, buttonText: { color: colors.white, fontSize: 16, fontWeight: '800' }, switch: { color: colors.green, fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 18 },
});
