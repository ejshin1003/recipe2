# 꼬마요리사 레시피 🍳

## 배포 방법 (GitHub Pages + Netlify)

### 1단계 - 파일 구성
```
내_프로젝트_폴더/
├── index.html          ← 웹앱 메인
├── recipes.json        ← 레시피 데이터 (26,093개)
├── netlify.toml        ← Netlify 설정
└── netlify/
    └── functions/
        └── coupang.js  ← 쿠팡 API 프록시
```

### 2단계 - GitHub에 올리기
1. GitHub에서 새 저장소(Repository) 생성
2. 위 파일들 전부 업로드
3. Settings > Pages > Branch: main 선택 → 레시피 데이터 제공용

### 3단계 - Netlify에서 배포 (★ 여기서 실제 사용)
1. https://netlify.com 접속 → GitHub 저장소 연결
2. Site settings > Environment variables에 추가:
   - COUPANG_ACCESS_KEY = 발급받은 Access Key
   - COUPANG_SECRET_KEY = 발급받은 Secret Key  
   - COUPANG_PARTNER_ID = 파트너 ID
3. Deploy → 완료!

### 쿠팡 파트너스 API 키 발급
1. https://partners.coupang.com 접속
2. 개발자 센터 > API 신청
3. Access Key / Secret Key / Partner ID 확인

### 주의사항
- recipes.json(13.8MB)은 GitHub LFS 없이도 올라감 (100MB 제한)
- Netlify 무료 플랜: 함수 실행 125,000회/월 (충분)
- 쿠팡 파트너스 광고수익도 발생 가능!
