import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { connect, MqttClient } from 'mqtt'

@Injectable()
export class MqttService implements OnModuleDestroy {
  private client: MqttClient | null = null
  private readonly url = process.env.MQTT_URL || ''
  private readonly username = process.env.MQTT_USERNAME
  private readonly password = process.env.MQTT_PASSWORD
  private readonly defaultTopic = process.env.MQTT_TOPIC || 'devices/control'

  private ensureClient() {
    if (this.client || !this.url) return

    try {
      this.client = connect(this.url, {
        username: this.username,
        password: this.password,
      })

      this.client.on('connect', () => {
        console.log('[MQTT] Connected')
      })

      this.client.on('reconnect', () => {
        console.log('[MQTT] Reconnecting...')
      })

      this.client.on('error', (err) => {
        console.error('[MQTT] Error:', err?.message || err)
      })

      this.client.on('close', () => {
        console.log('[MQTT] Connection closed')
      })
    } catch (e) {
      console.error('[MQTT] Failed to initialize client:', e)
    }
  }

  async publishMessage(message: string, topic?: string) {
    this.ensureClient()
    if (!this.client) {
      console.warn('[MQTT] Client not configured. Set MQTT_URL to enable publishing.')
      return
    }

    const finalTopic = topic || this.defaultTopic
    try {
      await this.client.publish(finalTopic, message)
      console.log(`[MQTT] Published to ${finalTopic}: ${message}`)
    } catch (e) {
      console.error('[MQTT] Publish failed:', e)
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end(true)
      this.client = null
    }
  }
}

