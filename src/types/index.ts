export type Priority = 'low' | 'medium' | 'high';
export type ThemeMode = 'system' | 'light' | 'dark';

export type Task = {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  priority: Priority;
  completed: boolean;
};

export type User = {
  id: string;
  email: string;
};

export type RootStackParamList = {
  Tasks: undefined;
  AddTask: undefined;
};
