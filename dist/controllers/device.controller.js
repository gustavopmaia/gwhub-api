import { PrismaClient } from '@prisma/client';
import { errorMessage, successMessage } from "../utils/messages";
const prisma = new PrismaClient();
export const DeviceController = {
    create: async (req, res) => {
        try {
            const newDevice = await prisma.device.create({
                data: {
                    name: req.body.name,
                    description: req.body.description,
                    isActive: req.body.isActive === 1 ? true : false,
                }
            });
            res.status(201).send(successMessage("Dispositivo criado com sucesso!"));
        }
        catch (e) {
            res.status(400).send(errorMessage("Erro ao criar dispositivo", 3, "Erro"));
        }
    },
    getAll: async (_req, res) => {
        try {
            const devices = await prisma.device.findMany();
            res.status(200).send(devices);
        }
        catch (e) {
            res.status(400).send(errorMessage("Erro ao obter dispositivos", 3, "Erro"));
        }
    },
    getOne: async (req, res) => {
        const { id } = req.params;
        try {
            const device = await prisma.device.findUnique({
                where: { id: Number(id) },
            });
            if (!device) {
                return res.status(404).send(errorMessage("Dispositivo não encontrado", 2, "Erro"));
            }
            res.status(200).send(device);
        }
        catch (e) {
            res.status(400).send(errorMessage("Erro ao obter dispositivo", 3, "Erro"));
        }
    },
    update: async (req, res) => {
        const { id } = req.params;
        const { name, description, isActive } = req.body;
        try {
            const device = await prisma.device.findUnique({
                where: { id: Number(id) },
            });
            if (!device) {
                return res.status(404).send(errorMessage("Dispositivo não encontrado", 2, "Erro"));
            }
            const updatedDevice = await prisma.device.update({
                where: { id: Number(id) },
                data: {
                    name,
                    description,
                    isActive: isActive === 1 ? true : isActive === 0 ? false : false,
                },
            });
            res.status(200).send(successMessage("Dispositivo atualizado com sucesso!"));
        }
        catch (e) {
            res.status(400).send(errorMessage("Erro ao atualizar dispositivo", 3, "Erro"));
        }
    }
};
