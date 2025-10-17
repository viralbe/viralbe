// src/app/api/videos/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { fetchYoutubeVideos, YouTubeVideo } from "@/lib/youtube";

export async function GET(req: Request) {
  try {
    const user = await currentUser();

    // 🔒 Verifica autenticação
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "unauthorized", message: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const niche = url.searchParams.get("niche")?.trim();

    if (!niche) {
      return NextResponse.json(
        { ok: false, error: "missing_niche", message: "Nicho não informado." },
        { status: 400 }
      );
    }

    // 🔍 Busca ou cria o registro do usuário no banco
    let userSearch = await prisma.userSearch.findFirst({ where: { userId: user.id } });
    if (!userSearch) {
      userSearch = await prisma.userSearch.create({
        data: { userId: user.id, searches: 0, isPro: false },
      });
    }

    const isPro = userSearch.isPro === true;
    const remaining = isPro ? Infinity : 3 - userSearch.searches;

    // 🔢 Se não for Pro e já zerou tentativas, retorna flag para upgrade
    if (!isPro && remaining <= 0) {
  return NextResponse.json({
    ok: false,
    needsUpgrade: true,
    remaining: 0,
    isPro: false,
  });
}

// Incrementa contador só depois
if (!isPro) {
  await prisma.userSearch.update({
    where: { id: userSearch.id },
    data: { searches: userSearch.searches + 1 },
  });
}

    // 🎥 Busca vídeos
    const videos: YouTubeVideo[] = await fetchYoutubeVideos(niche);

    // 🔁 Retorno padronizado
    return NextResponse.json({
      ok: true,
      videos,
      remaining: isPro ? "∞" : remaining - 1, // decrementa pois o contador subiu
      isPro,
      needsUpgrade: false,
    });
  } catch (error: unknown) {
    console.error("Erro ao buscar vídeos:", error);
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { ok: false, error: "internal_error", message },
      { status: 500 }
    );
  }
}
