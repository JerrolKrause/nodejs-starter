import mongoose, { Document, Schema } from 'mongoose';
/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the todo
 *         title:
 *           type: string
 *           description: The title of the todo
 *         description:
 *           type: string
 *           description: The description of the todo
 *         completed:
 *           type: boolean
 *           description: The completion status of the todo
 *           default: false
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: The due date of the todo
 */

/**
 * @interface ITodo represents the structure of a todo item.
 */
export interface ITodo extends Document {
  _id?: string;
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
export const Todo = mongoose.model<ITodo>('Todo', todoSchema);
