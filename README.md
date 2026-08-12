# AX Challenge project page

UMI→TCP 위치·회전 데이터 전처리, 좌·우 DIGIT sensor, 실제 로봇 영상 비교를
사진 중심으로 보여주는 AX Challenge용 별도 정적 페이지입니다.

- Public page: <https://nicesony.github.io/ax-challenge-project-page/>
- Public source: <https://github.com/NICESONY/ax-challenge-project-page>
- 기존 Touch-Aware PiPER 페이지와 저장소는 수정하지 않습니다.

## AX edition의 구성

- Hero의 기존 `Raw video → tracked TCP / tactile / PiPER-ready` 3-image gallery 제거
- `00`을 네 개의 visual contents 카드로 교체
  - UMI→TCP position preprocessing
  - UMI→TCP rotation preprocessing
  - bilateral DIGIT sensor
  - real-robot video comparison
- 기존 `01`에서 `DEPLOYMENT MISMATCH` subsection 제거
- 기존 `03 · PIPER RETARGETING` 제거
- 기존 `06 · WHAT THIS PAGE CAN CLAIM` 제거
- 남은 섹션을 `01–04`로 재번호

## Local preview

```powershell
npm install
npm run preview
```

브라우저에서 `http://127.0.0.1:8765/`를 엽니다.

## Validation

```powershell
npm test
```

Playwright가 desktop/mobile layout, local assets, section removal, MP4 decode와 baseline
video slot을 확인합니다.

## Video slots

- `static/videos/project/comparison/vision_only.mp4`: vision-only rollout
- `static/videos/project/comparison/ours_tactile.mp4`: 2026-08-12에 제공된 successful
  vision + bilateral tactile rollout

현재 두 영상은 모두 재생되지만 matched pair는 아니므로 페이지는 계속 `A/B IN
PROGRESS`로 표시합니다.

## Publication boundary

이 저장소는 공개 페이지에 실제 필요한 HTML/CSS/JS/media와 테스트만 포함합니다. 내부
QA, SSH 절대경로, 서버 로그, checkpoint, dataset은 포함하지 않습니다. 정적 페이지에
들어간 사진과 영상은 방문자가 내려받을 수 있습니다.

## Attribution

This page is based on the
[Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template),
adapted from the Nerfies project page, under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Research media may have
separate project-specific rights.
