import { errorMessage, successMessage } from "../utils/messages";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { sendBasicNotification } from "../services/notification.service";
const prisma = new PrismaClient();
const notificationSchema = z.object({
    userCEP: z.string().min(1, "O CEP é obrigatório"),
    fcmToken: z.string().min(1, "A identificação de dispositivo é obrigatória"),
});
export const NotificationController = {
    addUser: async (req, res) => {
        const token = req.headers["authorization"];
        if (token !==
            "8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c") {
            return res.status(401).send(errorMessage("Authorization error", 2));
            z;
        }
        try {
            const parsedBody = notificationSchema.parse(req.body);
            const newDevice = await prisma.notification.create({
                data: {
                    userCEP: parsedBody.userCEP,
                    fcmToken: parsedBody.fcmToken,
                },
            });
            res
                .status(201)
                .send(successMessage("Usuário de notificação criado com sucesso!"));
        }
        catch (e) {
            if (e instanceof z.ZodError) {
                return res
                    .status(400)
                    .send(errorMessage("Erro de validação", 3, e.errors));
            }
            res
                .status(400)
                .send(errorMessage("Erro ao cadastrar usuário de notificação", 3, "Erro"));
        }
    },
    sendNotification: async (req, res) => {
        const token = req.headers["authorization"];
        if (token !==
            "8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c") {
            return res.status(401).send(errorMessage("Authorization error", 2));
            z;
        }
        try {
            const users = await prisma.notification.findMany();
            await sendBasicNotification(users.map((e) => e.fcmToken));
        }
        catch (e) {
            if (e instanceof z.ZodError) {
                return res
                    .status(400)
                    .send(errorMessage("Erro de validação", 3, e.errors));
            }
            res
                .status(400)
                .send(errorMessage("Erro ao enviar notificação", 3, "Erro"));
        }
    },
};
