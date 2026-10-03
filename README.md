# DINOBIRD AGENCY — Website

정적 웹사이트입니다. 빌드 과정 없이 그대로 배포됩니다.

## 로컬에서 보기
```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```
(파일을 직접 더블클릭해도 열리지만, 영상·폰트는 로컬 서버에서 확인하는 편이 안정적입니다.)

## GitHub Pages 배포
1. 이 폴더 내용을 레포지토리 루트에 업로드
2. Settings → Pages → Source: `main` / `/ (root)`
3. 몇 분 후 `https://<user>.github.io/<repo>/` 에서 공개됩니다

## 구성
- `index.html` — 사이트 전체 (홈 / About / Dino Artist 목록·상세 / Bird letter / contact)
- `support.js` — 런타임
- `image-slot.js` — 이미지 교체 슬롯 컴포넌트
- `assets/` — 로고·사진
- `media/dinobird-film.mp4` — 홈 히어로 영상
- `_ds/` — 스타일시트

## 콘텐츠 수정
아티스트·뉴스레터 목록은 `index.html` 안의 `ARTISTS`, `LETTERS` 배열에서 수정합니다.
