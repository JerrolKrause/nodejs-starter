import { Todo } from '$models';
import { generateRestOptions } from '$utils';

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: Todo management
 *
 * paths:
 *   /api/v1/todo:
 *     get:
 *       tags: [Todos]
 *       summary: Get all todos
 *       responses:
 *         '200':
 *           description: List of todos
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Todo'
 *     post:
 *       tags: [Todos]
 *       summary: Create a new todo
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       responses:
 *         '201':
 *           description: Todo created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Todo'
 *   /api/v1/todo/paging:
 *     get:
 *       tags: [Todos]
 *       summary: Retrieve a paged list of items
 *       parameters:
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             default: 1
 *           description: The page to retrieve
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             default: 20
 *           description: Number of records per page
 *         - in: query
 *           name: sort
 *           schema:
 *             type: string
 *           description: Property to sort by
 *         - in: query
 *           name: order
 *           schema:
 *             type: string
 *             enum: [ASC, DESC]
 *             default: ASC
 *           description: Sort order
 *       responses:
 *         '200':
 *           description: Successful operation
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Todo'
 *         '400':
 *           description: Invalid request
 *         '500':
 *           description: Internal server error
 *   /api/v1/todo/{id}:
 *     get:
 *       tags: [Todos]
 *       summary: Get a todo by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: The ID of the todo
 *       responses:
 *         '200':
 *           description: Todo found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Todo'
 *     put:
 *       tags: [Todos]
 *       summary: Update a todo by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: The ID of the todo
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       responses:
 *         '200':
 *           description: Todo updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Todo'
 *     delete:
 *       tags: [Todos]
 *       summary: Delete a todo by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: The ID of the todo to delete
 *       responses:
 *         '204':
 *           description: Todo deleted successfully
 */
export const todoRoutes = generateRestOptions({
  path: '/todo',
  primaryKey: '_id',
  model: Todo,
  isAuth: true,
  parentIdProperty: 'userId',
});
