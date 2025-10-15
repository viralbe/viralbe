export type YoutubeVideo = {
  title: string;
  description?: string;
  thumbnail: string;
  url: string;
  views?: number;
  likes?: number;
};

export async function fetchYoutubeVideos(niche: string): Promise<YoutubeVideo[]> {
  try {
    // Exemplo de fetch fictício
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(niche)}&maxResults=10&key=${process.env.YOUTUBE_API_KEY}`);
    if (!res.ok) throw new Error("Erro ao buscar vídeos do YouTube");

    const data = await res.json();

    return data.items.map((item: any) => ({
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      views: 0, // opcional, precisa de outro endpoint para views reais
      likes: 0, // opcional
    }));
  } catch (err) {
    console.error("Erro fetchYoutubeVideos:", err);
    return [];
  }
}
