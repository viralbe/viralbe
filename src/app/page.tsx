"use client";

import { UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import UpgradeModal from "@/components/UpgradeModal";

interface Video {
  title: string;
  description?: string;
  url?: string;
  thumbnail: string;
  views?: number;
  likes?: number;
}

export default function Home() {
  const { isSignedIn } = useUser();
  const [niche, setNiche] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);
  const [remaining, setRemaining] = useState<number | string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  const searchVideos = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSignedIn) return (window.location.href = "/sign-in");
    if (!niche.trim()) return alert("Digite um nicho primeiro!");
    setLoading(true);
    setVideos([]);
    setShowUpgrade(false);

    try {
      const res = await fetch(`/api/videos?niche=${encodeURIComponent(niche)}`);
      const data = await res.json();

      if (!res.ok || data.needsUpgrade) {
        setShowUpgrade(data.needsUpgrade ?? false);
        setRemaining(data.remaining ?? 0);
        setIsPro(data.isPro ?? false);
        setLoading(false);
        return;
      }

      setVideos(data.videos || []);
      setRemaining(data.remaining ?? null);
      setIsPro(data.isPro ?? false);
    } catch (error) {
      console.error(error);
      alert("Erro ao se conectar ao servidor.");
    }
    setLoading(false);
  };

  const generateScript = async () => {
    if (!selectedVideo) return;
    setGenerating(true);
    setScript("Gerando roteiro com IA...");
    try {
      const res = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedVideo.title,
          description: selectedVideo.description || "Sem descrição.",
        }),
      });
      const data = await res.json();
      setScript(data.script || "Erro ao gerar roteiro.");
    } catch (error) {
      console.error(error);
      setScript("Erro ao gerar roteiro.");
    }
    setGenerating(false);
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setScript("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900 flex flex-col items-center px-6 py-10">
      {/* HEADER */}
      <header className="w-full max-w-6xl flex justify-end items-center mb-8">
        <div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-blue-600 transition"
            >
              Entrar
            </Link>
          </SignedOut>
        </div>
      </header>

      {/* HERO */}
      <section className="w-full max-w-4xl text-center mb-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
          🌍 Os vídeos mais virais do mundo na sua mão
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Encontre os vídeos mais virais do momento e deixe a IA recriar o seu automaticamente com roteiros otimizados.
        </p>
      </section>

      {/* SEARCH */}
      <form onSubmit={searchVideos} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mb-6">
        <input
          type="text"
          placeholder="Digite um nicho (ex: marketing, moda, humor...)"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="flex-1 border border-gray-300 rounded-2xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3 rounded-2xl hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {/* REMAINING */}
      {remaining !== null && (
        <div className="mb-8 w-full flex justify-center">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 text-blue-800 px-6 py-4 rounded-2xl shadow-md text-center max-w-md">
            <p className="text-base font-semibold flex items-center justify-center gap-2">
              <span className="text-2xl">🔎</span>
              <span>
                Você ainda tem{" "}
                <span className="font-extrabold text-blue-700">
                  {isPro ? "∞" : remaining}
                </span>{" "}
                de <span className="font-bold">3 buscas grátis</span>.
              </span>
            </p>
            {!isPro && (
              <p className="text-sm text-blue-600 mt-1">
                Aproveite bem! Cada busca revela os vídeos mais virais do seu nicho. 💡
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIDEOS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {videos.length === 0 && !loading && (
          <p className="text-gray-500 text-center col-span-full">🔍 Busque um nicho para ver os vídeos virais!</p>
        )}
        {videos.map((video, index) => (
          <div
            key={index}
            onClick={() => setSelectedVideo(video)}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition overflow-hidden flex flex-col"
          >
            <div className="relative w-full h-48">
              <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <h2 className="text-lg font-semibold line-clamp-2 mb-2">{video.title}</h2>
              <div className="text-gray-600 text-sm flex justify-between items-center">
                <span>👁 {formatNumber(video.views || 0)}</span>
                <span>❤️ {formatNumber(video.likes || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* MODAL DE VÍDEO */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl transition">
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedVideo.title}</h2>

            {selectedVideo.url ? (
              <div className="relative pb-[56.25%] h-0 mb-4">
                <iframe
                  src={selectedVideo.url.includes("youtube.com/watch") ? selectedVideo.url.replace("watch?v=", "embed/") : selectedVideo.url}
                  title={selectedVideo.title}
                  className="absolute top-0 left-0 w-full h-full rounded-xl"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="relative w-full h-64 mb-4">
                <Image src={selectedVideo.thumbnail} alt={selectedVideo.title} fill className="object-cover rounded-xl" />
              </div>
            )}

            <p className="text-gray-700 mb-4">{selectedVideo.description || "Sem descrição disponível."}</p>
            <div className="flex justify-between text-gray-600 text-sm mb-4">
              <span>👁 {formatNumber(selectedVideo.views || 0)} views</span>
              <span>❤️ {formatNumber(selectedVideo.likes || 0)} likes</span>
            </div>

            <button
              onClick={generateScript}
              disabled={generating}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-2xl hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50"
            >
              {generating ? "Gerando roteiro..." : "✨ Melhorar esse vídeo"}
            </button>

            {script && <div className="mt-4 bg-gray-50 rounded-2xl p-4 text-sm text-gray-800 whitespace-pre-line">{script}</div>}
          </div>
        </div>
      )}

      {/* MODAL DE UPGRADE */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </main>
  );
}
