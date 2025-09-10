import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './Typewriter.module.scss';

// Compute anchor at right-bottom padding of the stage
const useAnchor = (stageRef: React.RefObject<HTMLDivElement>) => {
  return useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
    const padding = 16;
    return { x: rect.right - padding, y: rect.bottom - padding - 4 };
  }, [stageRef]);
};

export default function Typewriter() {
  const stageRef = useRef<HTMLDivElement>(null);
  const currentMeasureRef = useRef<HTMLDivElement>(null);
  const committedMeasureRef = useRef<HTMLDivElement>(null);

  const [committedLines, setCommittedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<string>('');

  // Keep current line anchored: baseY is locked; offsetX updates with typing
  const [offsetX, setOffsetX] = useState(0);
  const [baseY, setBaseY] = useState<number | null>(null);
  const [committedOffset, setCommittedOffset] = useState({ x: 0, y: 0 });

  const [lineHeight, setLineHeight] = useState<number>(28.8); // fallback ~1.8 * 16

  const getAnchor = useAnchor(stageRef);

  const committedText = useMemo(() => (committedLines.length ? committedLines.join('\n') + '\n' : ''), [committedLines]);

  // Measure caret absolute position
  const measureCaret = useCallback(() => {
    const el = currentMeasureRef.current;
    if (!el) return { x: 0, y: 0 };

    el.textContent = '';
    const committedNode = document.createTextNode(committedText);
    const currentNode = document.createTextNode(currentLine);
    const marker = document.createElement('span');
    marker.textContent = '\u200b';

    el.appendChild(committedNode);
    el.appendChild(currentNode);
    el.appendChild(marker);

    const rect = marker.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }, [committedText, currentLine]);

  // Compute offsets; lock baseY so the current line doesn't move vertically
  const updateOffsets = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const anchor = getAnchor();
    const caret = measureCaret();

    const stageRect = stage.getBoundingClientRect();
    const caretLocal = { x: caret.x - stageRect.left, y: caret.y - stageRect.top };
    const desiredLocal = { x: anchor.x - stageRect.left, y: anchor.y - stageRect.top };

    // Update X on every change
    setOffsetX(desiredLocal.x - caretLocal.x);

    // Initialize or recompute baseY only when not set
    setBaseY((prev) => (prev == null ? desiredLocal.y - caretLocal.y : prev));

    // Translate committed so its bottom is exactly one line above the current line baseline
    const committedEl = committedMeasureRef.current;
    if (committedEl) {
      committedEl.textContent = committedText || '\u200b';
      const crect = committedEl.getBoundingClientRect();
      const committedHeight = crect.height;
      const targetBottomLocal = desiredLocal.y - lineHeight; // one line above baseline
      const committedBottomLocal = committedHeight; // measure layer starts at 0
      const dy = targetBottomLocal - committedBottomLocal;
      setCommittedOffset({ x: 0, y: dy });
    } else {
      setCommittedOffset({ x: 0, y: 0 });
    }
  }, [getAnchor, measureCaret, committedText, lineHeight]);

  // Read computed line-height from the measure layer for accuracy
  useLayoutEffect(() => {
    const el = currentMeasureRef.current;
    if (!el) return;
    const cs = window.getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight);
    if (!Number.isNaN(lh) && lh > 0) setLineHeight(lh);
  }, []);

  useLayoutEffect(() => { updateOffsets(); }, [committedText, currentLine, updateOffsets]);

  // Detect wrapping of current line (visual)
  const didWrap = useCallback(() => {
    const el = currentMeasureRef.current;
    if (!el) return false;

    el.textContent = '';
    const committedNode = document.createTextNode(committedText);
    const firstSpan = document.createElement('span');
    firstSpan.textContent = currentLine.length ? currentLine[0] : '\u200b';
    el.appendChild(committedNode);
    el.appendChild(firstSpan);
    const firstRect = firstSpan.getBoundingClientRect();

    el.textContent = '';
    const committedNode2 = document.createTextNode(committedText);
    const currentNode2 = document.createTextNode(currentLine);
    const probe = document.createElement('span');
    probe.textContent = '\u200b';
    el.appendChild(committedNode2);
    el.appendChild(currentNode2);
    el.appendChild(probe);
    const lastRect = probe.getBoundingClientRect();

    return currentLine.length > 0 && Math.abs(lastRect.top - firstRect.top) > 1;
  }, [committedText, currentLine]);

  // Key handling: edit only currentLine
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setCurrentLine((t) => t + e.key);
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        setCurrentLine((t) => (t.length ? t.slice(0, -1) : t));
        e.preventDefault();
      } else if (e.key === 'Enter') {
        setCommittedLines((lines) => [...lines, currentLine]);
        setCurrentLine('');
        // Keep the same baseY for the new line; only X will reset on next update
        e.preventDefault();
      } else if (e.key === 'Tab') {
        setCurrentLine((t) => t + '  ');
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentLine]);

  // Commit when the current line wraps to next line
  useLayoutEffect(() => {
    if (didWrap()) {
      setCommittedLines((lines) => [...lines, currentLine]);
      setCurrentLine('');
    }
  }, [currentLine, didWrap]);

  // Recompute baseY on resize so cursor stays aligned
  useEffect(() => {
    const onResize = () => {
      // Force recompute of baseY on next update
      setBaseY(null);
      updateOffsets();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateOffsets]);

  const anchor = getAnchor();

  return (
    <section className={styles.container}>
      <div className={styles.stage} ref={stageRef} aria-live="polite">
        {/* Frozen committed content (translated to sit one line above current) */}
        <div
          className={styles.committedLayer}
          style={{ transform: `translate(${committedOffset.x}px, ${committedOffset.y}px)` }}
          aria-hidden
        >
          {committedText}
        </div>

        {/* Visible current line (X updates, Y locked) */}
        <div
          className={styles.currentLayer}
          style={{ transform: `translate(${offsetX}px, ${baseY ?? 0}px)` }}
        >
          {currentLine}
        </div>

        {/* Hidden measurement layers */}
        <div ref={currentMeasureRef} className={styles.measureLayer} aria-hidden />
        <div ref={committedMeasureRef} className={styles.measureLayer} aria-hidden />

        {/* Fixed-position blinking cursor at the right edge */}
        <div
          className={styles.cursor}
          style={{
            left: `${anchor.x - (stageRef.current?.getBoundingClientRect().left ?? 0)}px`,
            top: `${anchor.y - (stageRef.current?.getBoundingClientRect().top ?? 0)}px`,
          }}
        />
      </div>

      <div className={styles.controls}>
        <div className={styles.hint}>Line stays fixed. Enter or wrap commits a line. Backspace only edits current line.</div>
      </div>
    </section>
  );
}
