import { startWhatsAppConsumer } from "./consumers/whatsappConsumer.js";
import { startTelegramConsumer } from "./consumers/telegramConsumer.js";
import { startEmailConsumer } from "./consumers/emailConsumer.js";

(async () => {
  await Promise.all([
    startWhatsAppConsumer(),
    startTelegramConsumer(),
    startEmailConsumer(),
  ]);

  console.log("🚀 All consumers are running...");
})();