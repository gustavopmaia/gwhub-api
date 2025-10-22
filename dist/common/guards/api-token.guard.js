"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTokenGuard = void 0;
const common_1 = require("@nestjs/common");
const DEFAULT_TOKEN = '8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c';
let ApiTokenGuard = class ApiTokenGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const token = (req.headers?.authorization || req.headers?.Authorization);
        const expected = process.env.API_AUTH_TOKEN || DEFAULT_TOKEN;
        const ok = token === expected;
        if (!ok) {
            // Preserve original error shape (401 + errorMessage)
            throw new common_1.HttpException({ message: 'Authorization error', statusCode: 2, error: undefined }, 401);
        }
        return true;
    }
};
exports.ApiTokenGuard = ApiTokenGuard;
exports.ApiTokenGuard = ApiTokenGuard = __decorate([
    (0, common_1.Injectable)()
], ApiTokenGuard);
