"use client";

import React, { useEffect, useState } from "react";
import { useGameState } from "../hooks/useGameState";
import { preloadCommonSounds } from "../lib/utils/sounds";
import { GameStateSelector } from "./dev/GameStateSelector";
import { SoundTester } from "./dev/SoundTester";
import { BlackjackCanvas } from "./pixi";

// Canvas dimensions (actual game area)
const DESKTOP_CANVAS_WIDTH = 1280;
const DESKTOP_CANVAS_HEIGHT = 720;
const MOBILE_CANVAS_WIDTH = 393; // Matches mobile background resolution
const MOBILE_CANVAS_HEIGHT = 852; // Matches mobile background resolution (393 x 852)
const MOBILE_BREAKPOINT = 768; // Switch to mobile view below this width

// Bevel padding for desktop
const BEVEL_PADDING_X = 50; // left + right
const BEVEL_PADDING_Y = 45; // top + bottom

// Mobile padding - minimal for almost full screen experience
const MOBILE_PADDING = 2; // All sides

export default function BlackjackGame() {
  const { gameState, loading, error, sendAction, setGameStateDirectly } =
    useGameState();
  const [dimensions, setDimensions] = useState({
    canvasWidth: DESKTOP_CANVAS_WIDTH,
    canvasHeight: DESKTOP_CANVAS_HEIGHT,
    wrapperWidth: DESKTOP_CANVAS_WIDTH + BEVEL_PADDING_X * 2,
    wrapperHeight: DESKTOP_CANVAS_HEIGHT + BEVEL_PADDING_Y * 2,
    isMobile: false,
  });
  const [showDevTools, setShowDevTools] = useState(false);
  const [pixiReady, setPixiReady] = useState(false);

  const isMobile = dimensions.isMobile;

  // Preload sounds on mount
  useEffect(() => {
    preloadCommonSounds();
  }, []);

  // Handle responsive canvas sizing (rAF-throttled for performance)
  useEffect(() => {
    let resizeRaf: number | null = null;
    const compute = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const isMobileView = windowWidth < MOBILE_BREAKPOINT;

      if (isMobileView) {
        // Mobile: almost full screen with minimal padding
        const baseCanvasWidth = MOBILE_CANVAS_WIDTH;
        const baseCanvasHeight = MOBILE_CANVAS_HEIGHT;

        const paddingTotal = MOBILE_PADDING * 2;
        // Use almost the full viewport with just minimal padding
        const maxCanvasWidth = windowWidth - paddingTotal;
        const maxCanvasHeight = windowHeight - paddingTotal;

        // Always scale to fit viewport - maintain aspect ratio
        const widthScale = maxCanvasWidth / baseCanvasWidth;
        const heightScale = maxCanvasHeight / baseCanvasHeight;
        const scale = Math.min(widthScale, heightScale, 1); // Never scale up, only down

        const canvasWidth = Math.floor(baseCanvasWidth * scale);
        const canvasHeight = Math.floor(baseCanvasHeight * scale);

        setDimensions({
          canvasWidth,
          canvasHeight,
          wrapperWidth: canvasWidth + paddingTotal,
          wrapperHeight: canvasHeight + paddingTotal,
          isMobile: true,
        });
      } else {
        // Desktop: maintain aspect ratio with bevel
        const baseCanvasWidth = DESKTOP_CANVAS_WIDTH;
        const baseCanvasHeight = DESKTOP_CANVAS_HEIGHT;

        const paddingX = BEVEL_PADDING_X * 2;
        const paddingY = BEVEL_PADDING_Y * 2;
        const baseWrapperWidth = baseCanvasWidth + paddingX;
        const baseWrapperHeight = baseCanvasHeight + paddingY;

        // Calculate size that fits within viewport with margin
        const maxWidth = windowWidth * 0.95;
        const maxHeight = windowHeight * 0.95;

        let wrapperWidth = baseWrapperWidth;
        let wrapperHeight = baseWrapperHeight;

        // Scale down if needed to fit viewport (maintain aspect ratio)
        if (wrapperWidth > maxWidth || wrapperHeight > maxHeight) {
          const widthScale = maxWidth / baseWrapperWidth;
          const heightScale = maxHeight / baseWrapperHeight;
          const scale = Math.min(widthScale, heightScale);

          wrapperWidth = Math.floor(baseWrapperWidth * scale);
          wrapperHeight = Math.floor(baseWrapperHeight * scale);
        }

        // Calculate canvas dimensions from wrapper dimensions
        const canvasWidth = wrapperWidth - paddingX;
        const canvasHeight = wrapperHeight - paddingY;

        setDimensions({
          canvasWidth,
          canvasHeight,
          wrapperWidth,
          wrapperHeight,
          isMobile: false,
        });
      }
    };

    const handleResize = () => {
      if (resizeRaf !== null) return;
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = null;
        compute();
      });
    };

    compute();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", handleResize as EventListener);
    };
  }, []);

  return (
    <div
      className="h-screen w-screen text-white font-['Minecraft'] relative overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: "url(/assets/images/backgrounds/bg-image.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dev Tools Toggle Button - Only in development */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={() => setShowDevTools(!showDevTools)}
          className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-white/20"
          title="Toggle Dev Tools"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}

      {/* Dev Tools - Only in development and when toggled */}
      {process.env.NODE_ENV === "development" && showDevTools && (
        <>
          <GameStateSelector onSelectState={setGameStateDirectly} />
          <SoundTester />
        </>
      )}

      {/* PixiJS Game Canvas - Responsive with aspect ratio */}
      <div
        className="relative"
        style={{
          width: `${dimensions.wrapperWidth}px`,
          height: `${dimensions.wrapperHeight}px`,
        }}
      >
        {/* Bevel Frame - Only on desktop; remains visible while PIXI loads */}
        {!isMobile && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url(/assets/images/backgrounds/bevel.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              zIndex: 10,
              willChange: "transform",
              contain: "paint",
            }}
          />
        )}

        {/* Canvas Container with padding */}
        <div
          className={`relative w-full h-full ${
            isMobile ? "overflow-hidden rounded-2xl" : ""
          }`}
          style={{
            padding: isMobile
              ? `${MOBILE_PADDING}px`
              : `${BEVEL_PADDING_Y}px ${BEVEL_PADDING_X}px`,
          }}
        >
          {/* Inner container with border radius - clips canvas to rounded corners */}
          <div
            className={`relative overflow-hidden ${
              isMobile ? "rounded-2xl" : "rounded-3xl"
            }`}
            style={{
              width: `${dimensions.canvasWidth}px`,
              height: `${dimensions.canvasHeight}px`,
            }}
          >
            {/* Felt background + centered loading text (only while PIXI not ready) */}
            {!pixiReady && (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: "#478269" }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-xl font-['Minecraft']">
                    Loading Game...
                  </span>
                </div>
              </div>
            )}

            <BlackjackCanvas
              gameState={gameState}
              width={dimensions.canvasWidth}
              height={dimensions.canvasHeight}
              onAction={sendAction}
              loading={loading}
              error={error}
              isMobile={isMobile}
              onReady={() => setPixiReady(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
