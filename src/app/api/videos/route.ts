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
    let userSearch = await prisma.userSearch.findFirst({
      where: { userId: user.id },
    });

    if (!userSearch) {
      userSearch = await prisma.userSearch.create({
        data: { userId: user.id, searches: 0, isPro: false },
      });
    }

    // 💎 Verifica plano Pro
    const isPro = userSearch.isPro === true;

    // 🔢 Se não for Pro e já atingiu limite, retorna flag para upgrade
    if (!isPro && userSearch.searches >= 3) {
      return NextResponse.json({
        ok: false,
        needsUpgrade: true, // <- sinaliza para o frontend abrir modal Stripe
        remaining: 0,
        isPro: false,
      });
    }

    // 🧮 Incrementa o contador se for usuário gratuito
    if (!isPro) {
      await prisma.userSearch.update({
        where: { id: userSearch.id },
        data: { searches: userSearch.searches + 1 },
      });
    }

    // 🎥 Busca os vídeos (mock ou real API do YouTube)
    const videos: YouTubeVideo[] = await fetchYoutubeVideos(niche);

    // 🔁 Retorno padronizado
    return NextResponse.json({
      ok: true,
      videos,
      remaining: isPro ? "∞" : Math.max(0, 3 - (userSearch.searches + 1)),
      isPro,
      needsUpgrade: false,
    });
  } catch (error: any) {
    console.error("Erro ao buscar vídeos:", error);
    return NextResponse.json(
      { ok: false, error: "internal_error", message: "Erro interno ao buscar vídeos." },
      { status: 500 }
    );
  }
}
