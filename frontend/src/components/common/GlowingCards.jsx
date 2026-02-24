import { useRef, useCallback } from 'react';

/**
 * Hyperplexed glowing-card-border adapted for React.
 * Wrap any grid of cards in this component. When the mouse moves
 * over the container, every child with class "glow-card" receives
 * --mouse-x / --mouse-y custom properties so they all glow together.
 *
 * Usage:
 *   <GlowingCards className="events-grid">
 *     <div className="glow-card">…</div>
 *     <div className="glow-card">…</div>
 *   </GlowingCards>
 */
const GlowingCards = ({ children, className = '', as: Tag = 'div', ...props }) => {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const container = ref.current;
    if (!container) return;
    const cards = container.querySelectorAll('.glow-card');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  }, []);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const container = ref.current;
    if (!container) return;
    const cards = container.querySelectorAll('.glow-card');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${touch.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${touch.clientY - rect.top}px`);
    });
  }, []);

  return (
    <Tag
      ref={ref}
      className={`glowing-cards-container ${className}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default GlowingCards;
