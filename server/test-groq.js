#!/usr/bin/env node
/**
 * Test script for Groq API integration
 * This tests the Groq provider directly without the full server
 */

import 'dotenv/config'
import { createGroqProvider } from './src/services/ai/groq.provider.js'

async function testGroqProvider() {
  console.log('🧪 Testing Groq Provider...\n')

  // Test 1: Provider initialization
  console.log('1️⃣  Testing provider initialization...')
  try {
    const provider = createGroqProvider()
    console.log('✅ Provider created successfully')
    console.log(`   Provider name: ${provider.name}`)
  } catch (error) {
    console.error('❌ Provider initialization failed:', error.message)
    process.exit(1)
  }

  // Test 2: Simple message generation
  console.log('\n2️⃣  Testing simple message generation...')
  try {
    const provider = createGroqProvider()
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      {
        role: 'user',
        content: 'Say hello and introduce yourself briefly.',
      },
    ]

    console.log('📤 Sending request to Groq API...')
    console.log('   Messages:', JSON.stringify(messages, null, 2))

    const response = await provider.generate({ messages })
    console.log('✅ Response received successfully')
    console.log(`   Response length: ${response.length} characters`)
    console.log(`   Response preview: ${response.substring(0, 100)}...`)
  } catch (error) {
    console.error('❌ Generation failed:', error.message)
    if (error.details) {
      console.error('   Details:', error.details)
    }
    process.exit(1)
  }

  // Test 3: Streaming
  console.log('\n3️⃣  Testing streaming...')
  try {
    const provider = createGroqProvider()
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      {
        role: 'user',
        content: 'Count from 1 to 5.',
      },
    ]

    console.log('📤 Sending streaming request to Groq API...')
    
    let fullResponse = ''
    let chunkCount = 0

    for await (const chunk of provider.stream({ messages })) {
      fullResponse += chunk
      chunkCount++
      process.stdout.write(chunk)
    }

    console.log('\n✅ Streaming completed successfully')
    console.log(`   Total chunks received: ${chunkCount}`)
    console.log(`   Total response length: ${fullResponse.length} characters`)
  } catch (error) {
    console.error('❌ Streaming failed:', error.message)
    if (error.details) {
      console.error('   Details:', error.details)
    }
    process.exit(1)
  }

  console.log('\n✅ All tests passed!')
  process.exit(0)
}

// Run tests
testGroqProvider().catch((error) => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
