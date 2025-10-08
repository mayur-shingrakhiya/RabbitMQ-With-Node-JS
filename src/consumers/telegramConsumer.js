import { connectRabbitMQ, EXCHANGE_NAME } from "../config/rabbitmq.js";

export const startTelegramConsumer = async () => {
  const { connection, channel } = await connectRabbitMQ();

  // Use env variable with default
  const TELEGRAM_QUEUE = process.env.TELEGRAM_QUEUE || "telegram";
  const queue = `${TELEGRAM_QUEUE}_queue`;

  // Declare durable queue and bind to topic exchange
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, EXCHANGE_NAME, `notify.*.${TELEGRAM_QUEUE}`);

  console.log(`📥 [Telegram] Waiting for messages in queue "${queue}"...`);

  // Consume messages
  channel.consume(queue, (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log("💬 Telegram Message:", data);
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