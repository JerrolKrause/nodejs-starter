import { Request, Router } from 'express';
import mongoose from 'mongoose';

export interface GenerateRestModel<SchemaModel> {
  path: string;
  primaryKey: keyof SchemaModel;
  schema: mongoose.Model<SchemaModel, {}, {}>;
}

type RequestParams<PrimaryKey extends string> = {
  [key in PrimaryKey]: string;
};

export const generateRestEndpoint = <SchemaModel extends object>(options: GenerateRestModel<SchemaModel>) => {
  const routes = Router();
  const pk = String(options.primaryKey);

  /** GET All */
  routes.get(options.path, (_req, res) => {
    options.schema.find({}, (err, todos) => {
      if (err) res.status(500).json({ message: 'An error occurred. ' + err });
      else res.json(todos);
    });
  });

  // GET One
  routes.get(`${options.path}/:${pk}`, (req, res) => {
    const id = req.params[pk];
    options.schema.findById(id, null, {}, (err, todo) => {
      if (err) res.status(500).json({ message: 'An error occurred. ' + err });
      else if (!todo) res.status(404).json({ message: 'Todo not found' });
      else res.json(todo);
    });
  });

  /** POST */
  routes.post(options.path, (req: Request<{}, {}, any>, res) => {
    const newTodo = new options.schema(req.body);
    newTodo.save(err => {
      if (err) res.status(500).json({ message: 'An error occurred. ' + err });
      else res.status(201).json({ _id: newTodo._id });
    });
  });

  /** PUT */
  routes.put(`${options.path}/:${pk}`, (req: Request<RequestParams<string>, {}, any>, res) => {
    const id = req.params[pk];
    options.schema.findByIdAndUpdate(id, req.body, { new: true }, (err, todo) => {
      if (err) res.status(500).json({ message: 'An error occurred. ' + err });
      else if (!todo) res.status(404).json({ message: 'Todo not found' });
      else res.send();
    });
  });

  /** DELETE */
  routes.delete(`${options.path}/:${pk}`, (req, res) => {
    const id = req.params[pk];
    options.schema.findByIdAndRemove(id, null, err => {
      if (err) res.status(500).json({ message: 'An error occurred. ' + err });
      else res.status(204).send();
    });
  });

  return routes;
};
