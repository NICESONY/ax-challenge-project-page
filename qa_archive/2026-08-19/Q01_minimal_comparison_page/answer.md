# AX Challenge 비교 영상 전용 페이지 업데이트

- 작성일: 2026-08-19
- 대상: `https://nicesony.github.io/ax-challenge-project-page/`

## 원문 질문

> https://nicesony.github.io/ax-challenge-project-page/#overview 이거 비교 영상 제목
> 말고 전부 주석처리해서 업데이트

## 답변

공개 화면에는 다음 요소만 남기도록 변경했다.

- 비교 섹션 제목 `VTA vs VA`
- 영상 제목 `Vision-only UMI`
- 영상 제목 `Vision + Tactile`
- 두 비교 MP4 player

내비게이션, hero, overview, position, rotation, tactile 설명, 비교 protocol,
영상 metadata footer, 사이트 footer와 lightbox는 삭제하지 않고 `index.html`의
`AX_CHALLENGE_ARCHIVE` HTML 주석 안에 보존했다.

## 변경 파일

- `index.html`
  - 기존 콘텐츠를 HTML 주석으로 비공개 처리
  - 비교 제목과 두 영상만 DOM에 유지
- `static/css/ax-challenge.css`
  - 비교 영상 전용 화면을 viewport 중앙에 배치
- `tests/page.spec.js`
  - 공개 text가 제목 3개뿐인지 검사
  - 숨겨야 할 section이 DOM에 없는지 검사
  - 두 MP4가 실제 decode되고 재생 시간이 증가하는지 검사
  - desktop/mobile horizontal overflow 검사

## 근거 또는 검증

로컬 Playwright 결과:

```text
3 passed
```

검증 항목:

- desktop에서 visible text가 `VTA vs VA`, `Vision-only UMI`,
  `Vision + Tactile`뿐임
- `#overview`, `#position`, `#rotation`, `#touch`가 DOM에 없음
- nav, hero, site footer가 DOM에 없음
- comparison video 2개 존재
- `vision_only.mp4`, `ours_tactile.mp4` 모두 HTTP 200
- 두 영상 모두 실제 decode 후 `currentTime > 0.1 s`
- desktop/mobile horizontal overflow 없음

## 불확실성

- 기존 연구 내용은 HTML source를 보는 방문자에게는 주석으로 보일 수 있다. 화면에서만
  숨기는 것이 목적이므로 삭제하지 않았다.
- 브라우저 autoplay 정책에 따라 최초 자동 재생은 막힐 수 있으나 controls가 있고
  사용자가 play할 수 있다. 테스트 환경에서는 muted autoplay와 수동 play가 모두
  정상 동작했다.

## 다음 행동

1. GitHub Actions Pages 배포 성공을 확인한다.
2. cache-busting URL에서 제목 3개와 영상 2개만 보이는지 확인한다.
3. 원래 연구 페이지를 복원할 때는 `AX_CHALLENGE_ARCHIVE` 주석 경계만 해제한다.
