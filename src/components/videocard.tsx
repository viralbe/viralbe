import React from "react";
import Image from "next/image";

export type Video = {
  title: string;
  description?: string;
  thumbnail: string;
  url?: string;
  views?: number;
  likes?: number;
};

type VideoCardProps = {
  video: Video;
  onClick: (video: Video) => void;
};

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div
      onClick={() => onClick(video)}
      className="bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition overflow-hidden flex flex-col"
    >
      <Image
        src={video.thumbnail}
        alt={video.title}
        width={400}
        height={225}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h2 className="text-lg font-semibold line-clamp-2 mb-2">{video.title}</h2>
        <div className="text-gray-600 text-sm flex justify-between items-center">
          <span>👁 {formatNumber(video.views)}</span>
          <span>❤️ {formatNumber(video.likes)}</span>
        </div>
      </div>
    </div>
  );
};
