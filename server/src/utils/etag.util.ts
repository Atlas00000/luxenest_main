import { Request, Response } from 'express';
import { checkConditionalRequest, setETag, generateETag } from './cache-headers.util';

/**
 * Adds ETag support to a response handler
 * Checks If-None-Match header and returns 304 if content hasn't changed
 * @param req Express request object
 * @param res Express response object
 * @param data Data to generate ETag from
 * @returns true if 304 was sent (content unchanged), false otherwise
 */
export function handleETag(
  req: Request,
  res: Response,
  data: any
): boolean {
  const etag = generateETag(data);
  
  // Check if client has matching ETag
  if (checkConditionalRequest(req, res, etag)) {
    return true; // 304 Not Modified already sent
  }
  
  // Set ETag for future requests
  setETag(res, etag);
  return false;
}

/**
 * Wraps a controller function to add ETag support
 * @param controller Controller function
 * @returns Wrapped controller with ETag support
 */
export function withETag<T extends (...args: any[]) => Promise<any>>(
  controller: T
): T {
  return (async (...args: Parameters<T>) => {
    const [req, res, _next] = args as unknown as [Request, Response, any];
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json to add ETag
    res.json = function(body: any) {
      // Generate ETag from response body
      const etag = generateETag(body);
      
      // Check conditional request
      if (checkConditionalRequest(req, res, etag)) {
        return res; // 304 already sent
      }
      
      // Set ETag header
      setETag(res, etag);
      
      // Call original json method
      return originalJson(body);
    };
    
    // Call original controller
    return controller(...args);
  }) as T;
}

