# AI Advisor Edge Function Deployment

## Deploy Command

To deploy the ai-advisor function without JWT verification:

```bash
supabase functions deploy ai-advisor --no-verify-jwt
```

## Alternative: Using config.json

The `config.json` file in this directory already disables JWT verification:

```json
{
  "verify_jwt": false
}
```

When you deploy with:

```bash
supabase functions deploy ai-advisor
```

It will automatically read the config.json and disable JWT verification.

## Environment Variables

### OpenRouter API Key (Required)

The function now uses OpenRouter's free models instead of OpenAI. Set the API key:

```bash
supabase secrets set OPENROUTER_API_KEY=your-openrouter-api-key
```

To get an OpenRouter API key:
1. Go to https://openrouter.ai/
2. Sign up for a free account
3. Navigate to Keys section
4. Create a new API key
5. The function uses `openrouter/auto:free` model which routes to free models

## Verify Deployment

After deployment, test the function:

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/ai-advisor \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

You should get a response without 401 Unauthorized errors.

## Troubleshooting

If you still get 401 errors:

1. Verify the config.json exists in the function directory
2. Redeploy with the --no-verify-jwt flag explicitly
3. Check the Supabase dashboard → Edge Functions → ai-advisor → Settings
4. Ensure JWT verification is disabled in the function settings

If you get 500 errors:

1. Check that OPENROUTER_API_KEY is set correctly
2. View logs in Supabase dashboard → Edge Functions → ai-advisor → Logs
3. Verify your OpenRouter account has credits/access to free models
