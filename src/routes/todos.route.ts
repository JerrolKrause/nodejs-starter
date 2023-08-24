import { Models } from '$models';
import { Router } from 'express';

let todos: Models.Todo[] = [];

export const todoRoutes = Router();

/** GET */
todoRoutes.get('/todo', (_req, res, _next) => {
  res.status(200).json({ todos });
});

/** POST */
todoRoutes.post('/todo', (req, res, _next) => {
  const newTodo: Models.Todo = {
    id: new Date().toISOString(),
    text: req.body.text,
  };
  todos.push(newTodo);
  res.status(201).json({ id: newTodo.id });
});

/** PUT */
todoRoutes.put('/todo/:todoId', (req, res, _next) => {
  const id = req.params.todoId;

  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex >= 0 && todos[todoIndex]?.id) {
    const updatedTodo: Models.Todo = {
      id: todos && todoIndex >= 0 && todoIndex < todos.length ? todos[todoIndex]!.id : undefined,
      text: req.body.text,
    };
    todos[todoIndex] = updatedTodo;
    return res.status(200).send();
  }
  return res.status(404).json({ message: 'Could not find TODO for this id' });
});

/** DELETE */
todoRoutes.delete('/todo/:todoId', (req, res, _next) => {
  const id = req.params.todoId;
  const todoIndex = todos.findIndex(t => t.id === id);
  if (todoIndex >= 0 && todos[todoIndex]?.id) {
    todos = todos.filter(t => t.id !== id);
    return res.status(200).send();
  }
  return res.status(404).json({ message: 'Could not find TODO for this id' });
});
