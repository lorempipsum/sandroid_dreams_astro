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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [committedOffset, setCommittedOffset] = useState({ x: 0, y: 0 });

  const getAnchor = useAnchor(stageRef);

  const lineHeightPx = 1.8 * 16; // approximate; we'll refine via computed style

  // Build committed text block with trailing newline
  const committedText = useMemo(() => (committedLines.length ? committedLines.join('\n') + '\n' : ''), [committedLines]);

  // Hidden measurement container content mirrors committed + current to get caret position correctly
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

  const updateOffsets = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const anchor = getAnchor();
    const caret = measureCaret();

    const stageRect = stage.getBoundingClientRect();
    const caretLocal = { x: caret.x - stageRect.left, y: caret.y - stageRect.top };
    const desiredLocal = { x: anchor.x - stageRect.left, y: anchor.y - stageRect.top };

    setOffset({ x: desiredLocal.x - caretLocal.x, y: desiredLocal.y - caretLocal.y });

    // For committed block: position it so its bottom sits exactly one line above the current line's baseline
    // Measure committed block height using a hidden mirror
    const committedEl = committedMeasureRef.current;
    if (committedEl) {
      committedEl.textContent = committedText || '\u200b';
      const crect = committedEl.getBoundingClientRect();
      const committedHeight = crect.height; // includes padding of measure layer

      const targetBottomLocal = desiredLocal.y - lineHeightPx; // one line above
      const committedBottomLocal = committedHeight; // since committed mirror starts at top=0
      const dy = targetBottomLocal - committedBottomLocal;
      setCommittedOffset({ x: 0, y: dy });
    } else {
      setCommittedOffset({ x: 0, y: 0 });
    }
  }, [getAnchor, measureCaret, committedText]);

  useLayoutEffect(() => { updateOffsets(); }, [committedText, currentLine, updateOffsets]);

  // Detect wrapping of current line by comparing its first char y vs last char y
  const didWrap = useCallback(() => {
    const el = currentMeasureRef.current;
    if (!el) return false;

    el.textContent = '';
    const committedNode = document.createTextNode(committedText);
    const currentNode = document.createTextNode(currentLine);
    const probe = document.createElement('span');
    probe.textContent = '\u200b';

    // First char of current line
    const firstSpan = document.createElement('span');
    firstSpan.textContent = currentLine.length ? currentLine[0] : '\u200b';

    el.appendChild(committedNode);
    el.appendChild(firstSpan);
    const firstRect = firstSpan.getBoundingClientRect();

    el.textContent = '';
    const committedNode2 = document.createTextNode(committedText);
    const currentNode2 = document.createTextNode(currentLine);
    el.appendChild(committedNode2);
    el.appendChild(currentNode2);
    el.appendChild(probe);
    const lastRect = probe.getBoundingClientRect();

    return currentLine.length > 0 && Math.abs(lastRect.top - firstRect.top) > 1; // wrapped if y changed
  }, [committedText, currentLine]);

  // Key handling: only mutate currentLine; backspace limited to current line
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

  // Commit when the current line wraps onto a new visual line
  useLayoutEffect(() => {
    if (didWrap()) {
      setCommittedLines((lines) => [...lines, currentLine]);
      setCurrentLine('');
    }
  }, [currentLine, didWrap]);

  // Recompute positions on resize
  useEffect(() => {
    const onResize = () => updateOffsets();
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

        {/* Visible current line (translated to anchor) */}
        <div
          className={styles.currentLayer}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
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
        <div className={styles.hint}>Type. Enter or wrap will commit a line. Backspace only edits current line.</div>
      </div>
    </section>
  );
}
