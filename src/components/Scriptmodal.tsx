import React from "react";
import { Video } from "./videocard";
import Image from "next/image";

type ScriptModalProps = {
  video: Video;
  script: string;
  generating: boolean;
  onClose: () => void;
  onGenerate: () => void;
};

export const ScriptModal: React.FC<ScriptModalProps> = ({
  video,
  script,
  generating,
  onClose,
  onGenerate,
}) => {
  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative shadow-lg overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">{video.title}</h2>

        {video.url ? (
          <div className="relative pb-[56.25%] h-0 mb-4">
            <iframe
              src={
                video.url.includes("youtube.com/watch")
                  ? video.url.replace("watch?v=", "embed/")
                  : video.url
              }
              title={video.title}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        ) : (
          <Image
            src={video.thumbnail}
            alt={video.title}
            width={600}
            height={300}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}

        <p className="text-gray-700 mb-4">{video.description || "Sem descrição disponível."}</p>

        <div className="flex justify-between text-gray-600 text-sm mb-4">
          <span>👁 {formatNumber(video.views)} views</span>
          <span>❤️ {formatNumber(video.likes)} likes</span>
        </div>

        <button
          onClick={onGenerate}
          disabled={generating}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {generating ? "Gerando roteiro..." : "✨ Melhorar esse vídeo"}
        </button>

        {script && (
          <div className="mt-4 bg-gray-100 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-line">
            {script}
          </div>
        )}
      </div>
    </div>
  );
};
