import mongoose, { Document, Schema } from 'mongoose';

/**
 * @interface ITodo represents the structure of a todo item.
 */
export interface Todo extends Document {
  title: string;
  description?: string;
  completed?: boolean;
  dueDate?: Date;
}

/**
 * @const todoSchema defines the schema for a todo item.
 */
const todoSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
});

/**
 * @const Todo is the Mongoose model for a todo item.
 */
export const Todo = mongoose.model<Todo>('Todo', todoSchema);
