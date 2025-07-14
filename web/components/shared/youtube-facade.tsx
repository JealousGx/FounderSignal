"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface YouTubeFacadeProps {
  videoId: string;
  title: string;
  options?: {
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    mute?: boolean;
    playlist?: string; // Required if loop is true
    playsinline?: boolean;
    showinfo?: boolean;
    modestbranding?: boolean;
    iv_load_policy?: number; // 1 for show annotations, 3 for no annotations
    width?: number; // Optional width for the iframe
    height?: number; // Optional height for the iframe
  };
  embed?: boolean; // If true, use embed URL instead of watch URL
}

export function YouTubeFacade({
  videoId,
  title,
  options = {},
  embed,
}: YouTubeFacadeProps) {
  const [showVideo, setShowVideo] = useState(false);
  const facadeRef = useRef(null);

  useEffect(() => {
    if (showVideo || !facadeRef.current) return;

    const node = facadeRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowVideo(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );

    observer.observe(node);

    return () => {
      if (observer && node) {
        observer.unobserve(node);
      }
    };
  }, [showVideo]);

  const videoUrl = useMemo(() => {
    const baseUrl = embed
      ? `https://www.youtube.com/embed/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`;
    const videoUrl = new URL(baseUrl);

    const params = {
      autoplay: options.autoplay,
      mute: options.mute,
      loop: options.loop,
      playlist: options.playlist,
      playsinline: options.playsinline,
      controls: options.controls,
      showinfo: options.showinfo,
      modestbranding: options.modestbranding,
      iv_load_policy: options.iv_load_policy?.toString(),
    };

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (typeof value === "boolean") {
          videoUrl.searchParams.set(key, value ? "1" : "0");
        } else {
          videoUrl.searchParams.set(key, value);
        }
      }
    }

    if (!options.iv_load_policy) {
      videoUrl.searchParams.set("iv_load_policy", "3");
    }

    return videoUrl.toString();
  }, [videoId, embed, options]);

  if (showVideo) {
    return (
      <iframe
        width={options.width || "560"}
        height={options.height || "315"}
        src={videoUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        loading="lazy"
      ></iframe>
    );
  }

  return (
    <div
      ref={facadeRef}
      onClick={() => setShowVideo(true)}
      style={{
        position: "relative",
        width: "560px",
        height: "315px",
        cursor: "pointer",
        backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <svg width="68" height="48" viewBox="0 0 68 48">
          <path
            d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.26,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
            fill="#f00"
          ></path>
          <path d="M 45,24 27,14 27,34" fill="#fff"></path>
        </svg>
      </div>
    </div>
  );
}
