import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini SDK lazily to avoid crashing if GEMINI_API_KEY is not initialised
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Carbon AI Insights Generator proxy
  app.post("/api/insights", async (req, res) => {
    const { input, emissions, sustainabilityScore, grade, gradeLabel } = req.body;

    if (!input || !emissions) {
      res.status(400).json({ error: "Missing required footprint input values." });
      return;
    }

    // SERVER-SIDE INPUT SANITIZATION & STRICT VALIDATION (Security Improvements)
    const safeTravelDistance = Math.max(0, Math.min(500, Number(input.travelDistance) || 0));
    const safeTransportType = ['car', 'bike', 'bus', 'train', 'ev', 'walking'].includes(input.transportType) 
      ? input.transportType 
      : 'walking';
    
    const safeElectricityConsume = Math.max(0, Math.min(5000, Number(input.electricityConsume) || 0));
    const safeFoodPref = ['vegetarian', 'mixed', 'meat'].includes(input.foodPref) 
      ? input.foodPref 
      : 'mixed';

    const safeFlightsPerYear = Math.max(0, Math.min(100, Number(input.flightsPerYear) || 0));
    const safeWaterConsume = Math.max(0, Math.min(1000, Number(input.waterConsume) || 0));

    // Emissions breakdown sanitization
    const safeEmissions = {
      transport: Math.max(0, Number(emissions.transport) || 0),
      electricity: Math.max(0, Number(emissions.electricity) || 0),
      food: Math.max(0, Number(emissions.food) || 0),
      flights: Math.max(0, Number(emissions.flights) || 0),
      water: Math.max(0, Number(emissions.water) || 0),
      total: Math.max(0, Number(emissions.total) || 0)
    };

    const safeSustainabilityScore = Math.max(5, Math.min(100, Number(sustainabilityScore) || 50));
    const safeGrade = ['A', 'B', 'C', 'D', 'E'].includes(grade) ? grade : 'C';
    const safeGradeLabel = String(gradeLabel || 'Green Path Traveler').replace(/[^\w\s-]/g, "");

    try {
      const gemini = getGeminiClient();

      const prompt = `
        You are EcoTrack AI, an elite carbon sustainability auditor.
        The user has calculated their household carbon footprint and has these statistics:
        - Daily travel distance: ${safeTravelDistance} km via ${safeTransportType}
        - Monthly electricity consumption: ${safeElectricityConsume} kWh
        - Food preference: ${safeFoodPref}
        - Flights taken per year: ${safeFlightsPerYear} flights
        - Daily water consumption: ${safeWaterConsume} liters
        
        This results in the following yearly CO2 emissions:
        - Transport: ${safeEmissions.transport} kg CO2/year
        - Electricity: ${safeEmissions.electricity} kg CO2/year
        - Food: ${safeEmissions.food} kg CO2/year
        - Flights: ${safeEmissions.flights} kg CO2/year
        - Water: ${safeEmissions.water} kg CO2/year
        - TOTAL: ${safeEmissions.total} kg CO2/year
        - Sustainability Score: ${safeSustainabilityScore} / 100
        - Environmental Grade: ${safeGrade} (${safeGradeLabel})

        Generate 3-4 highly personalized, specific, and actionable climate actions to reduce this footprint, plus a positive motivational summary.
        Provide the response in the exact JSON schema requested.
      `;

      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              personalizedSummary: {
                type: Type.STRING,
                description: "A summary addressing their performance, grade, and encouragement. Keep it friendly and concise."
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING, description: "Must be energy, transport, diet, water or general." },
                    title: { type: Type.STRING },
                    impactText: { type: Type.STRING, description: "A realistic expected CO2 savings text, e.g. 'Saves ~300 kg CO2/year'" },
                    priority: { type: Type.STRING, description: "high, medium, or low" },
                    text: { type: Type.STRING, description: "Actionable details on how the user can implement this advice." },
                    actionable: { type: Type.BOOLEAN }
                  },
                  required: ["id", "category", "title", "impactText", "priority", "text", "actionable"]
                }
              }
            },
            required: ["personalizedSummary", "recommendations"]
          }
        }
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText);

      res.json({
        aiGenerated: true,
        ...data
      });
    } catch (err: any) {
      console.warn("Gemini AI API was unable to process, utilizing local deterministic insights fallback.", err.message);
      // Fallback is handled cleanly on the client side with the key 'aiGenerated: false'
      // No leakage of sensitive local configuration/key errors is returned to the browser client.
      res.json({
        aiGenerated: false,
        message: "Offline server fallback"
      });
    }
  });

  // Integrate Vite for dev, or static asset server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoTrack AI Fullstack Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical error starting Express + Vite server:", err);
});
