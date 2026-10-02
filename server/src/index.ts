import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './db.js';
import { createToken, requireAuth } from './auth.js';
import { Task, User } from './models.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

app.get('/health', (_request, response) => response.json({ status: 'ok' }));

app.post('/auth/register', async (request, response) => {
  try {
    const email = String(request.body.email ?? '').trim().toLowerCase();
    const password = String(request.body.password ?? '');
    if (!email.includes('@') || password.length < 6) return response.status(400).json({ message: 'Valid email and a 6-character password are required' });
    const exists = await User.exists({ email });
    if (exists) return response.status(409).json({ message: 'An account already exists for this email' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });
    return response.status(201).json({ token: createToken(user.id), user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Unable to create account' });
  }
});

app.post('/auth/login', async (request, response) => {
  try {
    const email = String(request.body.email ?? '').trim().toLowerCase();
    const password = String(request.body.password ?? '');
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return response.status(401).json({ message: 'Invalid email or password' });
    return response.json({ token: createToken(user.id), user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Unable to log in' });
  }
});

app.get('/tasks', requireAuth, async (request, response) => {
  const tasks = await Task.find({ userId: request.userId }).sort({ completed: 1, dueAt: 1 });
  return response.json(tasks);
});

app.post('/tasks', requireAuth, async (request, response) => {
  const { title, description, dueAt, priority } = request.body;
  if (!title || !dueAt || !['low', 'medium', 'high'].includes(priority)) return response.status(400).json({ message: 'Title, dueAt, and valid priority are required' });
  const task = await Task.create({ userId: request.userId, title, description, dueAt, priority });
  return response.status(201).json(task);
});

app.patch('/tasks/:id', requireAuth, async (request, response) => {
  const task = await Task.findOneAndUpdate({ _id: request.params.id, userId: request.userId }, { $set: request.body }, { new: true, runValidators: true });
  if (!task) return response.status(404).json({ message: 'Task not found' });
  return response.json(task);
});

app.delete('/tasks/:id', requireAuth, async (request, response) => {
  const result = await Task.deleteOne({ _id: request.params.id, userId: request.userId });
  if (!result.deletedCount) return response.status(404).json({ message: 'Task not found' });
  return response.status(204).send();
});

connectDatabase().then(() => app.listen(port, () => console.log(`TaskFlow API running on port ${port}`))).catch(error => { console.error(error); process.exit(1); });
