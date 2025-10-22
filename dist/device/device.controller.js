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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceController = void 0;
const common_1 = require("@nestjs/common");
const device_service_1 = require("./device.service");
const api_token_guard_1 = require("../common/guards/api-token.guard");
const messages_1 = require("../utils/messages");
let DeviceController = class DeviceController {
    deviceService;
    constructor(deviceService) {
        this.deviceService = deviceService;
    }
    async create(body, res) {
        const result = await this.deviceService.create(body);
        if (result.ok)
            return res.status(201).send((0, messages_1.successMessage)('Dispositivo criado com sucesso!'));
        if (result.type === 'validation')
            return res.status(400).send((0, messages_1.errorMessage)('Erro de validação', 3, result.detail));
        return res.status(400).send((0, messages_1.errorMessage)('Erro ao criar dispositivo', 3, 'Erro'));
    }
    async getAll(res) {
        const devices = await this.deviceService.getAll();
        return res.status(200).send(devices);
    }
    async getOne(id, res) {
        const device = await this.deviceService.getOne(id);
        if (!device)
            return res.status(404).send((0, messages_1.errorMessage)('Dispositivo não encontrado', 2, 'Erro'));
        return res.status(200).send(device);
    }
    async update(id, body, res) {
        const result = await this.deviceService.update(id, body);
        if (result.ok)
            return res.status(200).send((0, messages_1.successMessage)('Dispositivo atualizado com sucesso!'));
        if (result.type === 'not_found')
            return res.status(404).send((0, messages_1.errorMessage)('Dispositivo não encontrado', 2, 'Erro'));
        if (result.type === 'validation')
            return res.status(400).send((0, messages_1.errorMessage)('Erro de validação', 3, result.detail));
        return res.status(400).send((0, messages_1.errorMessage)('Erro ao atualizar dispositivo', 3, 'Erro'));
    }
};
exports.DeviceController = DeviceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "getOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "update", null);
exports.DeviceController = DeviceController = __decorate([
    (0, common_1.UseGuards)(api_token_guard_1.ApiTokenGuard),
    (0, common_1.Controller)('api/device'),
    __metadata("design:paramtypes", [device_service_1.DeviceService])
], DeviceController);
