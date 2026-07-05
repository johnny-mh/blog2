# ooc-web 커밋에서 뽑은 테크 블로그 글감

가장 글로 풀기 좋은 순서대로 정리했습니다. 각 항목에 **근거 커밋**과 **앵글**을 같이 적었습니다.

---

## 🥇 1. 초기 번들 30% 줄이기: SDK lazy-load와 정책 문서 분리 실전기

가장 완성도 높은 소재. 측정 리포트(`perf-report-2026-05-29.md`)에 before/after 수치가 다 있어서 글 한 편이 거의 나옵니다.

- **핵심 수치**: Initial 번들 1.67MB → 1.18MB (gzip 493KB → 344KB, **−30%**), entry chunk는 **−47%**
- **기법 4가지**:
  1. Mixpanel / Datadog / Unleash SDK를 static import → 동적 `import()`로 전환 (`c20ecc8b`, `0c009f64`, `9fd77506`)
  2. Policy 마크다운(약 160KB)을 entry chunk에서 빼서 `public/`으로 옮기고 TanStack Query로 런타임 fetch (`1ae0c01a`)
  3. `useFlag`/`useVariant`를 `useEffect`에서 client ready를 await하도록 재설계 (lazy SDK와의 타이밍 해결)
  4. agent-browser로 런타임 실측 검증까지
- **앵글**: "측정 → 가설 → 적용 → 재측정" 루프. rsdoctor로 cross-chunk 중복까지 추적한 과정.

## 🥈 2. 분석 SDK를 앱에서 떼어내 공유 패키지로: `@wrtn/web-integrations` 마이그레이션

US-001~US-012까지 단계적으로 쪼갠 깔끔한 리팩터링 시리즈(`fe16fdb8`~`f1e4401e`). 점진적 마이그레이션 글감으로 좋습니다.

- 흩어져 있던 `@wrtn/events`, `@wrtn/feature-flag`, `@wrtn/google-tag-manager` 래퍼를 하나의 패키지로 통합·정리
- **앵글**: "대형 리팩터링을 12개 PR로 쪼개 무중단으로 끝내기" + lazy init on failure 재시도 같은 디테일(`678e97fb`)

## 🥉 3. 모노레포 번들 거버넌스: FSD barrel 분리 + lazy 모달 + entry budget CI

번들이 다시 뚱뚱해지지 않게 **규칙으로 막은** 이야기. 일회성 최적화가 아니라 시스템화한 점이 차별점.

- entities/story·character, widgets/search-dialog barrel을 slice group으로 분리해 트리셰이킹 복원 (`3559e191`, `b5a04b77`, `39fa5cd5`)
- 글로벌 모달 19개 lazy 전환 + `lazyModalRoot` 헬퍼 (`a59199b5`, `f00290c5`)
- **ESLint 커스텀 룰**로 eager modal import / barrel 직접 import 금지 (`a9a256da`, `f68e4fba`)
- **entry chunk size budget CI 체크** 도입 (`f2ba63bf`)
- **앵글**: "최적화를 사람 규율이 아닌 lint·CI로 강제하기"

## 4. WebView ↔ 웹 브릿지로 분석 이벤트 통합하기

하이브리드 앱에서 흔한 문제를 다룬 실용적 소재.

- WebView에선 Mixpanel을 네이티브 `log_event` 브릿지로 전달 (`553ca653`)
- WebView에선 AppsFlyer Web SDK 미로드 — 네이티브가 처리 (`668fa0a1`)
- WebView에서 user_id가 null로 새던 버그(`040490f9`), 뒤로가기 unsaved-changes 가드 통일(`4604d6ac`)
- **앵글**: "웹과 네이티브가 같은 이벤트를 중복/누락 없이 보내게 만들기"

## 5. 멀티 플랫폼 그로스 트래킹 셋업: AppsFlyer + GTM + Mixpanel

어트리뷰션/애널리틱스 통합 셋업 경험담.

- AppsFlyer Web SDK 연동, CUID(`setCustomerUserId`)를 모든 식별 지점에 세팅, 가입 완료 이벤트(`34f615be`~`66a8e421`)
- GTM `sign_up`/`login` 이벤트, Mixpanel super property로 page-context 일원화(`0607403e`)
- **앵글**: "user_id 타이밍 이슈" 버그 모음(`badea74c`, `040490f9`)이 좋은 디테일

## 6. 컴플라이언스 UX를 코드로: 연령·동의·콘텐츠 성향 게이트

규제 대응을 프론트에서 어떻게 풀었나. 스토리가 분명합니다.

- 13세 미만 가입 차단 + 생년월일 수집, 차단 시 즉시 하드 딜리트(`2f5d1f77`, `ee3b3184`)
- 비회원 콘텐츠 성향 게이트, localStorage + target 쿼리 전환(`0f7f5936`, `0c4db959`)
- AgeGate → GuestGate/ConsentGateModal 리네임 + storage 차단 방어(`386a326d`, `f0bd37c7`)
- **앵글**: "정책이 자주 바뀌는 게이트를 유연하게 설계하기" + 시크릿 모드 storage 차단 방어 디테일

## 7. 디자인 시스템 디테일 버그 모음 (가벼운 글)

- 다이얼로그/드로어 위 토스트 클릭 시 닫히는 문제 + sonner 스택 순서 보존(`0eccf025`, `e088e605`)
- iOS 스타일 휠 날짜 피커 직접 구현(`6905d641`)
- 캘린더 첫/마지막 칼럼 radius 비대칭(`6fde5ed4`)
- **앵글**: "DS 컴포넌트의 z-index·포커스·radius 엣지케이스 디버깅 노트"

---

**추천**: 1번(번들 30% 절감)이 수치·검증·과정이 다 갖춰져 바로 쓸 수 있는 최고 소재이고, 3번(번들 거버넌스 시스템화)과 묶어 "최적화하고 → 다시 안 망가지게 가두기" 2부작으로 가면 임팩트가 큽니다.
