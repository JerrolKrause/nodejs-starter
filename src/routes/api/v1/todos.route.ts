import { Models } from '$models';
import { Request, Router } from 'express';

const route = '/todo';

let todos: Models.Todo[] = [];

export const todoRoutes = Router();

/** GET */
todoRoutes.get(route, (_req, res, _next) => {
  res.status(200).json({ todos });
});

/** POST */ //  res: Response<Partial<Models.Todo>>
todoRoutes.post(route, (req: Request<{}, {}, Models.Todo>, res, _next) => {
  const newTodo: Models.Todo = {
    id: new Date().toISOString(),
    text: req.body.text,
  };
  try {
    todos.push(newTodo);
    return res.status(201).json({ id: newTodo.id });
  } catch (error) {
    return res.status(404).json({ message: 'Could not find TODO for this id' });
  }
});

/** PUT */
todoRoutes.put(`${route}/:todoId`, (req, res, _next) => {
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
todoRoutes.delete(`${route}/:todoId`, (req, res, _next) => {
  const id = req.params.todoId;
  const todoIndex = todos.findIndex(t => t.id === id);
  if (todoIndex >= 0 && todos[todoIndex]?.id) {
    todos = todos.filter(t => t.id !== id);
    return res.status(200).send();
  }
  return res.status(404).json({ message: 'Could not find TODO for this id' });
});
