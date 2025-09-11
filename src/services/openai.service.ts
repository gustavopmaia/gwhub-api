import OpenAI from "openai";
 
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
 
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let userData = {
  "nome": "Pedro",
  "idade": 20,
  "horario_pico": {
    "inicio": "2025-09-10T18:00:00",
    "fim": "2025-09-10T22:00:00"
  },
  "dispositivos": [
    { "nome": "Geladeira", "quantidade": 1, "consumo": 1.5, "prioridade": 1 },
    { "nome": "Ar Condicionado", "quantidade": 2, "consumo": 3.6, "prioridade": 2 },
    { "nome": "Computador", "quantidade": 1, "consumo": 0.8, "prioridade": 3 }
  ],
  "energia_armazenada": 10
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
 
Sempre dê respostas claras, objetivas e fundamentadas.
`;
 
  const dispositivosStr = userData.dispositivos
    ? userData.dispositivos
        .map(
          (d: any) =>
            `- ${d.nome} | qtd: ${d.quantidade} | consumo: ${d.consumo} kWh | prioridade: ${d.prioridade}`
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
Você pode desligar equipamentos, diminuir energia enviada para eles, então, caso for elaborar alguma sugestão para o usário, responda com no máximo 3 alternativas curtas.
Se não houver necessidade de sugestões, responda normalmente sem o uso de 3  alternativas
sobre o que o usuário pode fazer. Lembre-se: você tem acesso ao inversor e pode controlar para onde manda energia.
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
 
    return response.choices[0]?.message?.content || "Sem resposta";
  } catch (error: any) {
    console.error(error);
    return "Erro ao processar a requisição.";
  }
};