"use client";

import { useState } from "react";
import { PreviewControl, SampleHeader, StateMessage, StatusBadge } from "./common";
import { emptyFilters, filterQuery, fixtures, resourceLabel, type Filters, type PreviewState, type ResourceKind } from "./model";

export function ResourceDetail({ kind, id, filters = emptyFilters }: { kind: ResourceKind; id: string; filters?: Filters }) {
  const [state, setState] = useState<PreviewState>("normal");
  const [message, setMessage] = useState("");
  const item = fixtures[kind].find((candidate) => candidate.id === id);
  const listHref = `/${kind}${filterQuery(filters)}`;
  const visibleState = item ? state : "not-found";
  const deactivate = () => {
    if (window.confirm("샘플 비활성화 흐름을 확인할까요? 실제 상태는 변경되지 않습니다.")) {
      setMessage("비활성화는 미연결입니다. 실제 상태는 변경되지 않았습니다.");
    }
  };
  return <div className="acm">
    <SampleHeader kind={kind} title={`${resourceLabel(kind)} 상세`} filters={filters} />
    <PreviewControl state={state} onChange={setState} options={["normal", "loading", "error", "denied", "not-found"]} />
    {visibleState !== "normal" ? <StateMessage state={visibleState} onRetry={() => setState("normal")}><a className="button" href={listHref}>목록으로</a></StateMessage> : item && <>
      <article className="panel acm-detail">
        <header className="acm-detail-heading"><span className="asset-icon" aria-hidden="true">{kind === "accounts" ? "▥" : "▣"}</span><div><h2>{item.name}</h2><p className="muted">{item.institution} · {item.type}</p></div><StatusBadge active={item.active} /></header>
        <dl><div><dt>이름</dt><dd>{item.name}</dd></div><div><dt>{kind === "accounts" ? "금융기관" : "카드사"}</dt><dd>{item.institution}</dd></div><div><dt>유형</dt><dd>{item.type}</dd></div><div><dt>구성원 (샘플)</dt><dd>{item.owner}</dd></div><div><dt>식별정보 (가상 끝자리)</dt><dd>•••• {item.suffix}</dd></div><div><dt>{kind === "accounts" ? "개설일" : "결제일 (샘플)"}</dt><dd>{kind === "accounts" ? item.opened : `${item.paymentDay}일`}</dd></div><div className="acm-wide"><dt>메모</dt><dd>{item.memo}</dd></div></dl>
        <p className="acm-notice">{item.owner === "나" ? "샘플 본인 소유: 수정·비활성화 흐름을 확인할 수 있습니다." : "다른 구성원의 샘플: 읽기 전용입니다. 수정·비활성화할 수 없습니다."} 이 표시는 서버 권한 검증을 대체하지 않습니다.</p>
      </article>
      <footer className="acm-actions"><a className="button" href={listHref}>목록으로</a>{item.owner === "나" && <div className="button-row"><button disabled={!item.active} onClick={deactivate}>비활성화</button><a className="button primary" href={`/${kind}/${id}/edit${filterQuery(filters)}`}>수정</a></div>}</footer>
      {message && <p className="warning" role="status">{message}</p>}
    </>}
  </div>;
}
