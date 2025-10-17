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

interface YouTubeSearchItem {
  id: { videoId: string };
}

interface YouTubeStatsItem {
  id: string;
  snippet: {
    title: string;
    description?: string;
    thumbnails: { medium: { url: string } };
  };
  statistics: { viewCount?: string; likeCount?: string };
}

// Type guards sem 'any'
function isYouTubeSearchItem(item: unknown): item is YouTubeSearchItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    typeof (item as { id?: { videoId?: unknown } }).id?.videoId === "string"
  );
}

function isYouTubeStatsItem(item: unknown): item is YouTubeStatsItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    "snippet" in item &&
    "statistics" in item
  );
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

  if (!searchData?.items || !Array.isArray(searchData.items)) return [];

  const searchItems: YouTubeSearchItem[] = searchData.items.filter(isYouTubeSearchItem);
  if (searchItems.length === 0) return [];

  const videoIds = searchItems.map((item) => item.id.videoId).join(",");

  // 2️⃣ Pega estatísticas dos vídeos
  const statsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${API_KEY}`
  );
  const statsData = await statsRes.json();

  if (!statsData?.items || !Array.isArray(statsData.items)) return [];

  const statsItems: YouTubeStatsItem[] = statsData.items.filter(isYouTubeStatsItem);

  // 3️⃣ Monta os objetos finais
  const videos: YouTubeVideo[] = statsItems.map((item) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium.url,
    url: `https://www.youtube.com/watch?v=${item.id}`,
    views: Number(item.statistics.viewCount ?? 0),
    likes: Number(item.statistics.likeCount ?? 0),
  }));

  return videos;
}
