
import mongoose, { Document, Schema } from "mongoose";

/** Todo Schema */
const TodoSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
});

/** Todo Document */
export interface TodoDocument extends Document {
  title: string;
  description?: string;
  completed: boolean;
}

/** Todo Model */
const TodoModel = mongoose.model<TodoDocument>("Todo", TodoSchema);

export default TodoModel;
