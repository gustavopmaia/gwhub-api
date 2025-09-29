# GWHub – Backend

**Protótipo Funcional de Monitoramento, Automação e Eficiência Energética**

## Equipe

*  Gabriel Fidalgo - RM563213
* Pedro Lima - RM565461
* Luiggi Peotta - RM563607
* Gustavo Maia - RM562240
* Gustavo Rossi - RM566075

---

## Arquitetura do Backend

O backend foi desenvolvido em **Node.js + TypeScript** com **Fastify**, integrando APIs externas e oferecendo endpoints para automação, IA e dados de consumo.

### Principais Tecnologias

* **TypeScript** – linguagem principal.
* **Fastify** – framework para APIs performáticas.
* **Prisma ORM** – banco SQLite local (simulação) e suporte a PostgreSQL.
* **OpenAI SDK** – integração com IA (respostas inteligentes, assistente virtual).
* **WeatherAPI** – dados climáticos em tempo real.
* **ViaCEP** – consulta de endereços.
* **Dockerfile** – containerização e deploy.

---

## Integração dos Componentes

* **Painel solar (simulado)** → gera dados de produção de energia.
* **Inversor GoodWe (simulado)** → converte energia e fornece telemetria.
* **Baterias (simuladas)** → armazenam energia excedente.
* **Serviços backend**:

  * `weather.service.ts`: dados climáticos para prever eficiência solar.
  * `cep.service.ts`: geolocalização para ajustes regionais.
  * `openai.service.ts`: integração com GPT para recomendações inteligentes.
* **Assistente Virtual (Alexa/Google Home)** → faz requisições ao backend para controle e consulta de dados.

---

## Resultados e Dados Funcionais

* **Medições simuladas** de geração e consumo.
* **Previsão climática** impactando a recomendação de uso de energia.
* **Respostas inteligentes** via IA (exemplo: “Devo ligar o ar-condicionado agora?”).
* **Automação**: backend preparado para rotinas agendadas (cronjobs).

---

## Estrutura do Repositório – Backend

```
Dockerfile                # Configuração de container
package.json              # Dependências
tsconfig.json             # Configuração TypeScript

/prisma
 ├─ schema.prisma         # Modelagem do banco
 ├─ dev.db                # Banco local SQLite
 └─ migrations/           

/src
 ├─ server.ts             # Bootstrap do servidor Fastify
 ├─ routes.ts             # Definição de rotas
 ├─ constants.ts          # Constantes globais
 ├─ controllers/          # Camada de controle (REST API)
 │   ├─ device.controller.ts
 │   └─ openai.controller.ts
 ├─ services/             # Integrações externas
 │   ├─ cep.service.ts
 │   ├─ openai.service.ts
 │   └─ weather.service.ts
 └─ utils/                # Utilidades
     ├─ error-handler.ts
     ├─ messages.ts
     └─ messages.d.ts
```

---

## Justificativas Técnicas

* **Fastify** pela performance e baixo overhead.
* **Prisma** pela simplicidade de manipulação de dados (migrações fáceis, suporte a SQLite/Postgres).
* **OpenAI** para inteligência adaptativa.
* **APIs externas (CEP, Weather)** para enriquecer serviço.

---

## Conexão com Conteúdos da Disciplina

* **Sustentabilidade** → uso de dados climáticos e otimização de consumo.
* **Automação inteligente** → integração de IA com sensores e rotinas.
* **Eficiência energética** → simulação de geração/armazenamento e recomendações de uso.

---

## Como Executar

```bash
# Instalar dependências
npm install

# Rodar migrações (caso necessário)
npx prisma migrate dev

# Rodar em dev
npm run dev

# Build e produção
npm run build
npm start

# Usando Docker
docker build -t gwhub-backend .
docker run -p 3000:3000 gwhub-backend
```
