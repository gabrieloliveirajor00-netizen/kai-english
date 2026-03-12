import { GoogleGenerativeAI } from "@google/generative-ai";
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

    // ── 1. Generate profile JSON via Gemini ──────────────────────────────────
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Full conversation becomes history; [GERAR_PERFIL] is the trigger message
    const rawHistory = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Gemini requires history to start with role "user"
    const history =
      rawHistory.length > 0 && rawHistory[0].role === "model"
        ? [{ role: "user", parts: [{ text: "oi" }] }, ...rawHistory]
        : rawHistory;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage("[GERAR_PERFIL]");
    let jsonText = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the output
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim();
    } else {
      // Fallback: extract raw JSON object
      const objMatch = jsonText.match(/\{[\s\S]*\}/);
      if (objMatch) jsonText = objMatch[0];
    }

    const profile: Profile = JSON.parse(jsonText);

    // ── 2. Save to Google Sheets ─────────────────────────────────────────────
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
