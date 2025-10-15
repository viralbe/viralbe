import { createClerkClient } from "@clerk/backend";
import { currentUser } from "@clerk/nextjs/server";
import { fetchYoutubeVideos } from "@/lib/youtube";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export async function GET(req: Request) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado." }),
        { status: 401 }
      );
    }

    // Lê o limite de pesquisas do usuário
    const remaining =
      typeof user.publicMetadata.remainingSearches === "number"
        ? user.publicMetadata.remainingSearches
        : 3;

    if (remaining <= 0) {
      return new Response(
        JSON.stringify({
          error: "Você atingiu o limite de 3 pesquisas gratuitas.",
          remaining: 0,
        }),
        { status: 403 }
      );
    }

    // Obtém o nicho da query string
    const { searchParams } = new URL(req.url);
    const niche = searchParams.get("niche") || "marketing";

    // Chama a função que busca vídeos do YouTube
    const videos = await fetchYoutubeVideos(niche);

    const updatedRemaining = remaining - 1;

    // Atualiza metadados do usuário no Clerk
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...(user.publicMetadata || {}),
        remainingSearches: updatedRemaining,
      },
    });

    return new Response(
      JSON.stringify({ videos, remaining: updatedRemaining }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na rota /api/videos:", error);
    return new Response(JSON.stringify({ error: "Erro interno." }), {
      status: 500,
    });
  }
}
