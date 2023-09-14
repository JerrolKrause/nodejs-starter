import mongoose, { Schema } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The email address of the user
 *         password:
 *           type: string
 *           description: The password for the user
 */

type Role = 'user' | 'admin';

/**
 * @interface IUser represents the structure of a user item.
 */
export interface IUser {
  _id?: string;
  email: string;
  password: string;
  // todos: ITodo[];
  role: Role;
}

/**
 * @const userSchema defines the schema for a user item.
 */
const userSchema: Schema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, required: true },
  /**
  todos: {
    type: Schema.Types.ObjectId,
    ref: 'Todo',
  },
  */
});

/**
 * @const User is the Mongoose model for a user item.
 */
export const User = mongoose.model<IUser>('User', userSchema);
