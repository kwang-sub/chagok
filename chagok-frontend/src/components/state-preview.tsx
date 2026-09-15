"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
export type PreviewState = "populated" | "loading" | "empty" | "partial" | "error" | "stale";

/** Explicit preview controls keep unavailable backend states testable without fake fetching. */
export function StatePreview({ children, dashboard = false }: { children: ReactNode; dashboard?: boolean }) {
  const [state, setState] = useState<PreviewState>("populated");
  const states: readonly { value: PreviewState; label: string }[] = [
    { value: "populated", label: "정상" }, { value: "loading", label: "로딩" }, { value: "empty", label: "비어 있음" },
    { value: "partial", label: "일부 데이터 없음" }, { value: "error", label: "오류" }, { value: "stale", label: "이전 시세" },
  ];
  return <><details className="preview-controls"><summary>UI 상태 미리보기</summary><div className="button-row">{states.map((item) => <button key={item.value} aria-pressed={state === item.value} onClick={() => setState(item.value)}>{item.label}</button>)}</div></details>
    {state === "loading" ? <div aria-busy="true" role="status"><p>예시 데이터를 불러오는 중입니다.</p><div className="skeleton-grid">{[1,2,3,4,5,6].map((i) => <div className="panel skeleton" key={i}><span/><span/><span/></div>)}</div></div> : null}
    {state === "empty" && <section className="panel empty-state"><h2>{dashboard ? "첫 자산을 등록해 보세요" : "아직 투자 데이터가 없습니다"}</h2><p>데이터가 등록되면 이곳에서 현황을 확인할 수 있습니다. 현재는 UI 예시입니다.</p>{dashboard && <Link className="button primary" href="/preview/assets">자산 등록 안내</Link>}<button onClick={() => setState("populated")}>예시 데이터 보기</button></section>}
    {state === "error" && <section className="panel empty-state" role="alert"><h2>데이터를 표시하지 못했습니다</h2><p>연결 상태를 확인해 주세요. 현재 오류는 UI 상태 예시입니다.</p><button className="primary" onClick={() => setState("populated")}>다시 시도</button></section>}
    {(state === "populated" || state === "partial" || state === "stale") && <div className={`data-state state-${state}`}>
      {state === "partial" && <p className="warning" role="status">일부 외부 시세를 확인하지 못했습니다. 투자 평가 영역은 표시하지 않으며 정상 영역은 유지합니다.</p>}
      {state === "stale" && <p className="warning" role="status">이전 시세입니다. 2025-09-11 09:30 KST 기준 예시이며 실시간 가격이 아닙니다.</p>}
      {children}
    </div>}
  </>;
}
