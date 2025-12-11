import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  onToolCall: (name: string) => void
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  // Inject dynamic date context
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dynamicSystemInstruction = `
${SYSTEM_INSTRUCTION}

CONTEXTO TEMPORAL:
Hoje é: ${today}.
Ao buscar jogos, considere estritamente a data de hoje no fuso horário do Brasil, a menos que o usuário especifique outra data.
`;

  // Initialize Chat with Google Search Tool
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: dynamicSystemInstruction,
      // Enable Google Search Grounding
      tools: [{ googleSearch: {} }],
      temperature: 0.3, // Slightly higher creativity allowed for search synthesis
    },
    history: history.map(h => ({ role: h.role, parts: h.parts })), 
  });

  onToolCall("Google Search (Flashscore/Web)");

  try {
    const result = await chat.sendMessage({ message });
    
    // Check for grounding metadata (sources) if needed, but primarily return text
    // The response text is already grounded by the model
    return result.text || "Não consegui encontrar informações sobre esses jogos no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro ao tentar buscar as informações na web. Tente novamente.";
  }
};