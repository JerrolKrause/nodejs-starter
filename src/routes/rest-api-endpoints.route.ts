import { generateRestEndpoint } from '$utils';
import { todoRoutes } from '../utils/rest/todo.route';

/**
 * Model generate rest routes
 */
const restEndpointModels = [todoRoutes];

/**
 * All model generated rest routes
 */
export const restRoutes = restEndpointModels.map(m => generateRestEndpoint(m));
