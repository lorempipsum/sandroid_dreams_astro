import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './Typewriter.module.scss';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export default function Typewriter() {
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState('');
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const cursor = useMemo(() => anchor ?? { x: 40, y: 40 }, [anchor]);

  // Establish the anchor (fixed cursor location) after first layout
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const fixed = { x: rect.left + 40, y: rect.top + rect.height - 40 };
    setAnchor(fixed);
  }, []);

  const measureCaret = useCallback(() => {
    const measureEl = measureRef.current;
    if (!measureEl) return { x: 0, y: 0 };

    // Render text in measure layer and put a marker span at the end
    measureEl.textContent = '';
    const tNode = document.createTextNode(text);
    const marker = document.createElement('span');
    marker.textContent = '\u200b';
    measureEl.appendChild(tNode);
    measureEl.appendChild(marker);

    const rect = marker.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top;

    return { x, y };
  }, [text]);

  // Recompute transform offset so that the caret (end of text) is under the fixed cursor
  const updateOffset = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !anchor) return;

    const caret = measureCaret();
    const stageRect = stage.getBoundingClientRect();
    const caretLocal = { x: caret.x - stageRect.left, y: caret.y - stageRect.top };
    const desiredLocal = { x: cursor.x - stageRect.left, y: cursor.y - stageRect.top };

    setOffset({ x: desiredLocal.x - caretLocal.x, y: desiredLocal.y - caretLocal.y });
  }, [anchor, cursor.x, cursor.y, measureCaret]);

  useLayoutEffect(() => { updateOffset(); }, [text, updateOffset]);

  // Handle key input globally
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setText((t) => t + e.key);
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        setText((t) => t.slice(0, -1));
        e.preventDefault();
      } else if (e.key === 'Enter') {
        setText((t) => t + '\n');
        e.preventDefault();
      } else if (e.key === 'Tab') {
        setText((t) => t + '  ');
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const onResize = () => updateOffset();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateOffset]);

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Typewriter</h2>

      <div className={styles.stage} ref={stageRef} aria-live="polite">
        {/* Visible layer (translated) */}
        <div
          ref={layerRef}
          className={styles.layer}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        >
          {text}
        </div>

        {/* Hidden measurement layer (same metrics, no transform) */}
        <div ref={measureRef} className={styles.measureLayer} aria-hidden>
          {text}
        </div>

        {/* Fixed-position blinking cursor anchored within stage */}
        <div
          className={styles.cursor}
          style={{
            left: `${cursor.x - (stageRef.current?.getBoundingClientRect().left ?? 0)}px`,
            top: `${cursor.y - (stageRef.current?.getBoundingClientRect().top ?? 0)}px`,
          }}
        />
      </div>

      <div className={styles.controls}>
        <div className={styles.hint}>Start typing. Enter for new line. Backspace to delete. Cursor stays anchored.</div>
      </div>
    </section>
  );
}
