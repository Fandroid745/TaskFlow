import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme';
import { Priority, RootStackParamList, Task, ThemeMode } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;
type Filter = 'all' | 'active' | 'done';

const priorityColor: Record<Priority, string> = { high: colors.red, medium: colors.yellow, low: colors.blue };

function formatDue(date: string) {
  const value = new Date(date);
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const { colors: themeColors } = useApp();
  return <View style={[styles.task, { backgroundColor: themeColors.white, borderColor: themeColors.line }, task.completed && styles.taskDone]}><Pressable onPress={onToggle} style={[styles.check, task.completed && styles.checkDone]}><Text style={styles.checkText}>{task.completed ? '✓' : ''}</Text></Pressable><View style={styles.taskBody}><Text style={[styles.taskTitle, { color: themeColors.ink }, task.completed && styles.textDone]}>{task.title}</Text><Text numberOfLines={2} style={[styles.description, { color: themeColors.muted }, task.completed && styles.textDone]}>{task.description}</Text><View style={styles.meta}><View style={[styles.priority, { backgroundColor: priorityColor[task.priority] }]} /><Text style={[styles.metaText, { color: themeColors.muted }]}>{task.priority.toUpperCase()}  ·  {formatDue(task.dueAt)}</Text></View></View><Pressable accessibilityLabel="Delete task" onPress={onDelete} hitSlop={12}><Text style={[styles.delete, { color: themeColors.muted }]}>×</Text></Pressable></View>;
}

const modalStyles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(16, 24, 20, 0.4)', justifyContent: 'flex-end' },
  modalBackdropDark: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: 30 },
  sheetDark: { backgroundColor: '#1D2721' },
  sheetHandle: { alignSelf: 'center', backgroundColor: colors.line, borderRadius: 3, height: 5, marginBottom: 20, width: 42 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sheetEyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  sheetTitle: { color: colors.ink, fontSize: 28, fontWeight: '800', marginTop: 5 },
  close: { color: colors.muted, fontSize: 28, lineHeight: 28 },
  sectionLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.3, marginBottom: 9, marginTop: 28 },
  option: { alignItems: 'center', borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', marginBottom: 8, padding: 14 },
  optionDark: { borderColor: '#334239' },
  radio: { alignItems: 'center', borderColor: colors.muted, borderRadius: 12, borderWidth: 2, height: 22, justifyContent: 'center', marginRight: 12, width: 22 },
  radioSelected: { borderColor: colors.green },
  radioDot: { backgroundColor: colors.green, borderRadius: 6, height: 10, width: 10 },
  optionLabel: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  optionDetail: { color: colors.muted, fontSize: 12, marginTop: 3 },
  logout: { alignItems: 'center', borderColor: colors.red, borderRadius: 14, borderWidth: 1, marginTop: 20, paddingVertical: 14 },
  logoutText: { color: colors.red, fontSize: 15, fontWeight: '800' },
  darkText: { color: '#F2F5F2' },
  darkTextMuted: { color: '#A4B1AA' },
});

function SettingsModal({ visible, themeMode, onThemeChange, onLogout, onClose, isDark }: { visible: boolean; themeMode: ThemeMode; onThemeChange: (mode: ThemeMode) => void; onLogout: () => void; onClose: () => void; isDark: boolean }) {
  const options: { value: ThemeMode; label: string; detail: string }[] = [
    { value: 'system', label: 'System default', detail: 'Follow your phone settings' },
    { value: 'light', label: 'Light mode', detail: 'Bright TaskFlow surfaces' },
    { value: 'dark', label: 'Dark mode', detail: 'Easy on the eyes at night' },
  ];
  return <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}><View style={[modalStyles.modalBackdrop, isDark && modalStyles.modalBackdropDark]}><View style={[modalStyles.sheet, isDark && modalStyles.sheetDark]}><View style={modalStyles.sheetHandle} /><View style={modalStyles.sheetHeader}><View><Text style={[modalStyles.sheetEyebrow, isDark && modalStyles.darkTextMuted]}>PREFERENCES</Text><Text style={[modalStyles.sheetTitle, isDark && modalStyles.darkText]}>Settings</Text></View><Pressable accessibilityLabel="Close settings" onPress={onClose}><Text style={[modalStyles.close, isDark && modalStyles.darkTextMuted]}>×</Text></Pressable></View><Text style={[modalStyles.sectionLabel, isDark && modalStyles.darkTextMuted]}>APPEARANCE</Text>{options.map(option => <Pressable key={option.value} onPress={() => onThemeChange(option.value)} style={[modalStyles.option, isDark && modalStyles.optionDark]}><View style={[modalStyles.radio, themeMode === option.value && modalStyles.radioSelected]}>{themeMode === option.value && <View style={modalStyles.radioDot} />}</View><View><Text style={[modalStyles.optionLabel, isDark && modalStyles.darkText]}>{option.label}</Text><Text style={[modalStyles.optionDetail, isDark && modalStyles.darkTextMuted]}>{option.detail}</Text></View></Pressable>)}<Pressable onPress={onLogout} style={modalStyles.logout}><Text style={modalStyles.logoutText}>Log out</Text></Pressable></View></View></Modal>;
}

