/**
 * Analysis Rate Limit Guard
 * Phase 7: API Endpoints
 *
 * Prevents abuse by limiting analysis requests per user
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RateLimitState {
  count: number;
  resetAt: number;
}

@Injectable()
export class AnalysisRateLimitGuard implements CanActivate {
  private readonly analyses = new Map<string, RateLimitState>();

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request.user as any)?.sub;

    if (!userId) {
      return false;
    }

    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxRequests = 10;

    const userState = this.analyses.get(userId);

    if (!userState || now > userState.resetAt) {
      this.analyses.set(userId, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (userState.count >= maxRequests) {
      const resetDate = new Date(userState.resetAt);
      throw new HttpException(
        `Rate limit exceeded: ${maxRequests} analyses per hour. Resets at ${resetDate.toISOString()}`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    userState.count++;
    return true;
  }
}
