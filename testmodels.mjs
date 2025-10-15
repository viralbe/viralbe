import fetch from "node-fetch";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Faltando GEMINI_API_KEY no .env.local");
  process.exit(1);
}

const url = "https://generativelanguage.googleapis.com/v1beta/models";

console.log("🔍 Testando modelos disponíveis...");

try {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await res.json();
  console.log("✅ Resposta da API:");
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error("❌ Erro ao buscar modelos:", err);
}
