import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Account Decorator
 */
export const GetAccount = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.account;
});

/**
 * User Decorator
 */
export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

/**
 * Admin Decorator
 */
export const GetAdmin = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.admin;
});
