import { connectRabbitMQ, EXCHANGE_NAME } from "../config/rabbitmq.js";

export const sendNotification = async (messageType, channels, payload) => {
  const { connection, channel } = await connectRabbitMQ();

  // Ensure channels is always an array
  if (!Array.isArray(channels)) channels = [channels];

  for (const channelName of channels) {
    const routingKey = `notify.${messageType}.${channelName}`;
    console.log("Routing Key:", routingKey);

    // Create Queue
    await channel.assertQueue(`${channelName}_queue`, { durable: true });

    // exchange connection(bind) with queue help of routing key
    await channel.bindQueue(`${channelName}_queue`, EXCHANGE_NAME, routingKey);
    
    // Publish message with persistence
    channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true } // ensures message survives broker restart
    );

    console.log(`📤 Sent → ${routingKey}`, payload);
  }

  // Close connection gracefully
  await channel.close();
  await connection.close();
};