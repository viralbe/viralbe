export interface YouTubeVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  views?: number;
  likes?: number;
  url?: string;
}

/**
 * Função para buscar vídeos virais (mock temporário)
 * Você pode depois conectar com a API real do YouTube.
 */
export async function fetchYoutubeVideos(niche: string): Promise<YouTubeVideo[]> {
  // Simulação de busca (mock)
  return [
    {
      id: "1",
      title: `Top 5 vídeos virais sobre ${niche}`,
      description: "Descubra os vídeos mais assistidos e comentados do momento!",
      thumbnail: "https://i.ytimg.com/vi/K1QTcAi0F38/mqdefault.jpg",
      views: 1200000,
      likes: 85000,
      url: "https://www.youtube.com/watch?v=K1QTcAi0F38",
    },
    {
      id: "2",
      title: `Como viralizar com ${niche} em 2025`,
      description: "Aprenda estratégias modernas para viralizar nas redes.",
      thumbnail: "https://i.ytimg.com/vi/8ZK_S-46T2Y/mqdefault.jpg",
      views: 900000,
      likes: 65000,
      url: "https://www.youtube.com/watch?v=8ZK_S-46T2Y",
    },
  ];
}
