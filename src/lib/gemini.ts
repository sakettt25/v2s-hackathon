import { GoogleGenerativeAI } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;
const getGenAI = () => {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. AI features will fail.");
    }
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
  }
  return _genAI;
};

export async function analyzeIssueImage(base64Image: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.split(",")[1] || base64Image;

  const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert civic infrastructure AI. Analyze this image of a community issue.
    Return a strictly formatted JSON object with the following structure:
    {
      "category": "Must be exactly one of: 'pothole', 'broken_streetlight', 'garbage', 'water_leak', or 'other'",
      "title": "A short, descriptive title for the issue (max 50 chars)",
      "description": "A detailed, professional description of what is observed in the image (max 200 chars)",
      "severity_score": "A number from 1 to 10 estimating the severity/urgency based on visual evidence"
    }
    Respond ONLY with the raw JSON object, no markdown blocks, no extra text.
  `;

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: "image/jpeg", // Assume JPEG for now, we'll compress on client
    },
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean up markdown block if the model hallucinated it despite instructions
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini AI Analysis failed:", error);
    return null;
  }
}
