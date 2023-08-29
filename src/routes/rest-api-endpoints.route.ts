import { generateRestEndpoint } from '$utils';
import { todoRoutes } from './todo.route';

/**
 * Options for model generating rest routes
 */
const restEndpointModels = [todoRoutes];

/**
 * REST routes dynamically generated
 */
export const restRoutes = restEndpointModels.map(m => generateRestEndpoint(m));
