import React, { useEffect, useRef } from "react";
import "asciinema-player/dist/bundle/asciinema-player.css";
import { create } from "asciinema-player";

interface AsciinemaPlayerProps {
  src: string;
}

const AsciinemaPlayer = ({ src }: AsciinemaPlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null);

  const options = {
    autoplay: true,
    loop: true,
    theme: "solarized-dark",
  };

  useEffect(() => {
    if (playerRef.current) {
      create(src, playerRef.current, options);
      setTimeout(() => {
        if (!playerRef.current) return;
        const codeBlocks = playerRef.current.querySelectorAll('[role="paragraph"]');

        codeBlocks.forEach((line, index) => {
          // 줄 번호 추가
          const lineNumber = document.createElement('span');
          lineNumber.textContent = `${index + 1} `;
          lineNumber.className = 'line-number';
          line.insertBefore(lineNumber, line.firstChild);
        });
      }, 1000);
    }


  }, [src]);

  useEffect(() => {
    if (playerRef.current) {
      // 스타일 동적 변경
      const style = document.createElement('style');
      style.textContent = `
      .ap-player{
        background-color: #121212 !important; 
        border-radius: 0 0 4px 4px !important;
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
        position: relative;
        background-color: #121212
      }

      pre.ap-terminal .ap-line span.line-number {
        width: 35px;
        background-color: #1A1D2A !important;
        color: #707A8A;
        text-align: center;
      }
      `;
      document.head.appendChild(style);
    }
  }, []);
  return (
    <div style={{ borderRadius: '7px', border: '2px solid' }}>
      <div className='text-white font-bold rounded-t-sm' style={{ backgroundColor: '#3A3D4D', borderRadius: '4px 4px 0 0', padding: '8px 10px' }}>Session 88</div>
      <div ref={playerRef} />
    </div>
  );
};

export default AsciinemaPlayer;
