import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OrgId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-org-id'] || request.user?.currentOrgId;
  },
);
