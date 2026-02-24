import { useEffect, useRef } from 'react';
import './MouseTrailer.css';

/**
 * Hyperplexed magic-mouse-trailer adapted for React.
 * Renders sparkle stars + glow trail following cursor.
 * Drop this component anywhere — it renders at document level.
 */
const config = {
  starAnimationDuration: 1500,
  minimumTimeBetweenStars: 250,
  minimumDistanceBetweenStars: 75,
  glowDuration: 75,
  maximumGlowPointSpacing: 10,
  colors: ['139 92 246', '236 72 153', '99 102 241'],
  sizes: ['1.4rem', '1rem', '0.6rem'],
  animations: ['fall-1', 'fall-2', 'fall-3'],
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const selectRandom = (items) => items[rand(0, items.length - 1)];
const px = (v) => `${v}px`;
const ms = (v) => `${v}ms`;
const calcDistance = (a, b) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

const MouseTrailer = () => {
  const last = useRef({
    starTimestamp: Date.now(),
    starPosition: { x: 0, y: 0 },
    mousePosition: { x: 0, y: 0 },
  });
  const countRef = useRef(0);

  useEffect(() => {
    const createStar = (pos) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const color = selectRandom(config.colors);
      svg.setAttribute('class', 'hp-star');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.innerHTML =
        '<path d="M12 2l2.09 6.26L20.18 9.27l-4.64 3.97L16.55 20 12 16.77 7.45 20l1.01-6.76L3.82 9.27l6.09-1.01L12 2z"/>';
      svg.style.left = px(pos.x);
      svg.style.top = px(pos.y);
      svg.style.fontSize = selectRandom(config.sizes);
      svg.style.color = `rgb(${color})`;
      svg.style.textShadow = `0 0 1.5rem rgb(${color} / 0.5)`;
      svg.style.animationName = config.animations[countRef.current++ % 3];
      svg.style.animationDuration = ms(config.starAnimationDuration);
      document.body.appendChild(svg);
      setTimeout(() => {
        if (svg.parentNode) svg.parentNode.removeChild(svg);
      }, config.starAnimationDuration);
    };

    const createGlowPoint = (pos) => {
      const glow = document.createElement('div');
      glow.className = 'hp-glow-point';
      glow.style.left = px(pos.x);
      glow.style.top = px(pos.y);
      document.body.appendChild(glow);
      setTimeout(() => {
        if (glow.parentNode) glow.parentNode.removeChild(glow);
      }, config.glowDuration);
    };

    const createGlow = (prev, current) => {
      const distance = calcDistance(prev, current);
      const qty = Math.max(Math.floor(distance / config.maximumGlowPointSpacing), 1);
      const dx = (current.x - prev.x) / qty;
      const dy = (current.y - prev.y) / qty;
      for (let i = 0; i < qty; i++) {
        createGlowPoint({ x: prev.x + dx * i, y: prev.y + dy * i });
      }
    };

    const handleMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      const l = last.current;

      if (l.mousePosition.x === 0 && l.mousePosition.y === 0) {
        l.mousePosition = pos;
      }

      const now = Date.now();
      const farEnough = calcDistance(l.starPosition, pos) >= config.minimumDistanceBetweenStars;
      const longEnough = now - l.starTimestamp > config.minimumTimeBetweenStars;

      if (farEnough || longEnough) {
        createStar(pos);
        l.starTimestamp = now;
        l.starPosition = pos;
      }

      createGlow(l.mousePosition, pos);
      l.mousePosition = pos;
    };

    const handleLeave = () => {
      last.current.mousePosition = { x: 0, y: 0 };
    };

    window.addEventListener('mousemove', handleMove);
    document.body.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.body.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return null; // renders nothing — effects go directly to document.body
};

export default MouseTrailer;
