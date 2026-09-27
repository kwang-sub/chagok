"use client";

import { useActionState } from "react";
import { saveProfile } from "./profile-actions";
import { displayNameMaxLength, type UserProfile, type ProfileFormState } from "./profile";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const initialState: ProfileFormState = { status: "idle", message: "", fieldError: null, displayName: profile.displayName };
  const [state, action, pending] = useActionState(saveProfile, initialState);
  return (
    <form action={action} className="panel profile-form" aria-busy={pending} noValidate>
      <h2>사용자 정보</h2>
      <div className="profile-field">
        <label htmlFor="display-name">표시 이름</label>
        <input id="display-name" name="displayName" defaultValue={state.displayName} required maxLength={displayNameMaxLength} autoComplete="nickname" readOnly={pending} aria-invalid={Boolean(state.fieldError)} aria-describedby={state.fieldError ? "display-name-help display-name-error" : "display-name-help"} />
        <p id="display-name-help" className="small muted">앞뒤 공백을 제외한 1~50자. Google 계정의 이름은 변경되지 않습니다.</p>
        {state.fieldError && <p id="display-name-error" role="alert">{state.fieldError}</p>}
      </div>
      <div className="profile-field">
        <label htmlFor="profile-email">이메일 (읽기 전용)</label>
        <input id="profile-email" type="text" value={profile.email} readOnly aria-describedby="profile-email-help" />
        <p id="profile-email-help" className="small muted">로그인 계정의 참고 정보이며 여기서 변경할 수 없습니다.</p>
      </div>
      {state.message && <p role={state.status === "error" ? "alert" : "status"} className={state.status === "success" ? "success-notice" : undefined}>{state.message}</p>}
      <div className="button-row"><button type="submit" className="primary" disabled={pending}>{pending ? "저장 중…" : "표시 이름 저장"}</button></div>
    </form>
  );
}
