'use strict'

const Alexa = require('ask-sdk-core')
const http = require('http') // HTTP

/**
 * =========================================================
 *   CONFIG API (HTTP)
 * =========================================================
 * GET  /api/devices              → lista [{ id, name }, ...]
 * PUT  /api/devices/:id          → body: { isActive: 1|0 }
 */
const API_BASE_HOST = 'ec2-44-223-34-3.compute-1.amazonaws.com'
const API_PORT = 3000
const API_TIMEOUT_MS = 5000 // manter < 8s totais da Alexa

// >>> Authorization exigido pela sua API (use ENV em produção)
const API_AUTH = '8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c'

const DEVICE_LIST_PATH = '/api/devices'
const DEVICE_ITEM_PATH = (id) => `/api/devices/${id}`

/**
 * =========================================================
 *   HELPERS HTTP (GET/PUT)
 * =========================================================
 */
function httpGet(path) {
  const options = {
    hostname: API_BASE_HOST,
    port: API_PORT,
    path,
    method: 'GET',
    headers: {
      Authorization: API_AUTH,
    },
    timeout: API_TIMEOUT_MS,
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            console.error('GET devices status:', res.statusCode, 'body:', data)
            return resolve([]) // evita quebrar o fluxo, mas loga
          }
          const json = data ? JSON.parse(data) : []
          const list = Array.isArray(json)
            ? json
            : Array.isArray(json.devices)
              ? json.devices
              : Array.isArray(json.data)
                ? json.data
                : []
          console.log('GET devices size:', list.length)
          resolve(list)
        } catch (err) {
          console.error('Erro parse GET devices:', err, 'body:', data)
          reject(new Error('Resposta inválida do servidor (GET)'))
        }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => req.destroy(new Error('timeout')))
    req.end()
  })
}

async function turnOnAllDevices(h) {
  await sendProgressive(h, 'Bem-vindo! Ligando tudo...')
  try {
    const list = await httpGet(DEVICE_LIST_PATH)
    if (!Array.isArray(list) || list.length === 0) {
      return 'Não há dispositivos cadastrados para ligar.'
    }

    // dispara em paralelo, mas limita payload simples { isActive: 1 }
    const results = await Promise.allSettled(
      list.map((d) => httpPut(DEVICE_ITEM_PATH(d.id), { isActive: 1 }))
    )

    const ok = results.filter(
      (r) => r.status === 'fulfilled' && r.value?.status >= 200 && r.value?.status < 300
    ).length
    const total = list.length

    if (ok === 0) return 'Não consegui ligar os dispositivos agora.'
    if (ok < total) return `Liguei ${ok} de ${total} dispositivos.`
    return 'Pronto! Liguei todos os dispositivos.'
  } catch (e) {
    console.error('Erro ao ligar todos:', e)
    return 'Ocorreu um problema ao tentar ligar tudo.'
  }
}

const ChegueiIntentHandler = {
  canHandle(h) {
    return (
      Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(h.requestEnvelope) === 'ChegueiIntent'
    )
  },
  async handle(h) {
    const speak = await turnOnAllDevices(h)
    const resp = h.responseBuilder
      .speak(speak)
      .reprompt('Quer fazer mais alguma coisa?')
      .withShouldEndSession(false)
      .getResponse()
    console.log('ChegueiIntent shouldEndSession:', resp.shouldEndSession, 'speech:', speak)
    return resp
  },
}

async function turnOffAllDevices(h) {
  await sendProgressive(h, 'Até mais! Desligando tudo...')
  try {
    const list = await httpGet(DEVICE_LIST_PATH)
    if (!Array.isArray(list) || list.length === 0) {
      return 'Não há dispositivos cadastrados para ligar.'
    }

    const results = await Promise.allSettled(
      list.map((d) => httpPut(DEVICE_ITEM_PATH(d.id), { isActive: 0 }))
    )

    const ok = results.filter(
      (r) => r.status === 'fulfilled' && r.value?.status >= 200 && r.value?.status < 300
    ).length
    const total = list.length

    if (ok === 0) return 'Não consegui ligar os dispositivos agora.'
    if (ok < total) return `Liguei ${ok} de ${total} dispositivos.`
    return 'Pronto! Desliguei todos os dispositivos.'
  } catch (e) {
    console.error('Erro ao ligar todos:', e)
    return 'Ocorreu um problema ao tentar ligar tudo.'
  }
}

const EmboraIntentHandler = {
  canHandle(h) {
    return (
      Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(h.requestEnvelope) === 'EmboraIntent'
    )
  },
  async handle(h) {
    const speak = await turnOffAllDevices(h)
    const resp = h.responseBuilder
      .speak(speak)
      .reprompt('Quer fazer mais alguma coisa?')
      .withShouldEndSession(false)
      .getResponse()
    console.log('EmboraIntent shouldEndSession:', resp.shouldEndSession, 'speech:', speak)
    return resp
  },
}

