import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

const taskSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  dueAt: { type: Date, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

taskSchema.index({ userId: 1, completed: 1, dueAt: 1 });

export const User = mongoose.model('User', userSchema);
export const Task = mongoose.model('Task', taskSchema);
