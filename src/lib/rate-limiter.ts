/**
 * Rate Limiting Implementation
 * @rule 009 "Security considerations for abuse prevention"
 * @rule 060 "API standards for rate limiting"
 * @rule 105 "TypeScript strict typing"
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>();

  /**
   * Check if request is within rate limit
   */
  check(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    // No previous record or window expired
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    // Within window, check if over limit
    if (record.count >= limit) {
      return false;
    }

    // Increment count
    record.count++;
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string, limit: number): number {
    const record = this.attempts.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return limit;
    }
    return Math.max(0, limit - record.count);
  }

  /**
   * Get reset time for identifier
   */
  getResetTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    return record?.resetTime || Date.now();
  }

  /**
   * Clear rate limit for identifier (for testing)
   */
  clear(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Rate limit configurations
export const RATE_LIMITS = {
  OTP_REQUEST: { requests: 5, windowMs: 60 * 1000 }, // 5 per minute
  OTP_VERIFY: { requests: 10, windowMs: 60 * 1000 }, // 10 per minute
  ADMIN_LOGIN: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
  SURVEY_SUBMIT: { requests: 1, windowMs: 60 * 60 * 1000 }, // 1 per hour
  ADMIN_API: { requests: 100, windowMs: 60 * 1000 }, // 100 per minute
} as const;

// Global rate limiter instances
export const otpRateLimiter = new RateLimiter();
export const adminRateLimiter = new RateLimiter();
export const surveyRateLimiter = new RateLimiter();

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: Request): string {
  // Use IP address if available, fallback to user agent
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return ip;
}

/**
 * Apply rate limiting to API route
 */
export function withRateLimit(
  rateLimiter: RateLimiter,
  config: { requests: number; windowMs: number }
) {
  return (handler: Function) => {
    return async (request: Request, ...args: any[]) => {
      const identifier = getClientIdentifier(request);
      
      if (!rateLimiter.check(identifier, config.requests, config.windowMs)) {
        console.log('🚫 Rate limit exceeded for:', identifier);
        
        return new Response(
          JSON.stringify({
            error: 'Too many requests',
            retryAfter: Math.ceil((rateLimiter.getResetTime(identifier) - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((rateLimiter.getResetTime(identifier) - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': config.requests.toString(),
              'X-RateLimit-Remaining': rateLimiter.getRemaining(identifier, config.requests).toString(),
              'X-RateLimit-Reset': rateLimiter.getResetTime(identifier).toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = await handler(request, ...args);
      
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Limit', config.requests.toString());
        response.headers.set('X-RateLimit-Remaining', rateLimiter.getRemaining(identifier, config.requests).toString());
        response.headers.set('X-RateLimit-Reset', rateLimiter.getResetTime(identifier).toString());
      }

      return response;
    };
  };
}
