import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './Typewriter.module.scss';

export default function Typewriter() {
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState('');
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Cursor anchor: right edge (padding 16) and near bottom (padding 16)
  const getAnchor = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
    const padding = 16; // should match stage/layer padding visually
    return { x: rect.right - padding, y: rect.bottom - padding - 4 };
  }, []);

  const measureCaret = useCallback(() => {
    const measureEl = measureRef.current;
    if (!measureEl) return { x: 0, y: 0 };

    measureEl.textContent = '';
    const tNode = document.createTextNode(text);
    const marker = document.createElement('span');
    marker.textContent = '\u200b';
    measureEl.appendChild(tNode);
    measureEl.appendChild(marker);

    const rect = marker.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }, [text]);

  // Recompute transform offset so that the caret (end of text) is under the fixed cursor
  const updateOffset = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const anchor = getAnchor();
    const caret = measureCaret();

    const stageRect = stage.getBoundingClientRect();
    const caretLocal = { x: caret.x - stageRect.left, y: caret.y - stageRect.top };
    const desiredLocal = { x: anchor.x - stageRect.left, y: anchor.y - stageRect.top };

    setOffset({ x: desiredLocal.x - caretLocal.x, y: desiredLocal.y - caretLocal.y });
  }, [getAnchor, measureCaret]);

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

  const anchor = getAnchor();

  return (
    <section className={styles.container}>
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

        {/* Fixed-position blinking cursor anchored to right edge */}
        <div
          className={styles.cursor}
          style={{
            left: `${anchor.x - (stageRef.current?.getBoundingClientRect().left ?? 0)}px`,
            top: `${anchor.y - (stageRef.current?.getBoundingClientRect().top ?? 0)}px`,
          }}
        />
      </div>

      <div className={styles.controls}>
        <div className={styles.hint}>Start typing. Enter for new line. Backspace to delete. Cursor stays on the right.</div>
      </div>
    </section>
  );
}
