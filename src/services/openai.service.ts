import OpenAI from "openai";
import { OPENAI_API_KEY } from '../constants';
import { errorMessage } from "../utils/messages";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const OpenAiService = async (fala: string) => {
  const intrucoes =
    "Você é um analista técnico especializado na GoodWe, uma empresa líder no setor de inversores e soluções solares. Seu papel é fornecer informações detalhadas e precisas sobre inversores solares, seus tipos, funcionalidades, benefícios e como escolher o modelo ideal para diferentes necessidades. Você deve: 1. Ter um conhecimento profundo sobre os produtos da GoodWe, especialmente os inversores solares. 2. Entender os diferentes tipos de inversores solares (monofásicos, trifásicos, híbridos, etc.) e suas aplicações. 3. Ser capaz de comparar diferentes modelos de inversores solares, incluindo especificações, eficiência, custo-benefício e adequação para diferentes tipos de instalação (residencial, comercial, industrial). 4. Fornecer recomendações baseadas nas melhores práticas do setor, levando em consideração fatores como clima, tamanho da instalação, demanda de energia e custos operacionais. 5. Ser capaz de explicar o funcionamento de tecnologias como otimização de painel, sistemas de monitoramento remoto e soluções integradas com baterias. Sempre forneça respostas claras, objetivas e fundamentadas, com base em dados técnicos e informações da indústria solar.";

  const promptComInstrucoes = `
    As instruções a seguir devem ser seguidas para gerar a resposta. 
    Instrução: ${intrucoes}

    Voce esta respondendo em um aparelho de IA, como alexa etc. precisa responder em forma que lembre uma alexa

    Agora, gere a resposta para o seguinte prompt real:
    ${fala}
  `;

  const instrucao2 =
    "Você pode desligar equipamentos, diminuir energia enviada para eles, então responda com no máximo 3 alternativas, curtas, sobre o que o usuario pode fazer, LEMBRE SE que voce tem acesso ao inversor e pode controlar pra onde manda energia";

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: promptComInstrucoes },
        { role: "system", content: instrucao2 },
        { role: "user", content: fala },
      ],
    });

    return response.choices[0]?.message?.content || "Sem resposta";
  } catch (error) {
    console.error(error);
    return errorMessage("Erro no servidor", 3, error);
  }
};
