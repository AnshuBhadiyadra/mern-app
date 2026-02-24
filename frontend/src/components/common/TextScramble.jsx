import { useEffect, useRef, useState } from 'react';

/**
 * Hyperplexed-inspired text scramble/decode effect.
 * Characters randomly cycle before settling on the final text.
 *
 * Usage: <TextScramble text="Hello World" className="my-heading" as="h1" />
 */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

const TextScramble = ({
  text,
  as: Tag = 'span',
  className = '',
  speed = 30,
  revealDelay = 50,
  trigger = 'mount', // 'mount' | 'hover'
  ...props
}) => {
  const [display, setDisplay] = useState(text);
  const [scrambling, setScrambling] = useState(false);
  const intervalRef = useRef(null);
  const hasRun = useRef(false);

  const scramble = () => {
    if (scrambling) return;
    setScrambling(true);
    let iteration = 0;
    const target = text;

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplay(
        target
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < iteration) return target[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      iteration += 1 / 2;
      if (iteration >= target.length) {
        clearInterval(intervalRef.current);
        setDisplay(target);
        setScrambling(false);
      }
    }, speed);
  };

  useEffect(() => {
    if (trigger === 'mount' && !hasRun.current) {
      hasRun.current = true;
      const timer = setTimeout(scramble, revealDelay);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset when text changes
  useEffect(() => {
    setDisplay(text);
  }, [text]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const eventHandlers =
    trigger === 'hover'
      ? { onMouseEnter: scramble }
      : {};

  return (
    <Tag
      className={`text-scramble ${className}`}
      {...eventHandlers}
      {...props}
    >
      {display}
    </Tag>
  );
};

export default TextScramble;
