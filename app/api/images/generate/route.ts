import { type NextRequest, NextResponse } from "next/server";

async function makeApiCall(apiUrl: string, payload: any, retries = 5) {
  let backoff = 1000;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 [IMAGE GEN] API attempt ${i + 1}/${retries}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log(`📡 [IMAGE GEN] Response status: ${response.status} ${response.statusText}`);
      console.log(`📡 [IMAGE GEN] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ [IMAGE GEN] Error response body:`, errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(`API Error: ${errorData.error?.message || errorData.message || response.statusText}`);
      }

      const responseData = await response.json();
      console.log(`✅ [IMAGE GEN] API call successful on attempt ${i + 1}`);
      return responseData;
    } catch (error) {
      console.log(`⚠️  [IMAGE GEN] Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      console.log(`⏳ [IMAGE GEN] Retrying in ${backoff}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }
}

export async function POST(request: NextRequest) {
  let recipeName = 'food';

  try {
    const { recipeName: name } = await request.json();
    recipeName = name || 'food';

    console.log('🖼️  [IMAGE GEN] Starting image generation for recipe:', recipeName);

    if (!recipeName || recipeName === 'food') {
      console.log('❌ [IMAGE GEN] Recipe name is missing or invalid:', recipeName);
      return NextResponse.json({ error: "Recipe name is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('❌ [IMAGE GEN] API key not configured');
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{
            parts: [{
              text: `A delicious, professionally photographed plate of ${recipeName}. Filipino cuisine, centered, vibrant colors, appetizing, high-resolution food photography, traditional presentation.`
            }]
        }],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
        },
    };

    console.log('🔗 [IMAGE GEN] API URL:', apiUrl.split('?')[0]);
    console.log('📦 [IMAGE GEN] Request payload:', JSON.stringify(payload, null, 2));
    
    const result = await makeApiCall(apiUrl, payload);
    console.log('📥 [IMAGE GEN] Raw API response:', JSON.stringify(result, null, 2));
    
    console.log('🔍 [IMAGE GEN] Parsing response structure...');
    
    // Log the response structure step by step
    console.log('📊 [IMAGE GEN] Response has candidates?', !!result?.candidates);
    console.log('📊 [IMAGE GEN] Candidates length:', result?.candidates?.length || 0);
    
    if (result?.candidates?.[0]) {
      console.log('📊 [IMAGE GEN] First candidate content:', JSON.stringify(result.candidates[0].content, null, 2));
      console.log('📊 [IMAGE GEN] First candidate parts:', JSON.stringify(result.candidates[0].content?.parts, null, 2));
    }
    
    const base64Data = result?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
    
    console.log('🖼️  [IMAGE GEN] Found base64 data?', !!base64Data);
    console.log('📏 [IMAGE GEN] Base64 data length:', base64Data?.length || 0);
    
    if (base64Data) {
      const imageUrl = `data:image/png;base64,${base64Data}`;
      console.log('✅ [IMAGE GEN] Successfully generated image URL');
      return NextResponse.json({
        imageUrl,
        alt: `Delicious ${recipeName} - Filipino cuisine`,
      });
    } else {
      console.log('❌ [IMAGE GEN] No image data found in response');
      throw new Error("No image data was found in the API response.");
    }
    
  } catch (error) {
    console.error("💥 [IMAGE GEN] Fatal error:", error);
    console.error("💥 [IMAGE GEN] Error stack:", error instanceof Error ? error.stack : 'No stack trace');

    const fallbackUrl = `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(`Filipino dish ${recipeName} photography`)}`;
    
    console.log("🔄 [IMAGE GEN] Falling back to placeholder:", fallbackUrl);
    
    return NextResponse.json({
      imageUrl: fallbackUrl,
      alt: `Delicious ${recipeName} - Filipino cuisine`,
      error: "Image generation failed, using placeholder",
      debug: {
        errorMessage: error instanceof Error ? error.message : String(error),
        recipeName: recipeName
      }
    });
  }
}