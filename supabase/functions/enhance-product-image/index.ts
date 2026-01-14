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
                text: `Eres un retocador fotográfico profesional especializado en comida. Tu trabajo es realizar retoques SUTILES y CONSERVADORES que respeten completamente el producto original.

REGLAS CRÍTICAS - RESPETAR EL PRODUCTO:
1. PRESERVAR LA AUTENTICIDAD: El producto debe verse exactamente como es. NO alterar la forma, tamaño, ni características distintivas del alimento.

2. TEXTURAS ORIGINALES: Mantener 100% las texturas reales del producto (pan, carne, queso, vegetales). NO suavizar ni modificar las texturas naturales.

3. COLORES FIELES: Mantener los colores originales del producto. Solo corregir dominantes de color causadas por iluminación deficiente, sin alterar los tonos naturales del alimento.

RETOQUES SUTILES PERMITIDOS:
1. FONDO: Limpiar el fondo a blanco puro (#FFFFFF) si tiene manchas o imperfecciones. Conservar las sombras naturales del producto.

2. ILUMINACIÓN: Correcciones mínimas de exposición solo si la foto está subexpuesta o sobreexpuesta. Equilibrar luces y sombras de forma natural.

3. NITIDEZ: Aplicar enfoque sutil para resaltar la definición del producto sin crear artefactos ni aspecto artificial.

4. LIMPIEZA: Eliminar solo polvo, manchas en el plato o imperfecciones evidentes que distraigan. NO eliminar características naturales del producto.

PROHIBIDO:
- Alterar proporciones o tamaño del producto
- Suavizar o modificar texturas (pan tostado, queso derretido, carne, etc.)
- Saturar excesivamente los colores
- Añadir efectos artificiales de brillo o vapor
- Hacer el producto verse diferente a la realidad

OUTPUT: La misma foto con correcciones mínimas profesionales. El cliente debe recibir exactamente lo que ve en la foto.`
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
