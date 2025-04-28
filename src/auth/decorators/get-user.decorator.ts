import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Retrieves the user object attached to the request by the JwtAuthGuard/JwtStrategy.
 * Assumes the validate method in JwtStrategy returns an object like { userId: number, email: string, name: string }.
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
