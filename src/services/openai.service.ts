import OpenAI from 'openai'
import { OPENAI_API_KEY } from '../constants'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

export let userData: any = {
  usuario: {
    nome: 'Pedro',
    localizacao: 'Casa',
    id_usuario: '123456',
    prioridade_maxima: 3,
    cep: '02420040',
  },
  horario_pico: {
    inicio: '2025-09-10T18:00:00',
    fim: '2025-09-10T22:00:00',
    duracao_em_horas: 4,
  },
  dispositivos: [
    {
      nome: 'Geladeira',
      quantidade: 1,
      consumo: 1.5,
      consumo_por_unidade: 1.5,
      prioridade: 1,
      tipo: 'Refrigeração',
      status_atual: 'Ligado',
      energia_consumida_total: 1.5,
      horas_uso_diarias: 24,
    },
    {
      nome: 'Ar Condicionado',
      quantidade: 2,
      consumo: 3.6,
      consumo_por_unidade: 1.8,
      prioridade: 2,
      tipo: 'Climatização',
      status_atual: 'Desligado',
      energia_consumida_total: 7.2,
      horas_uso_diarias: 6,
    },
    {
      nome: 'Computador',
      quantidade: 1,
      consumo: 0.8,
      consumo_por_unidade: 0.8,
      prioridade: 3,
      tipo: 'Tecnologia',
      status_atual: 'Ligado',
      energia_consumida_total: 0.8,
      horas_uso_diarias: 8,
    },
    {
      nome: 'Lâmpadas',
      quantidade: 10,
      consumo: 0.5,
      consumo_por_unidade: 0.05,
      prioridade: 2,
      tipo: 'Iluminação',
      status_atual: 'Ligado',
      energia_consumida_total: 5,
      horas_uso_diarias: 10,
    },
    {
      nome: 'Micro-ondas',
      quantidade: 1,
      consumo: 1.2,
      consumo_por_unidade: 1.2,
      prioridade: 2,
      tipo: 'Cozinha',
      status_atual: 'Desligado',
      energia_consumida_total: 1.2,
      horas_uso_diarias: 0.5,
    },
    {
      nome: 'Máquina de Lavar Roupas',
      quantidade: 1,
      consumo: 2,
      consumo_por_unidade: 2,
      prioridade: 3,
      tipo: 'Cozinha',
      status_atual: 'Desligado',
      energia_consumida_total: 2,
      horas_uso_diarias: 1,
    },
    {
      nome: 'Aquecedor',
      quantidade: 1,
      consumo: 2.5,
      consumo_por_unidade: 2.5,
      prioridade: 1,
      tipo: 'Aquecimento',
      status_atual: 'Desligado',
      energia_consumida_total: 2.5,
      horas_uso_diarias: 3,
    },
    {
      nome: 'TV',
      quantidade: 1,
      consumo: 1.0,
      consumo_por_unidade: 1.0,
      prioridade: 3,
      tipo: 'Entretenimento',
      status_atual: 'Ligado',
      energia_consumida_total: 1.0,
      horas_uso_diarias: 4,
    },
    {
      nome: 'Forno Elétrico',
      quantidade: 1,
      consumo: 2.8,
      consumo_por_unidade: 2.8,
      prioridade: 2,
      tipo: 'Cozinha',
      status_atual: 'Desligado',
      energia_consumida_total: 2.8,
      horas_uso_diarias: 1,
    },
  ],
  energia_armazenada: {
    total: 10,
    unidade: 'kWh',
    disponibilidade: 50,
    percentual_utilizado: 0,
    tempo_estimado_para_descarregamento: '12h',
  },
  energia_bateria: {
    capacidade_maxima: 15,
    capacidade_atual: 10,
    estado: 'Carregando',
    nivel_bateria: 67,
    tempo_estimado_para_carregamento: '6h',
    tipo_bateria: 'Li-ion',
  },
  projeções: {
    energia_necessaria_para_pico: 18,
    energia_restante_apos_pico: 8,
    energia_maxima_armazenada: 15,
    energia_diaria_estimativa: 25,
    consumo_maximo_horario: 7.0,
  },
  historico_consumo: {
    mes_atual: {
      total_consumido: 250,
      dispositivos_com_mais_consumo: ['Ar Condicionado', 'Geladeira'],
      percentual_de_uso_no_pico: 45,
      periodos_de_uso_pico: [
        {
          inicio: '2025-09-10T18:00:00',
          fim: '2025-09-10T22:00:00',
          consumo_estimado: 20,
        },
      ],
    },
    mes_anterior: {
      total_consumido: 240,
      dispositivos_com_mais_consumo: ['Ar Condicionado', 'Micro-ondas'],
      percentual_de_uso_no_pico: 40,
      periodos_de_uso_pico: [
        {
          inicio: '2025-08-15T19:00:00',
          fim: '2025-08-15T22:00:00',
          consumo_estimado: 18,
        },
      ],
    },
  },
  recomendacoes: {
    optimizacao_energia: [
      'Reduzir o uso de Ar Condicionado e Forno Elétrico durante o horário de pico',
      'Utilizar mais energia da bateria para evitar sobrecarga na rede elétrica',
    ],
    alertas: [
      'O consumo de energia pode ultrapassar a capacidade da bateria se o consumo durante o pico continuar elevado.',
      'A Máquina de Lavar Roupas e o Forno Elétrico podem ser programados para fora do horário de pico para otimizar o consumo.',
    ],
  },
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

Use sempre as informações dos dispositivos fornecidas para basear suas respostas. Não utilize em hipótese alguma nenhuma informação sobre algum dispositivo que não foi dado como contexto

`

  const dispositivosStr = userData.dispositivos
    ? userData.dispositivos
        .map(
          (d: any) =>
            `- ${d.nome}: ${d.quantidade} unidade(s), consumo: ${d.consumo} kWh, prioridade: ${d.prioridade}`
        )
        .join('\n')
    : 'Nenhum dispositivo informado'

  const horarioPico = userData.horario_pico
    ? `De ${userData.horario_pico.inicio} até ${userData.horario_pico.fim}`
    : 'Não informado'

  const userInfo = `
Dados do usuário:
- Nome: ${userData.nome || 'Não informado'}
- Idade: ${userData.idade || 'Não informado'}
- Horário de pico: ${horarioPico}
- Dispositivos:
${dispositivosStr}
- Energia armazenada: ${userData.energia_armazenada || 'Não informado'} kWh
`

  const instrucao2 = `
Você pode desligar equipamentos ou reduzir o consumo deles para gerenciar o uso de energia. Ao fornecer sugestões para o usuário, limite-se a 3 alternativas rápidas e simples.
`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: intrucoes },
        { role: 'system', content: instrucao2 },
        { role: 'user', content: `${userInfo}\n\nPergunta: ${fala}` },
      ],
    })

    const resposta = response.choices[0]?.message?.content || 'Sem resposta'

    return resposta
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\n/g, ' ')
      .trim()
  } catch (error: any) {
    console.error(error)
    throw new Error('Erro ao processar a requisição.')
  }
}
