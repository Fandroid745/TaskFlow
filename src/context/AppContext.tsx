import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Task, ThemeMode, User } from '../types';
import {
  checkPassword,
  loadTasks,
  loadTheme,
  loadUser,
  saveTasks,
  saveUser,
  saveTheme,
} from '../services/storage';
import { getThemeColors } from '../theme';

const DEMO_TASKS: Task[] = [
  {
    id: 'demo-1',
    title: 'Review internship brief',
    description: 'Break the requirements into small, shippable milestones.',
    dueAt: new Date(Date.now() + 86400000).toISOString(),
    priority: 'high',
    completed: false,
  },
  {
    id: 'demo-2',
    title: 'Set up Android emulator',
    description: 'Check that Metro and the native build can connect locally.',
    dueAt: new Date(Date.now() + 172800000).toISOString(),
    priority: 'medium',
    completed: false,
  },
];

type AppContextValue = {
  user: User | null;
  tasks: Task[];
  ready: boolean;
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ReturnType<typeof getThemeColors>;
  setThemeMode: (mode: ThemeMode) => void;
  register: (email: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const themeColors = getThemeColors(isDark);

  useEffect(() => {
    Promise.all([loadUser(), loadTasks(), loadTheme()]).then(([storedUser, storedTasks, storedTheme]) => {
      setUser(storedUser);
      setTasks(storedTasks.length ? storedTasks : DEMO_TASKS);
      setThemeModeState(storedTheme);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) {
      saveTasks(tasks);
    }
  }, [tasks, ready]);

  async function register(email: string, password: string) {
    if (password.length < 6) return 'Password must be at least 6 characters.';
    const nextUser = { id: `user-${Date.now()}`, email: email.trim().toLowerCase() };
    await saveUser(nextUser, password);
    setUser(nextUser);
    return null;
  }

  async function login(email: string, password: string) {
    const storedUser = await loadUser();
    if (!storedUser || storedUser.email !== email.trim().toLowerCase()) {
      return 'No account found for this email.';
    }
    if (!(await checkPassword(password))) return 'The password is incorrect.';
    setUser(storedUser);
    return null;
  }

  function addTask(input: Omit<Task, 'id' | 'completed'>) {
    setTasks(current => [{ ...input, id: `task-${Date.now()}`, completed: false }, ...current]);
  }

  function toggleTask(id: string) {
    setTasks(current => current.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  }

  function deleteTask(id: string) {
    setTasks(current => current.filter(task => task.id !== id));
  }

  function setThemeMode(mode: ThemeMode) {
    setThemeModeState(mode);
    saveTheme(mode);
  }

  return (
    <AppContext.Provider value={{ user, tasks, ready, themeMode, isDark, colors: themeColors, setThemeMode, register, login, logout: () => setUser(null), addTask, toggleTask, deleteTask }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
