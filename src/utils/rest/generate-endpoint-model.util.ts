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

  /**
   * Should this route require authentication?
   *
   * @example true
   */
  isAuth?: boolean;

  /**
   * If this model has a parent (including a user), specify the property in the request body that contains the unique ID of the parent to associate with this model.
   *
   * The ID will be extracted from the request body so ensure that the authentication middleware sets this property.
   *
   * @example 'userId'
   */
  parentIdProperty: keyof SchemaModel;
}

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
