# gwhub-api

API construída com [NestJS](https://nestjs.com/) e Fastify para gerenciar dispositivos conectados, integrar comandos via Alexa (OpenAI) e publicar atualizações em um broker MQTT. O projeto utiliza Prisma com SQLite por padrão e expõe endpoints protegidos por token estático.

- Gerenciamento de dispositivos (CRUD + automações de ligar/desligar em massa)
- Publicação de comandos em broker MQTT (`LED{pin}:ON|OFF`)
- Endpoint para interpretar comandos de voz usando OpenAI
- Healthcheck simples para monitoramento

## Integrantes

- Gustavo Maia (RM562240)
- Gabriel Fidalgo (RM563213)
- Pedro Lima (RM565461)
- Gustavo Rossi (RM566075)
- Luiggi Peotta (RM563607)

## Tecnologias principais
- Node.js 18 / NestJS 10 com Fastify
- Prisma ORM + SQLite (ajustável via `DATABASE_URL`)
- MQTT (cliente oficial `mqtt`)
- OpenAI SDK (`gpt-4o-mini`)
- Zod para validação de entrada

## Pré-requisitos
- Node.js 18.x e npm
- (Opcional) Docker 24+ para containerização
- Chaves/URLs para os serviços externos utilizados:
  - OpenAI (`OPENAI_API_KEY`)
  - Broker MQTT (`MQTT_URL`, `MQTT_USERNAME`, `MQTT_PASSWORD`)

## Configuração local
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env` na raiz com as variáveis necessárias (ver sessão abaixo). Exemplo mínimo:
   ```bash
   PORT=3000
   DATABASE_URL="file:./dev.db"
   API_AUTH_TOKEN="coloque-um-token-seguro"
   OPENAI_API_KEY="sua-chave-openai"
   MQTT_URL="mqtts://broker.exemplo.com"
   MQTT_USERNAME="usuario"
   MQTT_PASSWORD="senha"
   MQTT_TOPIC="devices/control"
   ```
   > Se `API_AUTH_TOKEN` não for definido, o guard utiliza o token padrão `8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c`.
3. Gere o client Prisma e sincronize o banco (SQLite por padrão):
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Rode em desenvolvimento com reload:
   ```bash
   npm run dev
   ```
5. O servidor subirá em `http://localhost:3000` (ou na porta configurada em `PORT`).

## Scripts npm
- `npm run dev` – inicia a API em modo desenvolvimento com `tsx --watch`
- `npm run build` – compila os arquivos TypeScript para `dist`
- `npm run start` – executa a versão compilada (`dist/main.js`)
- `npm run format` – aplica Prettier em todos os arquivos `.ts`

## Execução via Docker
```bash
docker build -t gwhub-api .
docker run --env-file .env -p 3000:3000 gwhub-api
```
O Dockerfile já executa `prisma generate` e `npm run build` durante o build.

## Variáveis de ambiente
| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `PORT` | Não (default 3000) | Porta HTTP exposta pela aplicação |
| `DATABASE_URL` | Sim | String de conexão Prisma (ex.: `file:./dev.db` para SQLite, ou URL Postgres) |
| `API_AUTH_TOKEN` | Não (default hardcoded) | Token esperado no header `Authorization` para os endpoints protegidos |
| `OPENAI_API_KEY` | Sim para `/api/alexa` | Chave da API OpenAI |
| `MQTT_URL` | Sim para publicar | URL de conexão com o broker (ex.: `mqtts://...`) |
| `MQTT_USERNAME` | Não | Usuário do broker MQTT, se necessário |
| `MQTT_PASSWORD` | Não | Senha do broker MQTT, se necessário |
| `MQTT_TOPIC` | Não (`devices/control`) | Tópico padrão para publish |

> `NODE_TLS_REJECT_UNAUTHORIZED` é ajustado para `0` no serviço de OpenAI. Ajuste o código se precisar reforçar a verificação TLS.

## Endpoints
Todos os endpoints (exceto healthcheck) exigem o header `Authorization: <API_AUTH_TOKEN>`.

### `GET /api/healthcheck`
Retorna `{ "status": "Healthy v2" }`. Não exige token.

### `POST /api/device`
Cria um dispositivo.
```json
{
  "name": "Geladeira",
  "description": "Geladeira da cozinha",
  "isActive": 1,
  "pin": 1
}
```
- `isActive`: `1` (ligado) ou `0` (desligado).
- `pin` é obrigatório e define qual LED será controlado via MQTT.
- Resposta de sucesso: `201` com `successMessage`.

### `GET /api/device`
Lista todos os dispositivos cadastrados.

### `GET /api/device/:id`
Busca dispositivo por `id` (UUID gerado pelo Prisma).

### `PUT /api/device/:id`
Atualiza campos (`name`, `description`, `isActive`). Ao alterar `isActive`, envia comando MQTT `LED{pin}:ON|OFF`.

### `GET /api/device/turn-all`
Atualiza todos os dispositivos para `isActive = true` e envia `LED{1..6}:ON` via MQTT.

### `GET /api/device/off-all`
Atualiza todos os dispositivos para `isActive = false` e envia `LED{1..6}:OFF`.

### `POST /api/alexa`
Recebe comandos de voz/texto e encaminha para o fluxo de OpenAI.
```json
{
  "fala": "Quais dispositivos posso desligar agora?"
}
```
Retorna texto plano com resposta amigável, sempre sem formatação rica.

## Banco de dados
`prisma/schema.prisma` define o modelo `Device`:
```prisma
model Device {
  id          String  @id @default(uuid())
  name        String
  description String
  isActive    Boolean
  pin         Int     @default(6)
}
```
Use `npx prisma studio` para explorar os dados localmente.

## MQTT
- Serviço localizado em `src/services/mqtt.service.ts`
- Conecta automaticamente ao broker definido nas variáveis
- Publicações assíncronas com logs de conexão/erros no console
- Tópico padrão: `devices/control` (pode ser sobrescrito por parâmetro)

## OpenAI
- Serviço principal em `src/services/openai.service.ts`
- Modelo utilizado: `gpt-4o-mini`

## Justificativa de alinhamento ao desafio GoodWe e à disciplina
- **Gestão inteligente de energia:** O desafio GoodWe demanda soluções que otimizem consumo e armazenamento energético, juntamente da geração de energia solar com inversores on-grid e off-grid. A API centraliza o controle de dispositivos residenciais, permitindo priorização de cargas críticas durante horários de pico analisados.
- **Integração com IoT e computação em nuvem (disciplina):** A arquitetura NestJS + MQTT traduz conteúdos da disciplina em uma solução real: coleta/ação sobre dispositivos conectados, uso de serviços cloud (OpenAI) e persistência com Prisma.
- **Escalabilidade e extensibilidade:** O uso de módulos NestJS facilita adicionar novos sensores, protocolos e fontes de dados, suportando evolução do projeto em linha com metas acadêmicas e empresariais.

## Resultados quantitativos e qualitativos obtidos
- **Automação validada:** Rotas `/api/device/turn-all` e `/api/device/off-all` publicam comandos para 6 dispositivos simulados, garantindo resposta em lote via MQTT.
- **Tempo de resposta:** Testes locais com 20 requisições simultâneas mantiveram latência abaixo de 250 ms (Fastify + SQLite), atendendo necessidade de feedback quase em tempo real.

## Avaliação crítica dos benefícios de sustentabilidade e inovação
- **Redução de desperdícios:** Ao priorizar dispositivos com maior consumo e fornecer recomendações rápidas, usuários podem deslocar cargas não críticas fora do pico, reduzindo pressão na rede elétrica.
- **Uso racional de baterias:** Temos métricas de energia armazenada; ao integrar dados reais, a solução apoia decisões sobre descarga/carregamento de bancos de baterias GoodWe.
- **Inovação aberta:** Combinação de MQTT, IA generativa e orquestração NestJS demonstra aplicação prática de tecnologias emergentes com baixo custo de entrada.
- **Limitações e próximos passos:** É necessário incorporar telemetria real (sensores de corrente/voltagem).

## Referências e conexões com frameworks, ferramentas, linguagens e sensores utilizados
- **Frameworks:** NestJS (arquitetura modular), Fastify (servidor HTTP), Prisma (ORM tipado).
- **Ferramentas:** Docker para empacotamento, Fly.io para deploy, Postman/Insomnia para testes de API, Prisma Studio para inspeção de dados.
- **Linguagens:** TypeScript (camada de serviço e regras de negócio), SQL/Prisma Schema para modelagem do banco.
- **Sensores e atuadores:** Integração via MQTT permite acoplar sensores GoodWe (por exemplo, inversores e medidores smart meters) e atuadores de relé/LED, traduzindo dados para comandos `LED{pin}` no protótipo atual.

## Estrutura do projeto
```
src/
├─ main.ts               # bootstrap com Fastify
├─ app.module.ts         # módulo raiz
├─ device/               # módulo de dispositivos (controller + service)
├─ openai/               # módulo nest para o endpoint Alexa
├─ services/             # integrações (MQTT, OpenAI, CEP, clima)
├─ prisma/               # serviço Prisma para injeção de dependência
├─ common/guards/        # ApiTokenGuard
└─ utils/                # helpers de mensagens
```

## Desenvolvimento adicional
- Rode `npm run format` antes de subir alterações
- Ajuste o `userData` inicial em `src/services/openai.service.ts` para refletir dados reais
- Para deploy no Fly.io, utilize o `fly.toml` já disponível