export function TasksScreen({ navigation }: Props) {
  const { user, tasks, toggleTask, deleteTask, logout, themeMode, setThemeMode, isDark, colors: themeColors } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const visible = useMemo(() => tasks.filter(task => filter === 'all' || (filter === 'active' ? !task.completed : task.completed)).sort((a, b) => Number(a.completed) - Number(b.completed) || new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()), [tasks, filter]);
  const done = tasks.filter(task => task.completed).length;

  return <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.paper }]}><View style={styles.container}><View style={styles.header}><View><Text style={styles.eyebrow}>YOUR SPACE</Text><Text style={[styles.heading, { color: themeColors.ink }]}>Good to see you,</Text><Text style={[styles.email, { color: themeColors.muted }]}>{user?.email}</Text></View><Pressable accessibilityLabel="Open settings" onPress={() => setSettingsVisible(true)} style={styles.avatar}><Text style={styles.avatarText}>⚙</Text></Pressable></View><View style={styles.summary}><View><Text style={styles.summaryNumber}>{tasks.length - done}</Text><Text style={styles.summaryLabel}>open tasks</Text></View><View style={styles.summaryDivider} /><View><Text style={styles.summaryNumber}>{done}</Text><Text style={styles.summaryLabel}>completed</Text></View><Pressable onPress={() => navigation.navigate('AddTask')} style={styles.add}><Text style={styles.addText}>＋</Text></Pressable></View><View style={styles.filters}>{(['all', 'active', 'done'] as Filter[]).map(item => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, { color: themeColors.muted }, filter === item && styles.filterTextActive]}>{item === 'all' ? 'Everything' : item === 'active' ? 'In progress' : 'Done'}</Text></Pressable>)}</View><FlatList data={visible} keyExtractor={item => item.id} renderItem={({ item }) => <TaskRow task={item} onToggle={() => toggleTask(item.id)} onDelete={() => deleteTask(item.id)} />} ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyTitle, { color: themeColors.ink }]}>Nothing here yet</Text><Text style={[styles.emptyText, { color: themeColors.muted }]}>Add a task and give your next win a shape.</Text></View>} contentContainerStyle={visible.length ? styles.list : styles.emptyList} showsVerticalScrollIndicator={false} /><SettingsModal visible={settingsVisible} themeMode={themeMode} onThemeChange={setThemeMode} onLogout={() => { setSettingsVisible(false); logout(); }} onClose={() => setSettingsVisible(false)} isDark={isDark} /></View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.paper }, container: { flex: 1, paddingHorizontal: 22 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, paddingBottom: 22 }, eyebrow: { color: colors.green, fontSize: 11, fontWeight: '800', letterSpacing: 1.7 }, heading: { color: colors.ink, fontFamily: fonts.display, fontSize: 28, fontWeight: '800', marginTop: 4 }, email: { color: colors.muted, fontSize: 14, marginTop: 2 }, avatar: { backgroundColor: colors.greenSoft, borderRadius: 20, width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.green, fontWeight: '800', fontSize: 17 }, summary: { backgroundColor: colors.green, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' }, summaryNumber: { color: colors.white, fontSize: 29, fontWeight: '800' }, summaryLabel: { color: '#CBE7D8', fontSize: 12, marginTop: 2 }, summaryDivider: { height: 38, width: 1, backgroundColor: '#71AC8D', marginHorizontal: 22 }, add: { marginLeft: 'auto', backgroundColor: colors.white, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, addText: { color: colors.green, fontSize: 28, lineHeight: 30 }, filters: { flexDirection: 'row', paddingVertical: 20, gap: 8 }, filter: { borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9 }, filterActive: { backgroundColor: colors.ink }, filterText: { color: colors.muted, fontSize: 13, fontWeight: '700' }, filterTextActive: { color: colors.white }, list: { paddingBottom: 24 }, task: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: colors.line }, taskDone: { opacity: 0.65 }, check: { borderColor: colors.green, borderWidth: 2, borderRadius: 8, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1 }, checkDone: { backgroundColor: colors.green }, checkText: { color: colors.white, fontWeight: '900' }, taskBody: { flex: 1 }, taskTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' }, description: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4 }, textDone: { textDecorationLine: 'line-through' }, meta: { flexDirection: 'row', alignItems: 'center', marginTop: 12 }, priority: { width: 7, height: 7, borderRadius: 4, marginRight: 7 }, metaText: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 }, delete: { color: colors.muted, fontSize: 24, lineHeight: 20, paddingLeft: 10 }, emptyList: { flexGrow: 1, justifyContent: 'center' }, empty: { alignItems: 'center', padding: 30 }, emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' }, emptyText: { color: colors.muted, textAlign: 'center', marginTop: 7, lineHeight: 20 },
});
