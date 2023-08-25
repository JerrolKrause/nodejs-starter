import { Todo } from '$models';
import { generateRestEndpoint, generateRestOptions } from '$utils';

/**
 * Model generate rest routes
 */
const restEndpointModels = [
  generateRestOptions({
    path: '/todo',
    primaryKey: '_id',
    model: Todo,
  }),
];

/**
 * All model generated rest routes
 */
export const restRoutes = restEndpointModels.map(m => generateRestEndpoint(m));
