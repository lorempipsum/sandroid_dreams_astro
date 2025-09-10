import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './Typewriter.module.scss';

// Left-aligned baseline near bottom; x is not used for alignment anymore
const useBaselineAnchor = (stageRef: React.RefObject<HTMLDivElement>) => {
  return useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
    const padding = 16;
    return { x: rect.left + padding, y: rect.bottom - padding - 4 };
  }, [stageRef]);
};

export default function Typewriter() {
  const stageRef = useRef<HTMLDivElement>(null);
  const currentMeasureRef = useRef<HTMLDivElement>(null);
  const committedMeasureRef = useRef<HTMLDivElement>(null);

  const [committedLines, setCommittedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<string>('');

  // Cursor position tracks the actual caret (stage-local)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Vertical baseline lock; no horizontal translation for current line
  const [baseY, setBaseY] = useState<number | null>(null);
  const [committedOffset, setCommittedOffset] = useState({ x: 0, y: 0 });
  const [lineHeight, setLineHeight] = useState<number>(28.8);

  const getAnchor = useBaselineAnchor(stageRef);

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

  // Update positions; lock baseline Y; set cursor to measured caret; no X translation for current line
  const updateLayout = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const anchor = getAnchor();
    const caret = measureCaret();

    const stageRect = stage.getBoundingClientRect();
    const caretLocal = { x: caret.x - stageRect.left, y: caret.y - stageRect.top };
    const desiredLocal = { x: anchor.x - stageRect.left, y: anchor.y - stageRect.top };

    // Track cursor at actual caret
    setCursorPos(caretLocal);

    // Initialize baseline once; keeps current line from drifting vertically
    setBaseY((prev) => (prev == null ? desiredLocal.y - caretLocal.y : prev));

    // Position committed so its bottom is one line above the baseline
    const committedEl = committedMeasureRef.current;
    if (committedEl) {
      committedEl.textContent = committedText || '\u200b';
      const crect = committedEl.getBoundingClientRect();
      const committedHeight = crect.height;
      const targetBottomLocal = desiredLocal.y - lineHeight;
      const committedBottomLocal = committedHeight;
      const dy = targetBottomLocal - committedBottomLocal;
      setCommittedOffset({ x: 0, y: dy });
    } else {
      setCommittedOffset({ x: 0, y: 0 });
    }
  }, [getAnchor, measureCaret, committedText, lineHeight]);

  // Read computed line-height
  useLayoutEffect(() => {
    const el = currentMeasureRef.current;
    if (!el) return;
    const cs = window.getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight);
    if (!Number.isNaN(lh) && lh > 0) setLineHeight(lh);
  }, []);

  useLayoutEffect(() => { updateLayout(); }, [committedText, currentLine, updateLayout]);

  // Wrap detection
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
        e.preventDefault();
      } else if (e.key === 'Tab') {
        setCurrentLine((t) => t + '  ');
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentLine]);

  // Commit on wrap
  useLayoutEffect(() => {
    if (didWrap()) {
      setCommittedLines((lines) => [...lines, currentLine]);
      setCurrentLine('');
    }
  }, [currentLine, didWrap]);

  // Recompute baseline on resize
  useEffect(() => {
    const onResize = () => {
      setBaseY(null);
      updateLayout();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateLayout]);

  return (
    <section className={styles.container}>
      <div className={styles.stage} ref={stageRef} aria-live="polite">
        {/* Frozen committed content */}
        <div
          className={styles.committedLayer}
          style={{ transform: `translate(${committedOffset.x}px, ${committedOffset.y}px)` }}
          aria-hidden
        >
          {committedText}
        </div>

        {/* Visible current line (no horizontal translation, baseline locked) */}
        <div
          className={styles.currentLayer}
          style={{ transform: `translate(0px, ${baseY ?? 0}px)` }}
        >
          {currentLine}
        </div>

        {/* Hidden measurement layers */}
        <div ref={currentMeasureRef} className={styles.measureLayer} aria-hidden />
        <div ref={committedMeasureRef} className={styles.measureLayer} aria-hidden />

        {/* Cursor at actual caret position */}
        <div
          className={styles.cursor}
          style={{ left: `${cursorPos.x}px`, top: `${(baseY ?? 0) + cursorPos.y}px` }}
        />
      </div>

      <div className={styles.controls}>
        <div className={styles.hint}>Left-aligned typing. Enter or wrap commits a line. Backspace only edits current line.</div>
      </div>
    </section>
  );
}
