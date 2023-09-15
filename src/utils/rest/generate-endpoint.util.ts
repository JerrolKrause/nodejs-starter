import { Request, Router } from 'express';
import { extractParentId } from './generate-api-utils.util';
import { GenerateRestApiModel } from './generate-endpoint-model.util';

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
 * Generates RESTful endpoints for a given schema model, including GET, GET One, GET with Paging, POST, PUT, and DELETE operations.
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

  /** GET With Paging */
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

  /** GET One */
  routes.get(`${options.path}/:${pk}`, (req, res, next) => {
    const id = req.params[pk];

    options.model
      .findById(id)
      .then(model => {
        if (!model) {
          res.status(404).json({ message: 'Model not found' });
        } else {
          res.json(model);
        }
      })
      .catch(err => next(err));
  });

  /** POST */
  routes.post(options.path, (req: Request<{}, {}, {}>, res, next) => {
    // Check if parentID is specified, if so extract it from the request body
    const parentId = extractParentId(req, options.parentIdProperty);
    // Merge parentId into model if found
    const body = parentId ? { ...req.body, [options.parentIdProperty]: parentId } : req.body;
    const newModel = new options.model(body);
    newModel.save(err => {
      if (err) return next(err);
      else res.status(201).json({ _id: newModel._id });
    });
  });

  /** PUT */
  routes.put(`${options.path}/:${pk}`, (req: Request<RequestParams<string>, {}, {}>, res, next) => {
    const id = req.params[pk];
    // Check if parentID is specified, if so extract it from the request body
    const parentId = extractParentId(req, options.parentIdProperty);
    // Merge parentId into model if found
    // Always extract from token so the FE cannot modify this property
    const body = parentId ? { ...req.body, [options.parentIdProperty]: parentId } : req.body;
    options.model
      .findById(id)
      .then(model => {
        // If model to update not found, throw error
        if (!model) {
          res.status(404).json({ message: 'Model not found' });
          return;
          // If parentID is specified, confirm that this model belongs to that parent before allowing a save
        } else if (parentId && parentId !== model?.get(String(options.parentIdProperty))?.toString()) {
          res.status(401).json({ message: 'Saving not allowed' });
          return;
        }
        return model;
      })
      .then(model => model?.update(body)) // Perform update
      .then(() => res.send()) //
      .catch(err => next(err));
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
