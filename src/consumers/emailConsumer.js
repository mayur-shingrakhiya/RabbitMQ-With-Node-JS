import { connectRabbitMQ, EXCHANGE_NAME } from "../config/rabbitmq.js";

export const startEmailConsumer = async () => {
  const { connection, channel } = await connectRabbitMQ();

  // Use env variable with default
  const EMAIL_QUEUE = process.env.EMAIL_QUEUE || "email";
  const queue = `${EMAIL_QUEUE}_queue`;

  // Declare durable queue and bind to topic exchange
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, EXCHANGE_NAME, `notify.*.${EMAIL_QUEUE}`);

  console.log(`📥 [Email] Waiting for messages in queue "${queue}"...`);

  // Consume messages
  channel.consume(queue, (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log("💬 Email Message:", data);
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