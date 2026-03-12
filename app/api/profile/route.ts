import Groq from "groq-sdk";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é o Kai, um parceiro de aprendizado de inglês com personalidade cool e direta. Não é professor — é mais como aquele amigo que fala inglês fluente e quer te ajudar de verdade.

TOM E ESTILO:
- Português brasileiro, conversa natural, sem formalismos
- Frases curtas. Sem floreios. Sem "Que incrível!!!" exagerado
- Reações genuínas mas contidas: "sério?" "faz sentido" "legal isso"
- Pode usar gírias leves mas sem forçar
- Máximo 3 linhas por resposta
- UMA pergunta por vez, sempre

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
      temperature: 0.3,
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

    // ── 2. Save to Google Sheets ──────────────────────────────────────────────
    await saveToSheets(profile);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Profile API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function saveToSheets(profile: Profile) {
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "")
    .replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const timestamp = new Date().toISOString();
  const nome = String(profile.nome ?? "");
  const idade = String(profile.idade_aproximada ?? "");
  const ocupacao = String(profile.ocupacao ?? "");
  const estilo = String(profile.estilo_preferido ?? "");
  const jsonStr = JSON.stringify(profile);

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: "Sheet1!A:F",
    valueInputOption: "RAW",
    requestBody: {
      values: [[timestamp, nome, idade, ocupacao, estilo, jsonStr]],
    },
  });
}
