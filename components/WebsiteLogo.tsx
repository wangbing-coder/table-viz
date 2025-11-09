"use client";
import { getDomain } from "@/lib/utils";
import { useEffect, useState } from "react";

interface IProps {
  url: string;
  size?: number;
  className?: string;
  timeout?: number;
}

const WebsiteLogo = ({
  url,
  size = 32,
  className = "",
  timeout = 1000, // 1 second
}: IProps) => {
  const domain = getDomain(url);
  const [imgSrc, setImgSrc] = useState(`https://${domain}/logo.png`);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let timeoutId: any;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        handleError();
      }, timeout);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [imgSrc, isLoading]);

  const handleError = () => {
    const nextIndex = fallbackIndex + 1;
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      {/* placeholder */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse">
          <div className="w-full h-full rounded-md bg-gray-200/60" />
        </div>
      )}

      <img
        src={imgSrc}
        alt={`${domain} logo`}
        width={size}
        height={size}
        onError={handleError}
        onLoad={handleLoad}
        className={`inline-block transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"
          }`}
        style={{
          objectFit: "contain",
          display: hasError ? "none" : "inline-block",
        }}
      />

      {/* Fallback: Display first letter of domain when all image sources fail */}
      {hasError && (
        <div
          className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md"
          style={{ fontSize: `${size * 0.5}px` }}
        >
          {domain.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default WebsiteLogo;
