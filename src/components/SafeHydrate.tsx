"use client";

import React from "react";

export default function SafeHydrate({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") {
    // SSR — não hidrata ainda
    return <>{children}</>;
  }

  // Client — já pode renderizar normalmente
  return <>{children}</>;
}
