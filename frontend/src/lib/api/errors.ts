export class APIError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  requestId?: string;
  validationErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number = 500,
    options?: {
      code?: string;
      details?: unknown;
      requestId?: string;
      validationErrors?: Record<string, string>;
    }
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
    this.requestId = options?.requestId;
    this.validationErrors = options?.validationErrors;
  }
}

/**
 * Normalizes FastAPI and standard HTTP error responses into a predictable APIError format.
 */
export const normalizeError = (status: number, data: unknown, requestId?: string): APIError => {
  let message = 'An unexpected error occurred';
  let validationErrors: Record<string, string> | undefined = undefined;
  
  const safeData = (typeof data === 'object' && data !== null) ? (data as Record<string, unknown>) : {};
  const code = typeof safeData.code === 'string' ? safeData.code : undefined;

  if (status === 422 && Array.isArray(safeData.detail)) {
    // FastAPI Validation Error
    message = 'Validation failed';
    validationErrors = {};
    safeData.detail.forEach((err: unknown) => {
      const errorObj = err as Record<string, unknown>;
      // loc is usually ["body", "field_name", "nested_field"]
      const field = errorObj.loc && Array.isArray(errorObj.loc) ? errorObj.loc.join('.') : 'unknown';
      validationErrors![field] = typeof errorObj.msg === 'string' ? errorObj.msg : 'Invalid field';
    });
  } else if (typeof safeData.detail === 'string') {
    // Standard FastAPI error
    message = safeData.detail;
  } else if (typeof safeData.message === 'string') {
    // Generic Node/Express style error fallback
    message = safeData.message;
  } else if (status === 401) {
    message = 'Unauthorized';
  } else if (status === 403) {
    message = 'Forbidden';
  } else if (status === 404) {
    message = 'Not Found';
  } else if (status >= 500) {
    message = 'Internal Server Error';
  }

  return new APIError(message, status, {
    code,
    details: data,
    requestId,
    validationErrors,
  });
};

export const handleApiError = (error: unknown) => {
  let finalError = error;

  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Handle Network Errors (e.g., DNS failure, server down, CORS)
    finalError = new APIError('Network Error: Unable to reach the server. Please check your connection.', 0);
    console.error('[Network Error]:', (finalError as APIError).message);
  } else if (error instanceof APIError) {
    const status = error.status;
    
    // 401 Unauthorized
    if (status === 401) {
      console.warn('[401 Unauthorized]: User session may have expired.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    // 403 Forbidden
    else if (status === 403) {
      console.warn('[403 Forbidden]: Insufficient permissions to access this resource.');
    }
    // 404 Not Found
    else if (status === 404) {
      console.warn(`[404 Not Found]: The requested resource could not be found.`);
    }
    // 422 Unprocessable Entity (Validation)
    else if (status === 422) {
      console.warn('[422 Validation Error]: Invalid data submitted.', error.validationErrors);
    }
    // 429 Too Many Requests (Rate Limiting)
    else if (status === 429) {
      console.warn('[429 Rate Limit]: You are being rate limited. Please slow down.');
    }
    // 500+ Server Errors
    else if (status >= 500) {
      console.error(`[${status} Server Error]: An internal server error occurred. Request ID: ${error.requestId || 'N/A'}`);
    }
    // Catch-all
    else {
      console.error(`[API Error ${status}]: ${error.message}`, error.details);
    }
  } else if (error instanceof Error) {
    console.error('[Unknown Error]:', error.message);
  } else {
    console.error('[Unknown Error]:', error);
  }

  throw finalError;
};
