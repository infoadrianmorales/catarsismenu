import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image base64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI to enhance the product image with professional food photography techniques
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a professional food photographer and photo retoucher. Enhance this product photo with expert-level retouching while preserving maximum quality and detail.

CRITICAL REQUIREMENTS:
1. BACKGROUND: Ensure a perfectly clean, pure white background (#FFFFFF). Remove any shadows, stains, or imperfections on the background while keeping natural product shadows for depth.

2. LIGHTING & EXPOSURE:
   - Apply professional studio lighting simulation
   - Balance highlights and shadows to show texture and depth
   - Correct any overexposed or underexposed areas
   - Add subtle rim lighting effect to separate product from background

3. COLOR CORRECTION:
   - Enhance color vibrancy to make food look appetizing and fresh
   - Correct any color cast from original lighting
   - Maintain natural, realistic colors - avoid over-saturation
   - Enhance warm tones for cooked foods, fresh greens for salads

4. DETAIL & SHARPNESS:
   - Enhance fine details and textures (meat grain, vegetable freshness, cheese melt)
   - Apply professional sharpening without artifacts
   - Preserve and enhance surface textures that make food appealing

5. PROFESSIONAL TOUCHES:
   - Add subtle food photography glow for freshness
   - Enhance steam or moisture if present
   - Clean up any imperfections on the food that distract from quality
   - Maintain the hero angle and composition

OUTPUT: A magazine-quality product photo suitable for a premium restaurant menu. The result should look like it was shot by a professional food photographer with proper studio lighting on a pure white seamless backdrop.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to enhance image', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!enhancedImageUrl) {
      return new Response(
        JSON.stringify({ error: 'No enhanced image returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ enhancedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error enhancing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
