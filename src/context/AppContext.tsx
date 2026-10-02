import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Task, ThemeMode, User } from '../types';
import {
  clearSession,
  loadToken,
  loadTasks,
  loadTheme,
  loadUser,
  saveSession,
  saveTasks,
  saveTheme,
} from '../services/storage';
import { getThemeColors } from '../theme';
import { api } from '../services/api';

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
  logout: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
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
    Promise.all([loadUser(), loadTasks(), loadToken(), loadTheme()]).then(async ([storedUser, storedTasks, storedToken, storedTheme]) => {
      setUser(storedUser && storedToken ? storedUser : null);
      if (storedUser && storedToken) {
        try {
          setTasks(await api.listTasks(storedToken));
        } catch {
          setTasks(storedTasks);
        }
      } else {
        setTasks(storedTasks.length ? storedTasks : DEMO_TASKS);
      }
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
    try {
      const session = await api.register(email, password);
      await saveSession(session.user, session.token);
      setUser(session.user);
      setTasks([]);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to create account.';
    }
  }

  async function login(email: string, password: string) {
    try {
      const session = await api.login(email, password);
      await saveSession(session.user, session.token);
      setUser(session.user);
      setTasks(await api.listTasks(session.token));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to log in.';
    }
  }

  async function addTask(input: Omit<Task, 'id' | 'completed'>) {
    const token = await loadToken();
    if (!token) {
      setTasks(current => [{ ...input, id: `task-${Date.now()}`, completed: false }, ...current]);
      return;
    }
    const task = await api.createTask(token, input);
    setTasks(current => [task, ...current]);
  }

  async function toggleTask(id: string) {
    const currentTask = tasks.find(task => task.id === id);
    const token = await loadToken();
    if (!currentTask || !token) {
      setTasks(current => current.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
      return;
    }
    const updated = await api.updateTask(token, id, { completed: !currentTask.completed });
    setTasks(current => current.map(task => task.id === id ? updated : task));
  }

  async function deleteTask(id: string) {
    const token = await loadToken();
    if (!token) {
      setTasks(current => current.filter(task => task.id !== id));
      return;
    }
    await api.deleteTask(token, id);
    setTasks(current => current.filter(task => task.id !== id));
  }

  async function logout() {
    await clearSession();
    setUser(null);
    setTasks([]);
  }

  function setThemeMode(mode: ThemeMode) {
    setThemeModeState(mode);
    saveTheme(mode);
  }

  return (
    <AppContext.Provider value={{ user, tasks, ready, themeMode, isDark, colors: themeColors, setThemeMode, register, login, logout, addTask, toggleTask, deleteTask }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
