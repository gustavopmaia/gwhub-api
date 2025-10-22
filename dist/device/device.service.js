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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const zod_1 = require("zod");
const deviceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'O nome é obrigatório'),
    description: zod_1.z.string().min(1, 'A descrição é obrigatória'),
    isActive: zod_1.z
        .union([zod_1.z.literal(1), zod_1.z.literal(0)])
        .refine((val) => val === 1 || val === 0, { message: 'isActive deve ser 1 ou 0' }),
});
let DeviceService = class DeviceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(body) {
        try {
            const parsed = deviceSchema.parse(body);
            await this.prisma.device.create({
                data: {
                    name: parsed.name,
                    description: parsed.description,
                    isActive: parsed.isActive === 1,
                },
            });
            return { ok: true };
        }
        catch (e) {
            if (e instanceof zod_1.z.ZodError) {
                return { ok: false, type: 'validation', detail: JSON.stringify(e.errors) };
            }
            return { ok: false, type: 'error' };
        }
    }
    async getAll() {
        return this.prisma.device.findMany();
    }
    async getOne(id) {
        return this.prisma.device.findUnique({ where: { id } });
    }
    async update(id, body) {
        try {
            const parsed = deviceSchema.parse(body);
            const exists = await this.prisma.device.findUnique({ where: { id } });
            if (!exists)
                return { ok: false, type: 'not_found' };
            await this.prisma.device.update({
                where: { id },
                data: {
                    name: parsed.name,
                    description: parsed.description,
                    isActive: parsed.isActive === 1 ? true : parsed.isActive === 0 ? false : false,
                },
            });
            return { ok: true };
        }
        catch (e) {
            if (e instanceof zod_1.z.ZodError) {
                return { ok: false, type: 'validation', detail: JSON.stringify(e.errors) };
            }
            return { ok: false, type: 'error' };
        }
    }
};
exports.DeviceService = DeviceService;
exports.DeviceService = DeviceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeviceService);
