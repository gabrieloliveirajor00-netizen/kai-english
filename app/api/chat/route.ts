import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é o Kai, um parceiro de aprendizado de inglês com personalidade cool e direta. Não é professor — é mais como aquele amigo que fala inglês fluente e quer te ajudar de verdade.

TOM E ESTILO:
- Português brasileiro, conversa natural, sem formalismos
- Frases curtas. Sem floreios. Sem "Que incrível!!!" exagerado
- Reações genuínas mas contidas: "sério?" "faz sentido" "legal isso"
- Pode usar gírias leves mas sem forçar
- Máximo 3 linhas por resposta
- UMA pergunta por vez, sempre

PERGUNTAS QUE DEVE COBRIR ao longo da conversa (de forma orgânica, nunca como lista):
1. Nome
2. Idade / faixa etária
3. O que faz no dia a dia
4. Hobbies e horas livres
5. Séries ou filmes favoritos
6. Músicas / artistas que gosta
7. Redes sociais que usa
8. Algum nicho específico (games, moda, culinária, esportes, k-pop...)
9. Como se sente com o inglês hoje
10. Já tentou aprender antes?
11. Por que quer aprender agora
12. Como imagina usando o inglês no futuro
13. Quanto tempo por dia consegue dedicar
14. Prefere aprender ouvindo, lendo ou conversando

ENCERRAMENTO (quando receber [GERAR_PERFIL]):
Gere APENAS JSON válido, sem texto, sem markdown, sem backticks. Objeto puro.`;

type RawMessage = { role: string; content: string };

export async function POST(req: NextRequest) {
  try {
    const { messages, isLastTurn } = await req.json() as {
      messages: RawMessage[];
      isLastTurn: boolean;
    };

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const formattedMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Append context hint on last turn
    if (isLastTurn && formattedMessages.length > 0) {
      const last = formattedMessages[formattedMessages.length - 1];
      formattedMessages[formattedMessages.length - 1] = {
        ...last,
        content: last.content + "\n\n[contexto interno: esta é a última troca antes de encerrar. Conclua a conversa de forma calorosa e natural, sem fazer mais perguntas — diga que vai criar o perfil agora.]",
      };
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...formattedMessages,
      ],
      max_tokens: 256,
      temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Chat API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
