import { Request, Router } from 'express';
import { ITodo, Todo } from './todos.model'; // Todo schema is defined in 'models/todo.ts'

const path = '/todo';
const primaryKey: keyof ITodo = 'id';

export const todoRoutes = Router();

/** GET All */
todoRoutes.get(path, (_req, res) => {
  Todo.find({}, (err, todos) => {
    if (err) res.status(500).json({ message: 'An error occurred. ' + err });
    else res.json(todos);
  });
});

// GET One
todoRoutes.get(`${path}/:${primaryKey}`, (req, res) => {
  const id = req.params[primaryKey];
  Todo.findById(id, null, {}, (err, todo) => {
    if (err) res.status(500).json({ message: 'An error occurred. ' + err });
    else if (!todo) res.status(404).json({ message: 'Todo not found' });
    else res.json(todo);
  });
});

/** POST */
todoRoutes.post(path, (req: Request<{}, {}, ITodo>, res) => {
  const newTodo = new Todo(req.body);
  newTodo.save(err => {
    if (err) res.status(500).json({ message: 'An error occurred. ' + err });
    else res.status(201).json({ _id: newTodo._id });
  });
});

/** PUT */
todoRoutes.put(`${path}/:${primaryKey}`, (req: Request<{ [primaryKey]: string }, {}, ITodo>, res) => {
  const id = req.params[primaryKey];
  Todo.findByIdAndUpdate(id, req.body, { new: true }, (err, todo) => {
    if (err) res.status(500).json({ message: 'An error occurred. ' + err });
    else if (!todo) res.status(404).json({ message: 'Todo not found' });
    else res.send();
  });
});

/** DELETE */
todoRoutes.delete(`${path}/:${primaryKey}`, (req, res) => {
  const id = req.params[primaryKey];
  Todo.findByIdAndRemove(id, null, err => {
    if (err) res.status(500).json({ message: 'An error occurred. ' + err });
    else res.status(204).send();
  });
});