async function turnOnJustNeeded(h) {
  await sendProgressive(h, 'Blackout detectado! Ligando apenas prioritários...')
  try {
    const neededPins = new Set([2, 3, 4])

    const list = await httpGet(DEVICE_LIST_PATH)
    if (!Array.isArray(list) || list.length === 0) {
      return 'Não há dispositivos cadastrados para acionar.'
    }

    // Separa quem liga e quem desliga
    const toTurnOn = []
    const toTurnOff = []

    for (const d of list) {
      const pin = Number(d.pin)
      if (!Number.isFinite(pin)) {
        console.warn('Dispositivo sem pin numérico, ignorando:', d)
        continue
      }
      if (neededPins.has(pin)) toTurnOn.push(d)
      else toTurnOff.push(d)
    }

    const onResults = await Promise.allSettled(
      toTurnOn.map((d) => httpPut(DEVICE_ITEM_PATH(d.id), { isActive: 1 }))
    )
    const offResults = await Promise.allSettled(
      toTurnOff.map((d) => httpPut(DEVICE_ITEM_PATH(d.id), { isActive: 0 }))
    )

    const okOn = onResults.filter(
      (r) => r.status === 'fulfilled' && r.value?.status >= 200 && r.value?.status < 300
    ).length
    const okOff = offResults.filter(
      (r) => r.status === 'fulfilled' && r.value?.status >= 200 && r.value?.status < 300
    ).length

    if (okOn === 0 && okOff === 0) {
      return 'Não consegui acionar os dispositivos agora.'
    }

    return `Prioritários ligados: ${okOn}/${toTurnOn.length}. Demais desligados: ${okOff}/${toTurnOff.length}.`
  } catch (e) {
    console.error('Erro ao acionar prioritários:', e)
    return 'Ocorreu um problema ao tentar acionar apenas os prioritários.'
  }
}

const BlackoutIntentHandler = {
  canHandle(h) {
    return (
      Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(h.requestEnvelope) === 'BlackoutIntent'
    )
  },
  async handle(h) {
    const speak = await turnOnJustNeeded(h)
    return h.responseBuilder
      .speak(speak)
      .reprompt('Quer fazer mais alguma coisa?')
      .withShouldEndSession(false)
      .getResponse()
  },
}

function httpPut(path, bodyObj) {
  const payload = JSON.stringify(bodyObj || {})
  const options = {
    hostname: API_BASE_HOST,
    port: API_PORT,
    path,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      Authorization: API_AUTH,
    },
    timeout: API_TIMEOUT_MS,
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.error('PUT device status:', res.statusCode, 'body:', data)
        }
        resolve({ status: res.statusCode, body: data })
      })
    })
    req.on('error', reject)
    req.on('timeout', () => req.destroy(new Error('timeout')))
    req.write(payload)
    req.end()
  })
}

/**
 * =========================================================
 *   UTILITÁRIOS DE TEXTO
 * =========================================================
 */
