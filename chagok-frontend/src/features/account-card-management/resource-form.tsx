"use client";

import { useEffect, useRef, useState } from "react";
import { PreviewControl, SampleHeader, StateMessage } from "./common";
import { emptyFilters, filterQuery, fixtures, formChanged, initialForm, institutions, resourceLabel, resourceTypes, type Filters, type FormValues, type PreviewState, type ResourceKind, type SampleItem } from "./model";

function useDiscardGuard(dirty: boolean) {
  const leaving = useRef(false);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => {
      if (leaving.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const link = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      if (window.confirm("입력한 내용을 폐기하고 이동할까요? 저장되지 않습니다.")) {
        leaving.current = true;
        window.location.assign(anchor.href);
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", link, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", link, true); };
  }, [dirty]);
}
function InstitutionPicker({ kind, value, onChange }: { kind: ResourceKind; value: string; onChange: (value: string) => void }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("normal");
  const label = kind === "accounts" ? "금융기관" : "카드사";
  const matches = institutions[kind].filter((item) => item.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <fieldset className="acm-institution acm-wide"><legend>{label} 선택</legend>
    <p className="muted">가상 기관 목록입니다. 공식 검증 기관목록이 아닙니다.</p>
    <label>{label} 검색<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <details className="preview-controls"><summary>기관 목록 샘플 상태</summary><label>기관 상태<select value={state} onChange={(event) => setState(event.target.value)}><option value="normal">정상</option><option value="loading">로딩</option><option value="error">오류</option><option value="empty">목록 없음</option></select></label></details>
    {state === "normal" ? <>{matches.length ? <div className="button-row" aria-label={`${label} 검색 결과`}>{matches.map((item) => <button key={item} type="button" aria-pressed={value === item} onClick={() => onChange(item)}>{item}</button>)}</div> : <p role="status">검색 결과가 없습니다. 검색어를 바꿔주세요.</p>}</> : <p role={state === "error" ? "alert" : "status"}>{state === "loading" ? "샘플 기관 목록을 불러오는 중입니다." : state === "empty" ? "샘플 기관 목록이 없습니다." : "기관 목록 샘플 오류입니다. 기존 선택은 유지됩니다."}</p>}
    {state !== "normal" && state !== "loading" && <button type="button" onClick={() => setState("normal")}>기관 샘플 재시도</button>}
    <p>선택: {value || "선택 없음"}</p>
  </fieldset>;
}
function EditableForm({ kind, item, cancelHref }: { kind: ResourceKind; item: SampleItem | undefined; cancelHref: string }) {
  const [initial] = useState(() => initialForm(item));
  const [values, setValues] = useState(initial);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [message, setMessage] = useState("");
  const dirty = formChanged(initial, values);
  useDiscardGuard(dirty);
  const change = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setMessage("");
  };
  const label = resourceLabel(kind);
  return <form autoComplete="off" onSubmit={(event) => { event.preventDefault(); setMessage(simulateFailure ? "샘플 확인 실패입니다. 입력은 유지됩니다. 실제 저장 요청은 전송하지 않았습니다." : "입력을 확인했습니다. 저장은 연결되지 않아 저장되지 않았습니다. 실제 번호 형식·존재·명의는 검증하지 않습니다."); }}>
    <section className="panel acm-form">
      <h2 className="acm-wide">{label} 기본정보</h2>
      <p className="muted acm-wide">소유자: 샘플 본인(나) · 조회 구성원 필터와 무관합니다. 모든 입력은 화면 확인용이며 필수·형식 정책은 미확정입니다.</p>
      <label className="acm-wide">{label}명<input value={values.name} onChange={(event) => change("name", event.target.value)} /></label>
      <InstitutionPicker kind={kind} value={values.institution} onChange={(value) => change("institution", value)} />
      <label>{label}유형<select value={values.type} onChange={(event) => change("type", event.target.value)}><option value="">선택 없음</option>{resourceTypes[kind].map((type) => <option key={type}>{type}</option>)}</select><small className="muted">샘플 유형이며 운영 코드가 아닙니다.</small></label>
      {kind === "accounts" ? <label>개설일 (선택)<input type="date" value={values.opened} onChange={(event) => change("opened", event.target.value)} /></label> : <label>결제일 (선택·샘플)<input value={values.paymentDay} placeholder="예: 15일" onChange={(event) => change("paymentDay", event.target.value)} /><small className="muted">허용 범위·카드유형별 규칙은 아직 정하지 않았습니다.</small></label>}
      <fieldset className="acm-number acm-wide"><legend>샘플 번호</legend>
        {item && <><p>기존 표시 끝자리: •••• {item.suffix} (원본 번호 아님)</p><label className="acm-checkbox"><input type="checkbox" checked={values.replaceNumber} onChange={(event) => setValues((current) => ({ ...current, replaceNumber: event.target.checked, number: "" }))} />새 샘플 번호 입력 (선택하지 않으면 기존 유지)</label></>}
        {(!item || values.replaceNumber) && <label>샘플 번호 입력<input type="password" autoComplete="new-password" value={values.number} onChange={(event) => change("number", event.target.value)} aria-describedby="sample-number-help" /></label>}
        <p id="sample-number-help" className="muted">실제 번호 대신 SAMPLE 같은 가상 문자열만 사용하세요. 메모리에서만 다루며 전송·저장하지 않습니다.</p>
      </fieldset>
      <label className="acm-wide">메모<textarea rows={4} value={values.memo} onChange={(event) => change("memo", event.target.value)} /></label>
      <label className="acm-checkbox acm-wide"><input type="checkbox" checked={simulateFailure} onChange={(event) => { setSimulateFailure(event.target.checked); setMessage(""); }} />입력 확인 실패 샘플</label>
    </section>
    <footer className="acm-actions"><a className="button" href={cancelHref}>취소</a><button className="primary" type="submit">입력 확인 (저장 안 됨)</button></footer>
    {message && <p className="warning" role={simulateFailure ? "alert" : "status"}>{message}</p>}
  </form>;
}
export function ResourceForm({ kind, id, filters = emptyFilters }: { kind: ResourceKind; id?: string; filters?: Filters }) {
  const item = fixtures[kind].find((candidate) => candidate.id === id);
  const listHref = `/${kind}${filterQuery(filters)}`;
  const cancelHref = id ? `/${kind}/${id}${filterQuery(filters)}` : listHref;
  const [state, setState] = useState<PreviewState>("normal");
  const unavailable = id && !item ? "not-found" : item?.owner === "다른 구성원" ? "denied" : state;
  return <div className="acm">
    <SampleHeader kind={kind} title={`${resourceLabel(kind)} ${id ? "수정" : "등록"}`} filters={filters} />
    <PreviewControl state={state} onChange={setState} options={["normal", "loading", "error", "denied", "not-found"]} />
    {unavailable !== "normal" && <StateMessage state={unavailable} onRetry={() => setState("normal")}><a className="button" href={listHref}>목록으로</a></StateMessage>}
    {/* Preview states hide presentation without discarding the in-memory draft. */}
    {(!id || item?.owner === "나") && <div hidden={unavailable !== "normal"}><EditableForm kind={kind} item={item} cancelHref={cancelHref} /></div>}
  </div>;
}
