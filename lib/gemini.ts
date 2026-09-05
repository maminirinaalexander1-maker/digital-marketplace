import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

export async function rewriteProductDescription(title: string, description: string) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  let lastError: unknown;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `Tu es un expert en marketing digital pour marketplace de produits numériques. Réécris la description ci-dessous pour la rendre plus commerciale et persuasive, en français, avec un ton premium. Le résultat doit être une seule description cohérente, sans liste à puces, sans guillemets, sans mentionner l'IA.\n\nTitre: ${title}\nDescription originale: ${description}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text.trim();
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(lastError instanceof Error ? lastError.message : 'Erreur lors de la génération IA.');
}
