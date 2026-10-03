# DINOBIRD 서버 연결 가이드 (Supabase · 약 10분)

## 1. 프로젝트 만들기
1. https://supabase.com 접속 → Start your project → 가입
2. New project → 이름 dinobird, 비밀번호 설정, Region: Northeast Asia (Seoul) → Create

## 2. 데이터베이스 설정
1. 왼쪽 메뉴 SQL Editor → New query
2. supabase-setup.sql 내용을 전부 붙여 넣고 RUN → "Success" 확인

## 3. 관리자 계정 만들기
1. Authentication → Users → Add user → Create new user
2. Email: dinobird.agency@gmail.com / 비밀번호 입력 / Auto Confirm User 체크 → Create
3. (권장) Authentication → Sign In / Providers → Email 에서 Allow new users to sign up 끄기

## 4. 키 붙여 넣기
Project Settings → API 에서
- Project URL (https://xxxx.supabase.co)
- anon public key (eyJ... 로 시작)
두 값을 supabase-config.js 의 url, anonKey 에 넣기 (채팅으로 보내주시면 대신 넣어드립니다)
※ service_role 키는 절대 넣지 마세요

## 5. 확인
- 어드민 로그인 → 상단에 "● 서버에 저장됨"
- 아티스트 수정 → 사이트 새로고침 → 반영
- 사이트 Contact 문의 → 어드민 Inbox 도착

## 무료 플랜 한도
DB 500MB · 저장소 1GB · 파일당 50MB · 월 5GB 전송
