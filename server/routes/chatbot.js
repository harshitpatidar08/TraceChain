import express from 'express'
import Groq from 'groq-sdk'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
})

router.post('/', async (req, res) => {
  try {
    const { message, productContext, conversationHistory } = req.body
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' })
    }

    const systemPrompt = productContext
      ? `You are TraceBot, a supply chain safety assistant 
         for TraceChain. Current product context:
         Product: ${productContext.name}
         Brand: ${productContext.brand}  
         Status: ${productContext.status}
         Expiry: ${productContext.exp_date}
         Origin: ${productContext.origin}
         Trust Score: ${productContext.trustScore}
         
         Answer questions about this product specifically.
         Keep responses short and helpful.
         Respond in same language as user (Hindi or English).`
      : `You are TraceBot, a supply chain safety assistant 
         for TraceChain. Help users understand product 
         journeys, food safety, expiry risks, and supply 
         chain transparency. Keep responses short and helpful.
         Respond in same language as user (Hindi or English).`

    const messages = [
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 300,
      temperature: 0.7
    })

    const reply = completion.choices[0].message.content

    res.json({ reply })

  } catch (error) {
    console.error('Groq error:', error)
    res.status(500).json({ 
      error: 'Chatbot service unavailable',
      details: error.message 
    })
  }
})

export default router;