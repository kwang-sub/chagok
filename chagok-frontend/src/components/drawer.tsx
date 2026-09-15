"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

/** Native modal supplies keyboard focus containment, Escape and inert background. */
export function Drawer({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    return () => { dialog?.close(); if (previous instanceof HTMLElement) previous.focus(); };
  }, []);
  return <dialog ref={ref} className="drawer" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="drawer-heading"><h2 id={titleId}>{title}</h2><button aria-label="상세 닫기" onClick={onClose}>✕</button></div>{children}
  </dialog>;
}
