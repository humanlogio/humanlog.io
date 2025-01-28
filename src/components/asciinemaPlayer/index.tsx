import React, { useEffect, useRef } from "react";
import "asciinema-player/dist/bundle/asciinema-player.css";
import { create } from "asciinema-player";

interface AsciinemaPlayerProps {
  src: string;
}

const AsciinemaPlayer = ({ src }: AsciinemaPlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null);

  const options = {
    fit: "width",
    autoplay: true,
    loop: true,
    theme: "solarized-dark",
    controls: false,
  };

  useEffect(() => {
    if (playerRef.current) {
      create(src, playerRef.current, options);
      setTimeout(() => {
        if (!playerRef.current) return;
        const codeBlocks =
          playerRef.current.querySelectorAll('[role="paragraph"]');

        codeBlocks.forEach((line, index) => {
          // Add line numbers
          const lineNumber = document.createElement("span");
          lineNumber.textContent = `${index + 1} `;
          lineNumber.className = "line-number";
          line.insertBefore(lineNumber, line.firstChild);
        });
      }, 1000);
    }
  }, [src]);

  useEffect(() => {
    if (playerRef.current) {
      // Dynamic style change
      const style = document.createElement("style");
      style.textContent = `
      .ap-player{
        background-color: #121212 !important; 
        padding: 8px !important;
      }

      .ap-terminal {
        background-color: #121212 !important;
        color: #f1f1f1 !important;
        border: unset !important;
        border-width: unset !important;
      }

      pre.ap-terminal {
        background-color: #121212 !important;
      }

      pre.ap-terminal .ap-line span {
        // position: relative;
        background-color: #121212
      }

      pre.ap-terminal .ap-line span.line-number {
        width: 7%;
        background-color: #1A1D2A !important;
        color: #707A8A;
        text-align: center;
      }

      .ap-control-bar {
        opacity: 1 !important;
        visibility: visible !important;
      }
      `;
      document.head.appendChild(style);
    }
  }, []);
  return <div ref={playerRef} />;
};

export default AsciinemaPlayer;