function normalize(s = '') {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractName(text = '') {
  let name = normalize(text)
  // remove determinantes comuns
  name = name.replace(/\b(o|a|os|as|da|do|das|dos|de|na|no|nas|nos)\b/g, ' ').trim()
  return name
}

// >>> SOMENTE NAME (sem description), com prioridade: exato > startsWith > includes
async function findDeviceByNameLike(name) {
  const list = await httpGet(DEVICE_LIST_PATH)
  if (!Array.isArray(list)) throw new Error('Lista de dispositivos inválida')

  const target = extractName(name)
  if (!target) return null

  const norm = (d) => normalize(d.name || '')

  const exact = list.filter((d) => norm(d) === target)
  if (exact.length > 0) {
    console.log('match exato por name:', exact.length, 'alvo:', target)
    return exact[0]
  }

  const starts = list.filter((d) => norm(d).startsWith(target))
  if (starts.length > 0) {
    console.log('match startsWith por name:', starts.length, 'alvo:', target)
    return starts[0]
  }

  const includes = list.filter((d) => norm(d).includes(target))
  if (includes.length > 0) {
    console.log('match includes por name:', includes.length, 'alvo:', target)
    return includes[0]
  }

  console.log('nenhum match por name para:', target)
  return null
}

/**
 * =========================================================
 *   PROGRESSIVE RESPONSE (opcional)
 * =========================================================
 */
async function sendProgressive(handlerInput, text = 'Certo, um instante...') {
  try {
    const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient()
    const requestId = handlerInput.requestEnvelope.request.requestId
    const endpoint = handlerInput.requestEnvelope.context?.System?.apiEndpoint
    const token = handlerInput.requestEnvelope.context?.System?.apiAccessToken

    await directiveServiceClient.enqueue(
      {
        header: { requestId },
        directive: { type: 'VoicePlayer.Speak', speech: `<speak>${text}</speak>` },
      },
      endpoint,
      token
    )
  } catch (e) {
    console.warn('Progressive response falhou (ignorado):', e.message)
  }
}

/**
 * =========================================================
 *   HANDLER COMUM DE DISPOSITIVO (on/off)
 * =========================================================
 */
async function handleDeviceAction(h, isActive, alvoText) {
  await sendProgressive(h, isActive ? 'Ligando...' : 'Desligando...')

  if (!alvoText) {
    const resp = h.responseBuilder
      .speak('Qual dispositivo você quer controlar?')
      .reprompt('Por exemplo: ligar luz da sala.')
      .withShouldEndSession(false)
      .getResponse()
    console.log('No target shouldEndSession:', resp.shouldEndSession)
    return resp
  }

  let speak = ''
  try {
    const device = await findDeviceByNameLike(alvoText)
    if (!device) {
      const resp = h.responseBuilder
        .speak(`Não encontrei nenhum dispositivo chamado ${alvoText}.`)
        .reprompt('Tente dizer o nome exato do dispositivo.')
        .withShouldEndSession(false)
        .getResponse()
      console.log('Not found shouldEndSession:', resp.shouldEndSession)
      return resp
    }

    const path = DEVICE_ITEM_PATH(device.id)
    const putRes = await httpPut(path, { isActive })
    if (putRes.status >= 200 && putRes.status < 300) {
      speak = `Certo, ${isActive ? 'liguei' : 'desliguei'} o ${device.name}.`
    } else {
      console.error('PUT falhou:', putRes.status, putRes.body)
      speak = `Não consegui ${isActive ? 'ligar' : 'desligar'} o ${device.name}.`
    }
  } catch (e) {
    console.error('Erro no controle de dispositivo:', e)
    speak = 'Ocorreu um problema ao comunicar com o servidor.'
  }

  const resp = h.responseBuilder
    .speak(speak)
    .reprompt('Quer fazer mais alguma coisa?')
    .withShouldEndSession(false)
    .getResponse()
  console.log('handleDeviceAction shouldEndSession:', resp.shouldEndSession, 'speech:', speak)
  return resp
}

/**
 * =========================================================
 *   HANDLERS ALEXA
 * =========================================================
 */
const LaunchRequestHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'LaunchRequest'
  },
  handle(h) {
    const speakOutput = 'Olá! Pode dizer, por exemplo: ligar a luz da sala.'
    const resp = h.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(false)
      .getResponse()
    console.log('Launch shouldEndSession:', resp.shouldEndSession)
    return resp
  },
}

// Intent dedicado para LIGAR
const LigarDispositivoIntentHandler = {
  canHandle(h) {
    return (
      Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(h.requestEnvelope) === 'LigarDispositivoIntent'
    )
  },
  async handle(h) {
    const alvo = h.requestEnvelope.request?.intent?.slots?.alvo?.value?.trim()
    return handleDeviceAction(h, 1, alvo)
  },
}

// Intent dedicado para DESLIGAR
const DesligarDispositivoIntentHandler = {
  canHandle(h) {
    return (
      Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(h.requestEnvelope) === 'DesligarDispositivoIntent'
    )
  },
  async handle(h) {
    const alvo = h.requestEnvelope.request?.intent?.slots?.alvo?.value?.trim()
    return handleDeviceAction(h, 0, alvo)
  },
}

// Fallback livre (frases soltas)
const PerguntaIntentHandler = {
  canHandle(h) {
    return (
      Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(h.requestEnvelope) === 'PerguntaIntent'
    )
  },
  async handle(h) {
    console.log('PerguntaIntent → request:', JSON.stringify(h.requestEnvelope, null, 2))
    const utterance = h.requestEnvelope.request?.intent?.slots?.pergunta?.value?.trim() || ''

    // heurística simples: decide por palavra-chave
    const u = normalize(utterance)
    const ligar = /\b(lig(ar|a)|acend(e|er))\b/.test(u)
    const desligar = /\b(deslig(ar|a)|apag(a|ar))\b/.test(u)
    const alvo = extractName(
      utterance.replace(/\b(ligar|liga|desligar|desliga|acender|acende|apagar|apaga)\b/i, '')
    )

    if (!ligar && !desligar) {
      const resp = h.responseBuilder
        .speak('Não entendi se é para ligar ou desligar. Diga, por exemplo: ligar ar condicionado.')
        .reprompt('Por exemplo: ligar ar condicionado.')
        .withShouldEndSession(false)
        .getResponse()
      console.log('PerguntaIntent no action shouldEndSession:', resp.shouldEndSession)
      return resp
    }

    return handleDeviceAction(h, ligar ? 1 : 0, alvo)
  },
}

