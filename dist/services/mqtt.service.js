"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttService = void 0;
const common_1 = require("@nestjs/common");
const mqtt_1 = require("mqtt");
let MqttService = class MqttService {
    client = null;
    url = process.env.MQTT_URL || '';
    username = process.env.MQTT_USERNAME;
    password = process.env.MQTT_PASSWORD;
    defaultTopic = process.env.MQTT_TOPIC || 'devices/control';
    ensureClient() {
        if (this.client || !this.url)
            return;
        try {
            this.client = (0, mqtt_1.connect)(this.url, {
                username: this.username,
                password: this.password,
            });
            this.client.on('connect', () => {
                console.log('[MQTT] Connected');
            });
            this.client.on('reconnect', () => {
                console.log('[MQTT] Reconnecting...');
            });
            this.client.on('error', (err) => {
                console.error('[MQTT] Error:', err?.message || err);
            });
            this.client.on('close', () => {
                console.log('[MQTT] Connection closed');
            });
        }
        catch (e) {
            console.error('[MQTT] Failed to initialize client:', e);
        }
    }
    async publishMessage(message, topic) {
        this.ensureClient();
        if (!this.client) {
            console.warn('[MQTT] Client not configured. Set MQTT_URL to enable publishing.');
            return;
        }
        const finalTopic = topic || this.defaultTopic;
        try {
            await this.client.publish(finalTopic, message);
            console.log(`[MQTT] Published to ${finalTopic}: ${message}`);
        }
        catch (e) {
            console.error('[MQTT] Publish failed:', e);
        }
    }
    onModuleDestroy() {
        if (this.client) {
            this.client.end(true);
            this.client = null;
        }
    }
};
exports.MqttService = MqttService;
exports.MqttService = MqttService = __decorate([
    (0, common_1.Injectable)()
], MqttService);
