import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme';
import { Priority, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;

export function AddTaskScreen({ navigation }: Props) {
  const { addTask } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [error, setError] = useState('');

  function save() {
    if (!title.trim()) return setError('Give your task a title.');
    const parsed = new Date(`${date || '2099-12-31'}T${time || '18:00'}`);
    if (Number.isNaN(parsed.getTime())) return setError('Use date format YYYY-MM-DD and time HH:MM.');
    addTask({ title: title.trim(), description: description.trim() || 'No description added.', dueAt: parsed.toISOString(), priority });
    navigation.goBack();
  }

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.container}><Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹  Back to tasks</Text></Pressable><Text style={styles.eyebrow}>NEW TASK</Text><Text style={styles.heading}>What needs your{ '\n' }attention?</Text><Text style={styles.helper}>Make it clear enough that future-you knows exactly where to begin.</Text><Text style={styles.label}>TITLE</Text><TextInput autoFocus placeholder="e.g. Prepare presentation" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle} style={styles.input} /><Text style={styles.label}>DESCRIPTION</Text><TextInput multiline placeholder="A little context goes a long way" placeholderTextColor={colors.muted} value={description} onChangeText={setDescription} style={[styles.input, styles.multiline]} /><Text style={styles.label}>DEADLINE</Text><View style={styles.row}><TextInput placeholder="YYYY-MM-DD" placeholderTextColor={colors.muted} value={date} onChangeText={setDate} style={[styles.input, styles.half]} /><TextInput placeholder="HH:MM" placeholderTextColor={colors.muted} value={time} onChangeText={setTime} style={[styles.input, styles.half]} /></View><Text style={styles.label}>PRIORITY</Text><View style={styles.row}>{(['low', 'medium', 'high'] as Priority[]).map(item => <Pressable key={item} onPress={() => setPriority(item)} style={[styles.priority, priority === item && styles.priorityActive]}><Text style={[styles.priorityText, priority === item && styles.priorityTextActive]}>{item}</Text></Pressable>)}</View>{!!error && <Text style={styles.error}>{error}</Text>}<Pressable onPress={save} style={styles.button}><Text style={styles.buttonText}>Add to my list</Text></Pressable></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.paper }, container: { padding: 22, paddingBottom: 40 }, back: { color: colors.green, fontSize: 15, fontWeight: '800', marginBottom: 34 }, eyebrow: { color: colors.green, fontSize: 11, fontWeight: '800', letterSpacing: 1.7 }, heading: { color: colors.ink, fontFamily: fonts.display, fontSize: 32, lineHeight: 37, fontWeight: '800', marginTop: 8 }, helper: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 12, marginBottom: 30 }, label: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.3, marginBottom: 8, marginTop: 12 }, input: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 13, color: colors.ink, fontSize: 15, height: 52, paddingHorizontal: 15 }, multiline: { height: 98, paddingTop: 14, textAlignVertical: 'top' }, row: { flexDirection: 'row', gap: 9 }, half: { flex: 1 }, priority: { flex: 1, borderColor: colors.line, borderWidth: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: colors.white }, priorityActive: { borderColor: colors.ink, backgroundColor: colors.ink }, priorityText: { color: colors.muted, fontWeight: '700', textTransform: 'capitalize' }, priorityTextActive: { color: colors.white }, error: { color: colors.red, marginTop: 15 }, button: { alignItems: 'center', backgroundColor: colors.green, borderRadius: 14, height: 54, justifyContent: 'center', marginTop: 27 }, buttonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
