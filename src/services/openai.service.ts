import OpenAI from "openai";
import { OPENAI_API_KEY } from "../constants";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

let userData = {
  nome: "Pedro",
  idade: 20,
  horario_pico: {
    "inicio": "2025-09-10T18:00:00",
    "fim": "2025-09-10T22:00:00"
  },
  dispositivos: [
    { nome: "Geladeira", quantidade: 1, consumo: 1.5, prioridade: 1 },
    { nome: "Ar Condicionado", quantidade: 2, consumo: 3.6, prioridade: 2 },
    { nome: "Computador", quantidade: 1, consumo: 0.8, prioridade: 3 }
  ],
  energia_armazenada: 10
}

export const OpenAiService = async (fala: string) => {
  const intrucoes = `
Você é um analista técnico especializado na GoodWe, uma empresa líder no setor de inversores solares.
Seu papel é fornecer informações detalhadas e precisas sobre inversores solares, seus tipos, funcionalidades, benefícios
e como escolher o modelo ideal para diferentes necessidades.

Você deve considerar e registrar os dados do usuário:
1. Nome e idade.
2. Horário de pico de consumo (intervalo datetime).
3. Dispositivos conectados (nome, quantidade, consumo em kWh e prioridade numérica em caso de blackout: 1=alta, 2=média, 3=baixa).
4. Quantidade de energia armazenada disponível para blackout.

Sempre forneça respostas curtas, diretas e de fácil compreensão, como se fosse para um leigo.
Se a pergunta envolver sugestões, limite-se a 3 alternativas concisas, considerando os dispositivos do usuário.

Lembre-se de que a resposta será ouvida e não lida, então evite formatação (como negritos) e mantenha a clareza.

Use sempre as informações dos dispositivos fornecidas para basear suas respostas.

`;

  const dispositivosStr = userData.dispositivos
    ? userData.dispositivos
        .map(
          (d: any) =>
            `- ${d.nome}: ${d.quantidade} unidade(s), consumo: ${d.consumo} kWh, prioridade: ${d.prioridade}`
        )
        .join("\n")
    : "Nenhum dispositivo informado";

  const horarioPico = userData.horario_pico
    ? `De ${userData.horario_pico.inicio} até ${userData.horario_pico.fim}`
    : "Não informado";

  const userInfo = `
Dados do usuário:
- Nome: ${userData.nome || "Não informado"}
- Idade: ${userData.idade || "Não informado"}
- Horário de pico: ${horarioPico}
- Dispositivos:
${dispositivosStr}
- Energia armazenada: ${userData.energia_armazenada || "Não informado"} kWh
`;

  const instrucao2 = `
Você pode desligar equipamentos ou reduzir o consumo deles para gerenciar o uso de energia. Ao fornecer sugestões para o usuário, limite-se a 3 alternativas rápidas e simples.
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: intrucoes },
        { role: "system", content: instrucao2 },
        { role: "user", content: `${userInfo}\n\nPergunta: ${fala}` },
      ],
    });

    const resposta = response.choices[0]?.message?.content || "Sem resposta";
   
    return resposta.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ').trim();
  } catch (error: any) {
    console.error(error);
    throw new Error("Erro ao processar a requisição.");
  }
};