const HelpIntentHandler = {
  canHandle(h) {
    return (
      Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.HelpIntent'
    )
  },
  handle(h) {
    const speakOutput = 'Você pode dizer: ligar luz da sala, ou desligar ventilador.'
    const resp = h.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(false)
      .getResponse()
    console.log('Help shouldEndSession:', resp.shouldEndSession)
    return resp
  },
}

// Mitigação: se “desligar …” cair como Stop, não encerre.
const CancelAndStopIntentHandler = {
  canHandle(h) {
    if (Alexa.getRequestType(h.requestEnvelope) !== 'IntentRequest') return false
    const name = Alexa.getIntentName(h.requestEnvelope)
    return name === 'AMAZON.CancelIntent' || name === 'AMAZON.StopIntent'
  },
  handle(h) {
    const resp = h.responseBuilder
      .speak('Se você quis desligar um dispositivo, diga por exemplo: desligar o ar condicionado.')
      .reprompt('Por exemplo: desligar o ar condicionado.')
      .withShouldEndSession(false)
      .getResponse()
    console.log('Cancel/Stop mitigated shouldEndSession:', resp.shouldEndSession)
    return resp
  },
}

const FallbackIntentHandler = {
  canHandle(h) {
    return (
      Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.FallbackIntent'
    )
  },
  handle(h) {
    const msg = 'Não entendi. Tente: ligar luz da sala.'
    const resp = h.responseBuilder.speak(msg).reprompt(msg).withShouldEndSession(false).getResponse()
    console.log('Fallback shouldEndSession:', resp.shouldEndSession)
    return resp
  },
}

const SessionEndedRequestHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'SessionEndedRequest'
  },
  handle(h) {
    console.log('Sessão encerrada:', JSON.stringify(h.requestEnvelope.request, null, 2))
    return h.responseBuilder.getResponse()
  },
}

// Debug: reflete o intent que a Alexa entendeu
const IntentReflectorHandler = {
  canHandle(h) {
    return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest'
  },
  handle(h) {
    const intentName = Alexa.getIntentName(h.requestEnvelope)
    const speakOutput = `Você acionou o intent ${intentName}.`
    const resp = h.responseBuilder
      .speak(speakOutput)
      .reprompt('Quer fazer mais alguma coisa?')
      .withShouldEndSession(false)
      .getResponse()
    console.log('Reflector shouldEndSession:', resp.shouldEndSession)
    return resp
  },
}

// Error handler global
const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(h, error) {
    console.error('Erro não tratado:', error.stack || error)
    const resp = h.responseBuilder
      .speak('Desculpe, ocorreu um problema. Pode tentar novamente?')
      .reprompt('Pode repetir, por favor?')
      .withShouldEndSession(false)
      .getResponse()
    console.log('Error shouldEndSession:', resp.shouldEndSession)
    return resp
  },
}

// Interceptors de log + Força sessão aberta
const RequestLogInterceptor = {
  process(h) {
    console.log('REQUEST ENVELOPE:', JSON.stringify(h.requestEnvelope, null, 2))
  },
}

const ResponseLogInterceptor = {
  process(h, response) {
    console.log('RESPONSE:', JSON.stringify(response, null, 2))
  },
}

const ForceKeepAliveResponseInterceptor = {
  process(handlerInput, response) {
    if (!response) return
    if (!response.reprompt || !response.reprompt.outputSpeech) {
      response.reprompt = { outputSpeech: { type: 'PlainText', text: 'Quer fazer mais alguma coisa?' } }
    }
    response.shouldEndSession = false
    console.log(
      'ForceKeepAlive → shouldEndSession:',
      response.shouldEndSession,
      'hasReprompt:',
      !!response.reprompt
    )
  },
}

// Export
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    LigarDispositivoIntentHandler,
    DesligarDispositivoIntentHandler,
    PerguntaIntentHandler, // fallback
    HelpIntentHandler,
    CancelAndStopIntentHandler, // mitigação
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    ChegueiIntentHandler,
    EmboraIntentHandler,
    BlackoutIntentHandler,
    // Deixe o Reflector por último
    IntentReflectorHandler
  )
  .addRequestInterceptors(RequestLogInterceptor)
  .addResponseInterceptors(ResponseLogInterceptor, ForceKeepAliveResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient()) // necessário p/ Progressive Response
  .lambda()
