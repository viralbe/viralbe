export interface YouTubeVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  views?: number;
  likes?: number;
}

// exemplo de função para buscar vídeos
export async function fetchVideos(niche: string): Promise<YouTubeVideo[]> {
  // lógica de fetch da API do YouTube ou mock
  return [];
}
