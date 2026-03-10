// @ts-ignore: Deno types are available in Supabase Edge Functions runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore: Deno runtime
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { message, context } = await req.json()

    // Validate message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from environment
    // @ts-ignore: Deno runtime
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI response' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build personalized system prompt with user context
    let systemPrompt = `You are ApplyAI, a helpful and knowledgeable study abroad advisor. You provide personalized guidance for university applications, scholarships, SOPs, interviews, and all aspects of studying abroad.

Your responses should be:
- Specific and actionable
- Encouraging but realistic
- Based on the user's actual profile and applications
- Professional yet friendly
- Concise but comprehensive

`

    // Add user context to system prompt if available
    if (context) {
      systemPrompt += `\n## USER PROFILE\n`
      
      if (context.profile) {
        const p = context.profile
        systemPrompt += `Name: ${p.name || 'User'}\n`
        if (p.country) systemPrompt += `Current Country: ${p.country}\n`
        if (p.target_country) systemPrompt += `Target Country: ${p.target_country}\n`
        if (p.degree) systemPrompt += `Degree Level: ${p.degree}\n`
        if (p.field_of_study) systemPrompt += `Field of Study: ${p.field_of_study}\n`
        if (p.gpa) systemPrompt += `GPA: ${p.gpa}\n`
        if (p.budget) systemPrompt += `Budget: ${p.budget}\n`
        if (p.english_score) systemPrompt += `English Score: ${p.english_score}\n`
      }

      if (context.applications && context.applications.length > 0) {
        systemPrompt += `\n## CURRENT APPLICATIONS (${context.applications.length})\n`
        context.applications.forEach((app: any, idx: number) => {
          systemPrompt += `${idx + 1}. ${app.university_name || 'Unknown University'}`
          if (app.country) systemPrompt += ` (${app.country})`
          if (app.program) systemPrompt += ` - ${app.program}`
          systemPrompt += `\n   Status: ${app.status || 'Unknown'}`
          if (app.deadline) systemPrompt += ` | Deadline: ${app.deadline}`
          if (app.progress) systemPrompt += ` | Progress: ${app.progress}%`
          systemPrompt += `\n`
        })
      }

      if (context.savedUniversities && context.savedUniversities.length > 0) {
        systemPrompt += `\n## SAVED UNIVERSITIES (${context.savedUniversities.length})\n`
        context.savedUniversities.slice(0, 10).forEach((uni: any, idx: number) => {
          systemPrompt += `${idx + 1}. ${uni.name || 'Unknown'}`
          if (uni.country) systemPrompt += ` (${uni.country})`
          if (uni.ranking) systemPrompt += ` - Rank: ${uni.ranking}`
          systemPrompt += `\n`
        })
      }

      systemPrompt += `\nUse this information to provide personalized, relevant advice. Reference specific universities, deadlines, and details from the user's profile when appropriate.`
    }

    // Call OpenAI Chat Completions API (not Responses API)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    // Check if OpenAI request was successful
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI response' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse OpenAI response
    const data = await openaiResponse.json()
    const reply = data.choices?.[0]?.message?.content || 'No response generated'

    // Return successful response
    return new Response(
      JSON.stringify({ reply }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in ai-advisor function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate AI response' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
