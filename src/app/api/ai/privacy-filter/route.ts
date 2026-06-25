import { NextResponse } from "next/server";
import { ai, MODELS } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    
    // 1. Ask Gemini to find bounding boxes for faces and license plates
    const prompt = `
      Analyze this image for PII (Personally Identifiable Information), specifically faces and vehicle license plates.
      Return a JSON array of bounding boxes for each detected face or license plate.
      If none are found, return an empty array.
      
      For each bounding box, provide:
      - x: top-left x coordinate (as a percentage of image width, 0.0 to 1.0)
      - y: top-left y coordinate (as a percentage of image height, 0.0 to 1.0)
      - width: width of bounding box (as a percentage of image width, 0.0 to 1.0)
      - height: height of bounding box (as a percentage of image height, 0.0 to 1.0)
      - type: "face" or "license_plate"
    `;

    const aiResponse = await ai.models.generateContent({
      model: MODELS.flash,
      contents: [
        prompt,
        { inlineData: { data: base64, mimeType: file.type } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              x: { type: "NUMBER" },
              y: { type: "NUMBER" },
              width: { type: "NUMBER" },
              height: { type: "NUMBER" },
              type: { type: "STRING" },
            },
            required: ["x", "y", "width", "height", "type"],
          }
        },
        temperature: 0.1,
      },
    });

    const boundingBoxes = JSON.parse(aiResponse.text || "[]");
    
    // 2. Process image with sharp to apply blur
    let finalImageBuffer = buffer;
    
    if (boundingBoxes.length > 0) {
      const metadata = await sharp(buffer).metadata();
      const imgWidth = metadata.width || 800;
      const imgHeight = metadata.height || 600;
      
      let imageProcessing = sharp(buffer);
      
      // Since sharp composite needs specific buffers, we need to create blurred patches
      // For simplicity in this demo, we'll apply a heavy blur to the whole image,
      // extract the regions, and overlay them on the original.
      const blurredFull = await sharp(buffer).blur(25).toBuffer();
      
      const composites = await Promise.all(
        boundingBoxes.map(async (box: any) => {
          // Convert percentage to pixels
          let left = Math.floor(box.x * imgWidth);
          let top = Math.floor(box.y * imgHeight);
          let width = Math.ceil(box.width * imgWidth);
          let height = Math.ceil(box.height * imgHeight);
          
          // Ensure within bounds
          left = Math.max(0, left);
          top = Math.max(0, top);
          width = Math.min(width, imgWidth - left);
          height = Math.min(height, imgHeight - top);
          
          // Extract the blurred patch
          const patch = await sharp(blurredFull)
            .extract({ left, top, width, height })
            .toBuffer();
            
          return {
            input: patch,
            top,
            left,
          };
        })
      );
      
      finalImageBuffer = await imageProcessing.composite(composites).toBuffer();
    }
    
    // 3. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("issue-media")
      .upload(fileName, finalImageBuffer, {
        contentType: file.type || "image/jpeg",
        upsert: false
      });
      
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from("issue-media")
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      pii_redacted: boundingBoxes.length > 0,
      boxes_detected: boundingBoxes.length
    });
    
  } catch (error: any) {
    console.error("Privacy Filter Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}
