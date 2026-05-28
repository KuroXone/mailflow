"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgId = void 0;
const common_1 = require("@nestjs/common");
exports.OrgId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-org-id'] || request.user?.currentOrgId;
});
//# sourceMappingURL=org.decorator.js.map