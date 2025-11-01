#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "GWHub";
const char* password = "herz8073!";

const char* mqtt_server = "ec2-44-223-34-3.compute-1.amazonaws.com";
const int mqtt_port = 1883; 
const char* mqtt_user = "mosquitto_gwhub";
const char* mqtt_pass = "Pass123123@";

WiFiClient espClient;
PubSubClient client(espClient);

const int ledPins[6] = {18, 19, 21, 22, 26, 27};

const char* topic_leds = "leds";

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando em ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida [");
  Serial.print(topic);
  Serial.print("]: ");

  String msg;
  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }
  Serial.println(msg);

  if (msg.startsWith("LED")) {
    int ledIndex = msg.substring(3, 4).toInt() - 1;
    if (ledIndex >= 0 && ledIndex < 8) {
      if (msg.endsWith("ON")) {
        digitalWrite(ledPins[ledIndex], HIGH);
        Serial.printf("LED %d ligado\n", ledIndex + 1);
      } else if (msg.endsWith("OFF")) {
        digitalWrite(ledPins[ledIndex], LOW);
        Serial.printf("LED %d desligado\n", ledIndex + 1);
      }
    }
  }

  if (msg == "ALL:ON") {
    for (int i = 0; i < 8; i++) digitalWrite(ledPins[i], HIGH);
    Serial.println("Todos os LEDs ligados");
  } else if (msg == "ALL:OFF") {
    for (int i = 0; i < 8; i++) digitalWrite(ledPins[i], LOW);
    Serial.println("Todos os LEDs desligados");
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando ao MQTT...");
    if (client.connect("ESP32_LED_CLIENT", mqtt_user, mqtt_pass)) {
      Serial.println("conectado!");
      client.subscribe(topic_leds);
      Serial.printf("Inscrito no tópico: %s\n", topic_leds);
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5s");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  for (int i = 0; i < 8; i++) {
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], LOW);
  }

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();
}

// LED1:ON (Liga o LED pino 1)
// LED1:OFF (Desliga o LED pino 1)
// ALL:ON (Liga todos os LEDs)
// ALL:OFF (Desliga todos os LEDs)