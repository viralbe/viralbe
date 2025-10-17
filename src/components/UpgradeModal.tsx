"use client";

import React from "react";

interface UpgradeModalProps {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // redireciona para Stripe Checkout
      } else {
        alert("Erro ao iniciar o pagamento. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com Stripe.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">
          🎉 Faça upgrade para Pro!
        </h2>

        <p className="text-gray-700 text-center mb-4">
          Suas 3 buscas gratuitas acabaram. Torne-se Pro e tenha:
        </p>

        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
          <li>🔓 Acesso ilimitado a todos os vídeos virais</li>
          <li>⚡ Geração de roteiros ilimitada</li>
          <li>💰 Desconto de primeira assinatura! (50% OFF)</li>
        </ul>

        <p className="text-red-600 font-semibold text-center mb-6">
          Oferta por tempo limitado! Não perca. ⏰
        </p>

        <button
          onClick={handleUpgrade}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold"
        >
          Assinar Pro agora
        </button>
      </div>
    </div>
  );
}
