export type ResourceKind = "accounts" | "cards";
export type PreviewState = "normal" | "loading" | "empty" | "no-result" | "error" | "denied" | "not-found";
export type SampleItem = Readonly<{
  id: string; name: string; institution: string; type: string; owner: "나" | "다른 구성원";
  active: boolean; suffix: string; opened: string; paymentDay: string; memo: string;
}>;
export type Filters = { query: string; institution: string; type: string; owner: string; status: string; page: number };
export const emptyFilters: Filters = { query: "", institution: "", type: "", owner: "", status: "", page: 1 };
export const pageSize = 5;
export const resourceLabel = (kind: ResourceKind) => kind === "accounts" ? "계좌" : "카드";
export const institutions: Record<ResourceKind, readonly [string, ...string[]]> = {
  accounts: ["새봄은행 (샘플)", "푸른은행 (샘플)", "차곡증권 (샘플)"],
  cards: ["새봄카드 (샘플)", "푸른카드 (샘플)", "차곡카드 (샘플)"],
};
export const resourceTypes: Record<ResourceKind, readonly [string, ...string[]]> = {
  accounts: ["입출금", "예적금", "투자"], cards: ["신용", "체크"],
};
const names: Record<ResourceKind, string[]> = {
  accounts: ["생활비 통장", "여행 저축", "장기 투자", "급여 통장", "비상금", "정기 적금", "이전 통장"],
  cards: ["일상 카드", "여행 카드", "온라인 카드", "교통 카드", "생활 카드", "주말 카드", "이전 카드"],
};
function samples(kind: ResourceKind): readonly SampleItem[] {
  return names[kind].map((name, index) => ({
    id: `sample-${index + 1}`, name, institution: institutions[kind][index % 3] ?? institutions[kind][0],
    type: resourceTypes[kind][index % resourceTypes[kind].length] ?? resourceTypes[kind][0], owner: index === 1 || index === 4 ? "다른 구성원" : "나",
    active: index !== 6, suffix: `S00${index + 1}`, opened: "2025-01-15", paymentDay: "15",
    memo: "화면 확인용 가상 데이터입니다.",
  }));
}
export const fixtures: Record<ResourceKind, readonly SampleItem[]> = { accounts: samples("accounts"), cards: samples("cards") };
export function filterItems(items: readonly SampleItem[], filters: Filters) {
  const query = filters.query.trim().toLocaleLowerCase();
  return items.filter((item) => `${item.name} ${item.institution}`.toLocaleLowerCase().includes(query)
    && (!filters.institution || item.institution === filters.institution)
    && (!filters.type || item.type === filters.type)
    && (!filters.owner || item.owner === filters.owner)
    && (!filters.status || (filters.status === "active" ? item.active : !item.active)));
}
export function readFilters(params: Record<string, string | string[] | undefined>): Filters {
  const text = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const page = Number(text("page"));
  return { query: text("query"), institution: text("institution"), type: text("type"), owner: text("owner"), status: text("status"), page: Number.isSafeInteger(page) && page > 0 ? page : 1 };
}
export function filterQuery(filters: Filters) {
  const params = new URLSearchParams();
  for (const key of ["query", "institution", "type", "owner", "status"] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.size ? `?${params}` : "";
}
export function listPage(items: readonly SampleItem[], filters: Filters) {
  const filtered = filterItems(items, filters);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(filters.page, pages);
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pages };
}
export type FormValues = { name: string; institution: string; type: string; number: string; opened: string; paymentDay: string; memo: string; replaceNumber: boolean };
export function initialForm(item?: SampleItem): FormValues {
  return { name: item?.name ?? "", institution: item?.institution ?? "", type: item?.type ?? "", number: "", opened: item?.opened ?? "", paymentDay: item?.paymentDay ?? "", memo: item?.memo ?? "", replaceNumber: false };
}
export function formChanged(initial: FormValues, current: FormValues) {
  return (Object.keys(initial) as (keyof FormValues)[]).some((key) => initial[key] !== current[key]);
}
