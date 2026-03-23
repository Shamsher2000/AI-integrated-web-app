#!/usr/bin/env node
/**
 * Test script for Groq API with actual chat flow
 */

import 'dotenv/config'
import { createGroqProvider } from './src/services/ai/groq.provider.js'
import { buildPromptMessages } from './src/constants/assistantPrompt.js'

async function testGroqWithChatFlow() {
  console.log('🧪 Testing Groq with Real Chat Flow...\n')

  try {
    const provider = createGroqProvider()

    // Simulate a real chat flow with history
    const history = [
      {
        role: 'user',
        content: 'What is React?',
      },
      {
        role: 'assistant',
        content: 'React is a JavaScript library for building user interfaces with reusable components.',
      },
    ]

    const userInput = 'Tell me more about components'

    // Build messages the same way the app does
    const messages = buildPromptMessages({ history, userInput })

    console.log('📋 Message structure:')
    messages.forEach((msg, idx) => {
      console.log(`  Message ${idx}:`)
      console.log(`    Role: ${msg.role}`)
      console.log(`    Content length: ${msg.content.length} chars`)
      console.log(`    Content preview: ${msg.content.substring(0, 60)}...`)
    })

    console.log('\n🚀 Testing non-streaming generation...')
    const response = await provider.generate({ messages })
    console.log('✅ Non-streaming successful!')
    console.log(`   Response: ${response.substring(0, 100)}...`)

    console.log('\n🚀 Testing streaming generation...')
    let streamedResponse = ''
    let chunks = 0

    for await (const chunk of provider.stream({ messages })) {
      streamedResponse += chunk
      chunks++
    }

    console.log('✅ Streaming successful!')
    console.log(`   Chunks: ${chunks}`)
    console.log(`   Response: ${streamedResponse.substring(0, 100)}...`)

    console.log('\n✅ All chat flow tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('   Status:', error?.status || 'unknown')
    console.error('   Full error:', error)
    process.exit(1)
  }
}

testGroqWithChatFlow()
