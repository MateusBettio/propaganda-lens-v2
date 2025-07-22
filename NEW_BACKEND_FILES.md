# Propaganda Lens AI Backend - File Contents

## Step 1: Create New Project Directory

```bash
cd C:\Users\Mateus\Documents\Projects
mkdir propaganda-lens-ai
cd propaganda-lens-ai
mkdir api
```

## Step 2: Create package.json

```json
{
  "name": "propaganda-lens-ai",
  "version": "1.0.0",
  "description": "AI-powered propaganda analysis backend",
  "main": "api/analyze.js",
  "scripts": {
    "dev": "vercel dev",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "openai": "^4.26.0"
  },
  "engines": {
    "node": "18.x"
  }
}
```

## Step 3: Create api/analyze.js

```javascript
import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, contentType } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Analyze the following ${contentType || 'text'} content for propaganda techniques and manipulation tactics.

Respond with ONLY a valid JSON object with this exact structure:
{
  "quickAssessment": "Brief 1-2 sentence assessment of manipulation level and main concerns",
  "manipulationScore": <number between 0-10 where 0=neutral, 10=highly manipulative>,
  "techniques": [
    {
      "name": "technique name",
      "description": "how this technique is used",
      "confidence": "high|medium|low",
      "example": "specific quote or example from content"
    }
  ],
  "counterPerspective": "Alternative viewpoint or what might be missing from this narrative",
  "reflectionQuestions": [
    "Critical thinking question 1",
    "Critical thinking question 2",
    "Critical thinking question 3"
  ]
}

CONTENT TO ANALYZE:
"""
${content}
"""

Remember: Respond with ONLY valid JSON, no other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in media literacy and propaganda analysis. You analyze content objectively and provide educational insights about manipulation techniques. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Try to parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', responseText);
      
      // Fallback response if JSON parsing fails
      analysisResult = {
        quickAssessment: "Analysis completed but response format needs adjustment",
        manipulationScore: 2,
        techniques: [
          {
            name: "Content Analysis",
            description: "General content evaluation performed",
            confidence: "medium",
            example: "Analysis system processed the content"
          }
        ],
        counterPerspective: "Consider multiple sources and perspectives when evaluating information",
        reflectionQuestions: [
          "What sources support the claims made?",
          "What evidence is presented?",
          "What alternative explanations exist?"
        ]
      };
    }

    // Validate the response structure
    const validatedResult = {
      quickAssessment: analysisResult.quickAssessment || "Analysis completed",
      manipulationScore: Math.max(0, Math.min(10, analysisResult.manipulationScore || 0)),
      techniques: Array.isArray(analysisResult.techniques) ? analysisResult.techniques : [],
      counterPerspective: analysisResult.counterPerspective || "Consider alternative viewpoints",
      reflectionQuestions: Array.isArray(analysisResult.reflectionQuestions) ? analysisResult.reflectionQuestions : []
    };

    res.status(200).json(validatedResult);

  } catch (error) {
    console.error('Analysis error:', error);
    
    res.status(500).json({
      error: 'Analysis failed',
      quickAssessment: "Technical error occurred during analysis",
      manipulationScore: 0,
      techniques: [],
      counterPerspective: "Unable to complete analysis due to technical issues",
      reflectionQuestions: [
        "Is this content from a reliable source?",
        "What verification can be done independently?",
        "Are there alternative sources to consult?"
      ]
    });
  }
}
```

## Step 4: Create vercel.json

```json
{
  "version": 2,
  "functions": {
    "api/analyze.js": {
      "runtime": "@vercel/node@18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

## Step 5: Create .env.sample

```
# Copy to .env and fill in before deploying
OPENAI_API_KEY=sk-your-openai-key-here
```

## Step 6: Create .gitignore

```
node_modules/
.env
.vercel
*.log
.DS_Store
```

## Step 7: Create README.md

```markdown
# Propaganda Lens AI Backend

Clean, modern serverless backend for propaganda analysis using OpenAI.

## Setup

1. Clone and install:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.sample .env
   # Edit .env and add your OpenAI API key
   ```

3. Deploy to Vercel:
   ```bash
   vercel login
   vercel
   # Follow prompts, choose "propaganda-lens-ai" as project name
   ```

4. Add environment variable in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `OPENAI_API_KEY` with your OpenAI key

## API Endpoint

**POST** `/api/analyze`

Request:
```json
{
  "content": "Text content to analyze",
  "contentType": "text"
}
```

Response:
```json
{
  "quickAssessment": "Brief assessment...",
  "manipulationScore": 3,
  "techniques": [...],
  "counterPerspective": "Alternative view...",
  "reflectionQuestions": [...]
}
```

## Testing

```bash
curl -X POST https://propaganda-lens-ai.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"content":"BREAKING: Scientists hate this one weird trick!","contentType":"text"}'
```
```