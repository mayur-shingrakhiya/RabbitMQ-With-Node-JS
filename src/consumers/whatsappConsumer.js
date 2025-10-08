import { connectRabbitMQ, EXCHANGE_NAME } from "../config/rabbitmq.js";

export const startWhatsAppConsumer = async () => {
  const { connection, channel } = await connectRabbitMQ();

  // Use env variable with default
  const WHATSAPP_QUEUE = process.env.WHATSAPP_QUEUE || "whatsapp";
  const queue = `${WHATSAPP_QUEUE}_queue`;

  // Declare durable queue and bind to topic exchange
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, EXCHANGE_NAME, `notify.*.${WHATSAPP_QUEUE}`);

  console.log(`📥 [WhatsApp] Waiting for messages in queue "${queue}"...`);

  // Consume messages
  channel.consume(queue, (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log("💬 WhatsApp Message:", data);
        channel.ack(msg);
      } catch (err) {
        console.error("❌ Failed to parse message:", err);
        channel.nack(msg, false, false); // optionally discard bad messages
      }
    }
  });

  // Handle connection errors
  connection.on("error", (err) => console.error("RabbitMQ connection error:", err));
  connection.on("close", () => console.warn("RabbitMQ connection closed"));

  return { connection, channel };
};