import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é o Kai, um parceiro de aprendizado de inglês com personalidade cool e direta. Não é professor — é mais como aquele amigo que fala inglês fluente e quer te ajudar de verdade.

ENCERRAMENTO (quando receber [GERAR_PERFIL]):
Gere APENAS JSON válido, sem texto, sem markdown, sem backticks. Objeto puro:
{
  "nome": "",
  "idade_aproximada": "",
  "ocupacao": "",
  "interesses": {
    "hobbies": [],
    "series_filmes": [],
    "musica": [],
    "redes_sociais": [],
    "nicho_especifico": []
  },
  "relacao_com_ingles": {
    "sentimento_atual": "",
    "tentativas_anteriores": "",
    "nivel_estimado": ""
  },
  "objetivos": {
    "motivacao_principal": "",
    "uso_futuro": "",
    "disponibilidade_diaria_min": 0
  },
  "estilo_preferido": "",
  "plano_semana_1": {
    "tema_central": "",
    "justificativa": "",
    "vocabulario_chave": [],
    "prompt_notebooklm": "",
    "prompt_gpt_conversa": "",
    "sugestao_serie": "",
    "sugestao_musica": ""
  },
  "notas": ""
}`;

type RawMessage = { role: string; content: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Profile = Record<string, any>;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: RawMessage[] };

    // ── 1. Generate profile JSON via Groq ─────────────────────────────────────
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const formattedMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...formattedMessages,
        { role: "user", content: "[GERAR_PERFIL]" },
      ],
      max_tokens: 1024,
      temperature: 0.2,
    });

    let jsonText = (completion.choices[0]?.message?.content ?? "").trim();

    // Strip markdown code fences if model wraps the output
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim();
    } else {
      const objMatch = jsonText.match(/\{[\s\S]*\}/);
      if (objMatch) jsonText = objMatch[0];
    }

    const profile: Profile = JSON.parse(jsonText);

    // ── 2. Save to Supabase ───────────────────────────────────────────────────
    await saveToSupabase(profile);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Profile API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function saveToSupabase(profile: Profile) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from("profiles").insert({
    nome: String(profile.nome ?? ""),
    idade_aproximada: String(profile.idade_aproximada ?? ""),
    ocupacao: String(profile.ocupacao ?? ""),
    estilo_preferido: String(profile.estilo_preferido ?? ""),
    perfil_json: profile,
  });

  if (error) throw new Error(`Supabase error: ${error.message}`);
}
