import { Priority, Task, User } from '../types';

// Android emulator reaches the host machine through 10.0.2.2. Change this for a physical phone.
export const API_BASE_URL = 'http://10.0.2.2:4000';

type AuthResponse = { token: string; user: User };

type RequestOptions = { token?: string; method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(payload.message ?? 'The API request failed');
  }
  return response.status === 204 ? (undefined as T) : (await response.json()) as T;
}

export const api = {
  register: (email: string, password: string) => request<AuthResponse>('/auth/register', { method: 'POST', body: { email, password } }),
  login: (email: string, password: string) => request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  listTasks: (token: string) => request<Task[]>('/tasks', { token }),
  createTask: (token: string, task: Omit<Task, 'id' | 'completed'>) => request<Task>('/tasks', { method: 'POST', token, body: task }),
  updateTask: (token: string, id: string, changes: Partial<Task>) => request<Task>(`/tasks/${id}`, { method: 'PATCH', token, body: changes }),
  deleteTask: (token: string, id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE', token }),
};

export type ApiPriority = Priority;
