import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, User } from '../types';

const KEYS = {
  user: '@taskflow/user',
  password: '@taskflow/password',
  tasks: '@taskflow/tasks',
};

export async function loadUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.user);
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function saveUser(user: User, password: string) {
  await Promise.all([
    AsyncStorage.setItem(KEYS.user, JSON.stringify(user)),
    AsyncStorage.setItem(KEYS.password, password),
  ]);
}

export async function checkPassword(password: string) {
  return (await AsyncStorage.getItem(KEYS.password)) === password;
}

export async function loadTasks(): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(KEYS.tasks);
  return raw ? (JSON.parse(raw) as Task[]) : [];
}

export async function saveTasks(tasks: Task[]) {
  await AsyncStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
}
