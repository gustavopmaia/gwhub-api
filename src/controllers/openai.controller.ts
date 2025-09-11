import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { errorMessage, successMessage } from "../utils/messages";
import { OpenAiService } from "../services/openai.service";

export const OpenAiController = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const token = req.headers["authorization"];

  if (
    token !== "8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c"
  ) {
    return res.status(401).send(errorMessage("Authorization error", 2));
    z;
  }

  const requestBody = z.object({
    fala: z.string(),
  });

  const validation = requestBody.safeParse(req.body);

  if (!validation.success) {
    const errors = validation.error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));

    const formattedErrors = errors
      .map((err) => `${err.path}: ${err.message}`)
      .join(", ");
    return res
      .status(400)
      .send(errorMessage("Validation error", 1, formattedErrors));
  }

  const response = await OpenAiService(validation.data.fala);

  res.status(200).send(successMessage(response));
};
