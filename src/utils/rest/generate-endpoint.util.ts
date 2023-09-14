import { Request, Router } from 'express';
import mongoose from 'mongoose';

/**
 * Interface representing the configuration options needed to generate RESTful API endpoints for a specific Mongoose schema model.
 *
 * @template SchemaModel The Mongoose schema model type used to define the structure of the documents within the collection.
 */
export interface GenerateRestApiModel<SchemaModel> {
  /**
   * The base path for the REST endpoints. All the generated endpoints (GET, POST, PUT, DELETE) will use this path as the base URL.
   *
   * @example '/todos'
   */
  path: string;

  /**
   * The key to use as the primary key for the model. This key should be a unique identifier for documents within the collection and must be one of the keys of the SchemaModel.
   *
   * @example '_id'
   */
  primaryKey: keyof SchemaModel;

  /**
   * The Mongoose model that defines the model and provides methods for querying and manipulating the collection.
   *
   * @example mongoose.model('Todo', new mongoose.Schema({ title: String }))
   */
  model: mongoose.Model<SchemaModel, {}, {}>;
}

interface PagedResponse<T> {
  totalRecords: number;
  page: number;
  limit: number;
  results: T[];
  sortProp?: string | null;
  sortOrder?: string | null;
}

type RequestParams<PrimaryKey extends string> = {
  [key in PrimaryKey]: string;
};

/**
 * Generates REST API options for a given schema model. Used to generate typesafe rest endpoints with generateRestEndpoint method
 *
 * @template SchemaModel The Mongoose schema model type used to define the structure of the documents within the collection.
 * @param {GenerateRestApiModel<SchemaModel>} options An object containing the necessary options to generate the REST API.
 * @param {string} options.path The base path for the REST endpoints.
 * @param {keyof SchemaModel} options.primaryKey The key to use as the primary key for the model. This key should be a unique identifier for documents within the collection.
 * @param {mongoose.Model<SchemaModel, {}, {}>} options.model The Mongoose model that defines the model and provides methods for querying and manipulating the collection.
 * @returns {GenerateRestApiModel<SchemaModel>} The original options object, unchanged. This return is useful for chaining or other further configuration.
 * @example
 * const todoSchema = new mongoose.Schema({ title: String });
 * const todoModel = mongoose.model('Todo', todoSchema);
 * const options = generateRestOptions({ path: '/todos', primaryKey: 'id', model: todoModel });
 */
export const generateRestOptions = <SchemaModel>(options: GenerateRestApiModel<SchemaModel>) => options;

/**
 * Generates RESTful endpoints for a given schema model, including GET, POST, PUT, and DELETE operations.
 *
 * @template SchemaModel The Mongoose schema model type used to define the structure of the documents within the collection. This must extend an object.
 * @param {GenerateRestApiModel<SchemaModel>} options An object containing the necessary options to generate the REST API.
 * @param {string} options.path The base path for the REST endpoints.
 * @param {keyof SchemaModel} options.primaryKey The key to use as the primary key for the model. This key should be a unique identifier for documents within the collection.
 * @param {mongoose.Model<SchemaModel, {}, {}>} options.model The Mongoose model that defines the model and provides methods for querying and manipulating the collection.
 * @returns {Router} A Router object containing the generated endpoints. This can be used with an Express application to handle requests for the specified paths.
 *
 * @example
 * const todoSchema = new mongoose.Schema({ title: String });
 * const todoModel = mongoose.model('Todo', todoSchema);
 * const todoRoutes = generateRestEndpoint({ path: '/todos', primaryKey: 'id', model: todoModel });
 * app.use(todoRoutes);
 */
export const generateRestEndpoint = <SchemaModel extends object>(options: GenerateRestApiModel<SchemaModel>) => {
  const routes = Router();
  const pk = String(options.primaryKey);

  /** GET All */
  routes.get(options.path, (_req, res, next) => {
    options.model
      .find({})
      .then(model => res.json(model))
      .catch(err => next(err));
  });

  /** GET with paging */
  routes.get(options.path + `/paging`, (req, res, next) => {
    // Ensure number
    const convert2Num = (val?: unknown) => (val ? Number(val) : null);

    // Paging values
    const page = convert2Num(req.query?.['page']) ?? 1;
    const limit = convert2Num(req.query?.['limit']) ?? 20;
    const sortProp = (req.query?.['sortProp'] as string) ?? null;
    const sortOrder = (req.query?.['sortOrder'] as string) ?? 'ASC';
    let totalRecords = 0;

    // Paging specified, return paged results
    options.model
      .countDocuments()
      .then((count: number) => {
        totalRecords = count;
        const query = options.model.find({});

        if (page && limit) {
          query.skip((page - 1) * limit).limit(limit);
        }

        if (sortProp) {
          query.sort({ [sortProp]: sortOrder.toUpperCase() === 'ASC' ? 1 : -1 });
        }

        return query.exec();
      })
      .then(results => {
        // Set up default response
        const response: PagedResponse<unknown> = {
          totalRecords,
          page,
          limit,
          results,
        };

        // If sort prop and order are present, add to response
        if (sortProp !== null && sortProp !== undefined) {
          response.sortProp = sortProp;
        }

        if (response.sortProp && sortOrder !== null && sortOrder !== undefined) {
          response.sortOrder = sortOrder;
        }

        res.json(response);
      })
      .catch((err: any) => next(err));
  });

  // GET One
  routes.get(`${options.path}/:${pk}`, async (req, res, next) => {
    const id = req.params[pk];
    try {
      const model = await options.model.findById(id);
      if (!model) {
        res.status(404).json({ message: 'Entity not found' });
      } else {
        res.json(model);
      }
    } catch (err) {
      next(err);
    }
  });

  /** POST */
  routes.post(options.path, (req: Request<{}, {}, {}>, res, next) => {
    const newTodo = new options.model(req.body);
    newTodo.save(err => {
      if (err) return next(err);
      else res.status(201).json({ _id: newTodo._id });
    });
  });

  /** PUT */
  routes.put(`${options.path}/:${pk}`, (req: Request<RequestParams<string>, {}, {}>, res, next) => {
    const id = req.params[pk];
    options.model.findByIdAndUpdate(id, req.body, { new: true }, (err, model) => {
      if (err) return next(err);
      else if (!model) res.status(404).json({ message: 'Entity not found' });
      else res.send();
    });
  });

  /** DELETE */
  routes.delete(`${options.path}/:${pk}`, (req, res, next) => {
    const id = req.params[pk];
    options.model.findByIdAndRemove(id, null, err => {
      if (err) return next(err);
      else res.status(204).send();
    });
  });

  return routes;
};
