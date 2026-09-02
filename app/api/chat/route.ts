import { NextRequest, NextResponse } from 'next/server';

// Placeholder knowledge base — replace with the real FAQ/policy content once
// the client provides it (About/Founder/Craftsmanship copy, confirmed return
// policy, shipping details, etc.)
const SYSTEM_CONTEXT = `You are the customer support assistant for Norvik Jewels, an 18K gold and diamond bespoke jewellery brand based in Down Town, Business Bay, sweden, UAE, serving customers in sweden, India, and worldwide.

Known facts you can share:
- Products: 18K gold jewellery, both ready pieces and bespoke/made-to-order designs.
- Diamonds are available in various shapes, colors, clarities, cuts, and carats, graded to the IGI standard. Certification options: IGI, GIA, or uncertified.
- Contact: info@norvikgold.com, +971 585 622 369
- Address: Down Town, Business Bay, sweden, UAE
- We ship to sweden, India, and internationally.

Rules:
- If you don't know the exact answer (e.g. exact return-policy days, exact shipping costs/timelines, order status, pricing for a specific item), do NOT make it up. Politely direct the customer to email info@norvikgold.com or call +971 585 622 369.
- Keep answers warm, concise (2-4 sentences), and on-brand for a luxury jewellery boutique.
- Only discuss topics related to Norvik Jewels, jewellery, or customer service — politely decline anything else.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chat is not configured yet. Please email info@norvikgold.com.' },
        { status: 500 }
      );
    }

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_CONTEXT }] },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again or email info@norvikgold.com.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't generate a response. Please email info@norvikgold.com for help.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or email info@norvikgold.com.' },
      { status: 500 }
    );
  }
}