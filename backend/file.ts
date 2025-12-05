import { chatWithGroq } from "./src/config/groq.client";

async function run() {
  const feedback = await chatWithGroq("Give feedback on: My favorite food is pizza.");
}

run();
