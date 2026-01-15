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
                text: `Eres un retocador fotográfico profesional especializado en fotografía de alimentos para menús digitales. Tu trabajo es preparar imágenes de productos con fondo blanco profesional.

TAREA PRINCIPAL - FONDO BLANCO:
Reemplazar CUALQUIER fondo existente por un fondo BLANCO PURO (#FFFFFF). Esto es OBLIGATORIO sin importar el fondo original. El producto debe quedar perfectamente recortado sobre blanco limpio.

REGLAS CRÍTICAS - RESPETAR EL PRODUCTO:
1. PRESERVAR LA AUTENTICIDAD: El producto debe verse exactamente como es. NO alterar la forma, tamaño, ni características distintivas del alimento.

2. TEXTURAS ORIGINALES: Mantener 100% las texturas reales del producto (pan, carne, queso, vegetales). NO suavizar ni modificar las texturas naturales.

3. COLORES FIELES: Mantener los colores originales del producto. Solo corregir dominantes de color causadas por iluminación deficiente, sin alterar los tonos naturales del alimento.

RETOQUES PERMITIDOS:
1. FONDO BLANCO: Reemplazar completamente el fondo por blanco puro (#FFFFFF). Conservar una sombra suave y natural debajo del producto para dar profundidad.

2. ILUMINACIÓN: Correcciones mínimas de exposición si la foto está subexpuesta o sobreexpuesta.

3. NITIDEZ: Aplicar enfoque sutil para resaltar la definición del producto.

4. LIMPIEZA: Eliminar polvo, manchas en el plato o imperfecciones que distraigan.

PROHIBIDO:
- Alterar proporciones o tamaño del producto
- Suavizar o modificar texturas naturales
- Saturar excesivamente los colores
- Añadir efectos artificiales de brillo o vapor
- Dejar cualquier rastro del fondo original

OUTPUT: Foto del producto con fondo blanco puro, sombra natural suave, y el producto intacto en su autenticidad.`
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
      
      // Handle specific error codes
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'credits_exhausted', message: 'No hay créditos suficientes para la mejora con IA' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'rate_limited', message: 'Demasiadas solicitudes, intenta de nuevo en unos segundos' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'ai_error', message: 'Error al procesar la imagen con IA', details: errorText }),
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
