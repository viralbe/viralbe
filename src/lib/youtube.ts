// src/lib/youtube.ts
export interface YouTubeVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  views?: number;
  likes?: number;
  url?: string;
}

export async function fetchYoutubeVideos(niche: string): Promise<YouTubeVideo[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) throw new Error("YouTube API key não encontrada.");

  // 1️⃣ Busca vídeos pelo termo
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      niche
    )}&type=video&maxResults=10&key=${API_KEY}`
  );
  const searchData = await searchRes.json();

  if (!searchData.items || searchData.items.length === 0) return [];

  // 2️⃣ Pega os IDs dos vídeos
  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");

  // 3️⃣ Pega estatísticas (views, likes)
  const statsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${API_KEY}`
  );
  const statsData = await statsRes.json();

  // 4️⃣ Monta os objetos finais
  const videos: YouTubeVideo[] = statsData.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium.url,
    url: `https://www.youtube.com/watch?v=${item.id}`,
    views: Number(item.statistics.viewCount || 0),
    likes: Number(item.statistics.likeCount || 0),
  }));

  return videos;
}
