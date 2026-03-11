// @ts-ignore: Deno types are available in Supabase Edge Functions runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// @ts-ignore: Deno runtime
serve(async (req) => {
  console.log("=== AI Advisor Function Called ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      console.log("Method not allowed:", req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    console.log("Parsing request body...");
    let message, context;
    try {
      const body = await req.json();
      console.log("Request body parsed successfully");
      console.log("Body keys:", Object.keys(body));
      message = body.message;
      context = body.context;
      console.log("Message exists:", !!message);
      console.log("Message length:", message?.length || 0);
      console.log("Context exists:", !!context);
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: errorMessage 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.log("Message validation failed");
      console.log("Message value:", message);
      console.log("Message type:", typeof message);
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log("Message:", message.substring(0, 100) + (message.length > 100 ? "..." : ""));

    // Get OpenRouter API key from environment
    // @ts-ignore: Deno runtime
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    console.log("Has OPENROUTER_API_KEY:", !!openrouterApiKey);
    console.log("API key length:", openrouterApiKey?.length || 0);
    
    if (!openrouterApiKey) {
      console.error('OPENROUTER_API_KEY is not set in environment');
      return new Response(
        JSON.stringify({ 
          error: 'AI service temporarily unavailable',
          details: 'API key not configured'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build personalized system prompt with user context
    console.log("Building system prompt...");
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
      console.log("Adding user context to system prompt");
      systemPrompt += `\n## USER PROFILE\n`
      
      if (context.profile) {
        console.log("Profile context exists");
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
        console.log("Applications context:", context.applications.length, "applications");
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
        console.log("Saved universities context:", context.savedUniversities.length, "universities");
        systemPrompt += `\n## SAVED UNIVERSITIES (${context.savedUniversities.length})\n`
        context.savedUniversities.slice(0, 10).forEach((uni: any, idx: number) => {
          systemPrompt += `${idx + 1}. ${uni.name || 'Unknown'}`
          if (uni.country) systemPrompt += ` (${uni.country})`
          if (uni.ranking) systemPrompt += ` - Rank: ${uni.ranking}`
          systemPrompt += `\n`
        })
      }

      systemPrompt += `\nUse this information to provide personalized, relevant advice. Reference specific universities, deadlines, and details from the user's profile when appropriate.`
    } else {
      console.log("No context provided");
    }

    console.log("System prompt length:", systemPrompt.length);

    // Call OpenRouter API with free model
    console.log("Calling OpenRouter API...");
    const openrouterRequestBody = {
      model: 'openrouter/auto:free',
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
    };
    console.log("OpenRouter request model:", openrouterRequestBody.model);
    console.log("OpenRouter request messages count:", openrouterRequestBody.messages.length);

    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://applyai.app',
        'X-Title': 'ApplyAI Study Abroad Advisor',
      },
      body: JSON.stringify(openrouterRequestBody),
    })

    console.log("OpenRouter response status:", openrouterResponse.status);
    console.log("OpenRouter response ok:", openrouterResponse.ok);

    // Check if OpenRouter request was successful
    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text()
      console.error('OpenRouter API error status:', openrouterResponse.status);
      console.error('OpenRouter API error body:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'AI service temporarily unavailable',
          details: `OpenRouter API returned ${openrouterResponse.status}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse OpenRouter response
    console.log("Parsing OpenRouter response...");
    const data = await openrouterResponse.json()
    console.log("OpenRouter response parsed successfully");
    console.log("Response has choices:", !!data.choices);
    console.log("Choices length:", data.choices?.length || 0);
    
    const reply = data.choices?.[0]?.message?.content || 'No response generated'
    console.log("Reply extracted, length:", reply.length);
    console.log("Reply preview:", reply.substring(0, 100) + (reply.length > 100 ? "..." : ""));

    // Return successful response
    console.log("Returning success response");
    return new Response(
      JSON.stringify({ reply }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('=== CRITICAL ERROR in ai-advisor function ===');
    console.error('Error type:', error?.constructor?.name || 'Unknown');
    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return new Response(
      JSON.stringify({ 
        error: 'AI service temporarily unavailable',
        details: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
