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
Você é um **roteirista profissional e copywriter sênior** especializado em vídeos curtos virais (Reels, Shorts e TikToks).
Seu estilo combina **storytelling + gatilhos mentais + linguagem emocional e natural**.

Baseie-se no vídeo abaixo e **reescreva o conceito em formato de roteiro envolvente**:

🎬 **Título:** ${title}
📖 **Descrição:** ${description || "Sem descrição disponível."}

---
🧠 Diretrizes:
- Linguagem 100% natural e emocional, como se estivesse falando com o público, não escrevendo.
- Gere curiosidade logo no início (ex: perguntas, promessas ou frases polêmicas).
- Use **ritmo rápido, frases curtas e impacto em cada linha**.
- Utilize **gatilhos mentais** como: curiosidade, prova, autoridade, exclusividade, urgência, identificação.
- Nunca soe robótico, vendedor demais ou repetitivo.
- Finalize com uma **reflexão, provocação ou CTA leve e humano** (“me conta aí”, “já passou por isso?”, etc.).
- O tom deve ser **autêntico, direto e com energia de vídeo viral**.

---
📄 **Formato Exato:**

🎯 **Gancho (0–3s)**  
• Frase inicial que prende atenção, gera curiosidade ou causa identificação imediata.  

💡 **Conteúdo (4–25s)**  
• Liste 3 a 5 ideias curtas, diretas e com fluidez natural.  
• Use exemplos, micro-histórias ou frases de impacto.  
• Mantenha o público curioso até o final.  

🔥 **Encerramento / CTA (26–35s)**  
• Feche com uma reflexão, desafio, ou convite leve à ação.  

---
💬 **Exemplo de estilo:**

🎯 Gancho  
• "Tem uma coisa que quase ninguém te conta sobre crescer na internet..."  

💡 Conteúdo  
• A maioria acha que é sorte, mas é consistência disfarçada.  
• Você posta 10 vezes, ninguém liga. Na 11ª, estoura.  
• Só que quase ninguém chega até a 11ª.  

🔥 Encerramento  
• Então, se quer viralizar, para de desistir no 10.  

---
Agora gere o roteiro com esse mesmo nível de naturalidade e impacto, adaptado ao tema acima.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Você é um roteirista e copywriter profissional especializado em vídeos curtos virais. Sua escrita é humana, emocional e orientada à performance.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.9, // mais criatividade
      max_tokens: 600, // mais espaço pra nuances
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
