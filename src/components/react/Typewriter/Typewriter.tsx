import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Typewriter.module.scss';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const useRafLoop = (cb: (t: number) => void) => {
  const rafId = useRef<number | null>(null);
  const loop = useCallback((t: number) => {
    cb(t);
    rafId.current = requestAnimationFrame(loop);
  }, [cb]);

  const start = useCallback(() => {
    if (rafId.current != null) return;
    rafId.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    if (rafId.current != null) cancelAnimationFrame(rafId.current);
    rafId.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  return { start, stop };
};

export default function Typewriter() {
  const [text, setText] = useState('Dream in code. Code your dreams.');
  const [speed, setSpeed] = useState(60);
  const [frame, setFrame] = useState(0);

  const lastRef = useRef(0);
  const phaseRef = useRef<'type' | 'erase'>('type');

  const onLoop = useCallback((ts: number) => {
    // Initialize last timestamp on first frame so delta can accumulate
    if (lastRef.current === 0) {
      lastRef.current = ts;
      return; // wait until next frame to accumulate delta
    }

    const delta = ts - lastRef.current;
    const ms = clamp(speed, 10, 500);

    if (delta >= ms) {
      lastRef.current = ts;
      if (phaseRef.current === 'type') {
        setFrame((f) => {
          const next = Math.min(f + 1, text.length);
          if (next === text.length) {
            // small hold then switch to erase
            setTimeout(() => {
              phaseRef.current = 'erase';
              lastRef.current = 0;
            }, Math.max(400, ms * 6));
          }
          return next;
        });
      } else {
        setFrame((f) => {
          const next = Math.max(0, f - 1);
          if (next === 0) {
            phaseRef.current = 'type';
            lastRef.current = 0;
          }
          return next;
        });
      }
    }
  }, [speed, text.length]);

  const { start, stop } = useRafLoop(onLoop);

  useEffect(() => { start(); return stop; }, [start, stop]);
  useEffect(() => { setFrame(0); phaseRef.current = 'type'; lastRef.current = 0; }, [text, speed]);

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Typewriter</h2>
      <p className={styles.type} aria-live="polite">{text.slice(0, frame)}</p>

      <div className={styles.controls}>
        <label>
          Text
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <label>
          Speed (ms)
          <input
            type="number"
            min={10}
            max={500}
            step={10}
            value={speed}
            onChange={(e) => setSpeed(clamp(Number(e.target.value || 60), 10, 500))}
          />
        </label>
        <button type="button" onClick={() => { setFrame(0); phaseRef.current = 'type'; lastRef.current = 0; }}>
          Restart
        </button>
      </div>
    </section>
  );
}
