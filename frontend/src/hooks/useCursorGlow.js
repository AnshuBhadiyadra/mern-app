import { useEffect, useRef, useCallback } from 'react';

/**
 * Hyperplexed-inspired cursor glow effect.
 * Attaches a radial gradient glow that follows the mouse on the target element.
 *
 * Usage:  const ref = useCursorGlow();
 *         <div ref={ref} className="some-card">...</div>
 */
const useCursorGlow = () => {
  const ref = useRef(null);

  const handleMouse = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--glow-x', `${x}px`);
    el.style.setProperty('--glow-y', `${y}px`);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouse);
    return () => el.removeEventListener('mousemove', handleMouse);
  }, [handleMouse]);

  return ref;
};

export default useCursorGlow;
