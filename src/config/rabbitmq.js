import amqp from "amqplib";

export const EXCHANGE_NAME = "notify_exchange";

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  // Make sure exchange type is topic
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

  return { connection, channel };
};