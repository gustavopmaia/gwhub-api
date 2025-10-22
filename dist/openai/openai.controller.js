"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiController = void 0;
const common_1 = require("@nestjs/common");
const api_token_guard_1 = require("../common/guards/api-token.guard");
const zod_1 = __importDefault(require("zod"));
const messages_1 = require("../utils/messages");
const openai_service_1 = require("./openai.service");
let OpenAiController = class OpenAiController {
    openai;
    constructor(openai) {
        this.openai = openai;
    }
    async alexa(body, res) {
        const requestBody = zod_1.default.object({ fala: zod_1.default.string() });
        const validation = requestBody.safeParse(body);
        if (!validation.success) {
            const errors = validation.error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }));
            const formattedErrors = errors.map((err) => `${err.path}: ${err.message}`).join(', ');
            return res.status(400).send((0, messages_1.errorMessage)('Validation error', 1, formattedErrors));
        }
        const response = await this.openai.askAlexa(validation.data.fala);
        return res.status(200).send((0, messages_1.successMessage)(response));
    }
};
exports.OpenAiController = OpenAiController;
__decorate([
    (0, common_1.Post)('alexa'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OpenAiController.prototype, "alexa", null);
exports.OpenAiController = OpenAiController = __decorate([
    (0, common_1.UseGuards)(api_token_guard_1.ApiTokenGuard),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [openai_service_1.OpenAiNestService])
], OpenAiController);
