import dotenv from 'dotenv'

dotenv.config()

const requiredVariables = ['MONGO_URI', 'JWT_SECRET']

for (const variableName of requiredVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`)
  }
}

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: toNumber(process.env.PORT, 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  clientUrls: Array.from(
    new Set([
      'http://localhost:5173',
      'http://localhost:4173',
      ...parseOrigins(process.env.CLIENT_URL),
      ...parseOrigins(process.env.CLIENT_URLS),
    ]),
  ),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  // AI Provider configuration - supports 'groq', 'openai', 'huggingface'
  aiProvider: (process.env.AI_PROVIDER || 'groq').toLowerCase(),
  // Groq AI Provider
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  groqMaxTokens: toNumber(process.env.GROQ_MAX_TOKENS, 3000),
  // OpenAI Provider
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4',
  openAiMaxTokens: toNumber(process.env.OPENAI_MAX_TOKENS, 3000),
  // HuggingFace Provider
  huggingFaceApiKey: process.env.HUGGINGFACE_API_KEY || '',
  huggingFaceModel: process.env.HUGGINGFACE_MODEL || 'HuggingFaceH/llama-7b',
  huggingFaceMaxTokens: toNumber(process.env.HUGGINGFACE_MAX_TOKENS, 5000),
  maxChatHistory: toNumber(process.env.MAX_CHAT_HISTORY, 12),
  maxContentLength: toNumber(process.env.MAX_CONTENT_LENGTH, 6000),
}
