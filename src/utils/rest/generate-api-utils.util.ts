import { Request } from 'express';

/**
 * Extract a model's parent ID from the request body in a typesafe fashion. Null if not found
 * @param req
 * @param parentIdProperty
 * @returns
 */
export const extractParentId = (req: Request<{}, {}, {}>, parentIdProperty?: string | number | symbol | null): string | null =>
  parentIdProperty ? (req as any)[parentIdProperty].trim() ?? null : null;
