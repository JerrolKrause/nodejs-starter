import { generateRestEndpoint, generateRestOptions } from '../../../utils/generate-rest-endpoint.util';
import { Todo } from './todos/todos.model';

const restEndpointModels = [
  generateRestOptions({
    path: '/todos',
    primaryKey: '_id',
    schema: Todo,
  }),
];

export const restRoutes = restEndpointModels.map(m => generateRestEndpoint(m));
