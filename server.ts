import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// 1. Airport Search API Proxy
// -------------------------------------------------------------
app.get("/api/airports", async (req: Request, res: Response) => {
  const query = (req.query.q as string || "").trim();
  if (!query) {
    return res.json([]);
  }

  // If user configured an external airport API key, we can query external providers
  const apiKey = process.env.VITE_AIRPORT_API_KEY || process.env.AIRPORT_API_KEY;
  if (apiKey) {
    try {
      // Example external aviation API call if key configured
      const response = await fetch(`https://api.aviationapi.com/v1/airports?apt=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (response.ok) {
        const extData = await response.json();
        return res.json(extData);
      }
    } catch {
      // Silently proceed to fallback
    }
  }

  // Return empty array to let client use its comprehensive embedded database
  return res.json([]);
});

// -------------------------------------------------------------
// 2. Server-side Gemini AI Copilot API
// -------------------------------------------------------------
app.post("/api/gemini/copilot", async (req: Request, res: Response) => {
  try {
    const { message, caseSummary, conversationHistory } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(200).json({
        reply: "I am your FlightFixer AI Copilot. To enable live neural reasoning, ensure GEMINI_API_KEY is active. In the meantime, I am using the direct WebMCP tool dispatcher to evaluate your case and prepare statutory claims!",
        suggestedToolCall: null
      });
    }

    const systemPrompt = `You are FlightFixer Copilot, a helpful, precise aviation passenger rights and flight disruption assistant.
You work in tandem with WebMCP structured tools exposed by the web app:
- analyze_flight_case(args)
- get_case_summary()
- prepare_passenger_request(args)
- approve_and_fill_demo_form(args)

Current Live Application State:
${JSON.stringify(caseSummary || {}, null, 2)}

Instructions:
1. Explain passenger rights clearly based on DGCA CAR (India), EU261, UK261, or Montreal Convention.
2. Emphasize that cash compensation requires specific conditions (cancellation notice <24h, block times, fare basis, delays >= 3-4h), and explain why certain information might be needed.
3. If the user asks to analyze the case, prepare a request, or fill a form, guide them and invoke or suggest the appropriate WebMCP action.
4. Keep answers concise, empathetic, objective, and structured. Always clarify that FlightFixer provides informational guidance and not formal legal advice.`;

    const contents = [];
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-6)) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || msg.content }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents as any,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      }
    });

    const replyText = response.text || "I have analyzed your request based on current aviation guidelines.";
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini Copilot Error:", error);
    return res.status(500).json({ 
      error: "AI_GENERATION_FAILED",
      message: error?.message || "Failed to generate AI response." 
    });
  }
});

// -------------------------------------------------------------
// 3. Health check
// -------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", app: "FlightFixer", version: "1.0.0" });
});

// -------------------------------------------------------------
// 4. Vite & Static Asset Handling
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FlightFixer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
