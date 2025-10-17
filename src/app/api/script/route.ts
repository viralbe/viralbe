import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ScriptRequestBody {
  title: string;
  description?: string;
}

export async function POST(req: Request) {
  try {
    const { title, description } = (await req.json()) as ScriptRequestBody;

    if (!title) {
      return NextResponse.json({ error: "Título ausente." }, { status: 400 });
    }

    const prompt = `
Você é um roteirista profissional de vídeos curtos (Reels, Shorts, TikTok).
Crie um roteiro **bem estruturado em tópicos**, com linguagem natural e emocional, baseado neste vídeo:

🎬 **Título:** ${title}
📖 **Descrição:** ${description || "Sem descrição disponível."}

Regras:
- Use português natural, envolvente e fácil de entender.
- Crie um **gancho forte nos primeiros 3 segundos**.
- Desenvolva o conteúdo em **tópicos curtos e objetivos**.
- Finalize com um **encerramento criativo ou CTA leve**.
- Evite marcações como "CUT", "Cena", "Narrador" etc.
- Estruture exatamente assim:

---
🎯 **Gancho (0–3s)**
• Frase inicial que desperta curiosidade imediata.

💡 **Conteúdo (4–25s)**
• Liste as ideias principais em tópicos curtos e impactantes.  
• Mostre o raciocínio passo a passo, sem enrolação.  
• Mantenha ritmo rápido e fluido.

🔥 **Encerramento / CTA (26–35s)**
• Feche com uma reflexão, desafio, ou convite para seguir / comentar.
---

Gere o roteiro agora com formatação organizada e estilo viral, sem texto desnecessário.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um roteirista criativo especialista em transformar vídeos comuns em virais curtos e envolventes.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 450,
    });

    const script =
      response.choices[0]?.message?.content?.trim() ||
      "❌ Não foi possível gerar o roteiro. Tente novamente.";

    return NextResponse.json({ script });
  } catch (error: unknown) {
    console.error("Erro ao gerar roteiro:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erro interno ao gerar roteiro.", message },
      { status: 500 }
    );
  }
}
