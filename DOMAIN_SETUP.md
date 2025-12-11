# Vercel 도메인 설정 가이드

## 현재 도메인 구조

1. **메인 프로덕션 도메인**: `portfoliojihee.vercel.app`
   - 이 도메인이 항상 최신 프로덕션 빌드를 가리킵니다.
   - 프로젝트 이름에 따라 자동 생성됩니다.

2. **배포별 URL**: `portfoliojihee-xxxxx-xxx.vercel.app`
   - 각 배포마다 생성되는 임시 URL입니다.
   - 메인 도메인을 통해 접근하면 자동으로 최신 빌드를 보여줍니다.

## 도메인 통일 방법

### 방법 1: Vercel 대시보드에서 확인 (권장)

1. [Vercel 대시보드](https://vercel.com) 접속
2. 프로젝트 `portfolio_jihee` 선택
3. **Settings** → **Domains** 메뉴로 이동
4. 확인 사항:
   - `portfoliojihee.vercel.app`가 **Production**으로 설정되어 있는지 확인
   - 불필요한 할당된 도메인은 제거 가능 (선택사항)

### 방법 2: 메인 도메인만 사용

**중요**: 모든 사용자는 **메인 프로덕션 URL만 사용**해야 합니다:
- ✅ 사용: `https://portfoliojihee.vercel.app`
- ❌ 사용 안 함: `https://portfoliojihee-xxxxx-xxx.vercel.app` (임시 URL)

## 메인 도메인이 항상 최신 버전을 가리키도록 보장

프로덕션 배포 시:
```bash
npx vercel --prod --yes
```

이 명령어는 항상 메인 프로덕션 도메인(`portfoliojihee.vercel.app`)에 최신 빌드를 배포합니다.

## 캐시 문제 해결

만약 다른 버전이 보인다면:

1. **브라우저 캐시 삭제**
   - Chrome/Edge: `Ctrl + Shift + Delete`
   - Firefox: `Ctrl + Shift + Delete`
   - Safari: `Cmd + Option + E`

2. **하드 리프레시**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **시크릿 모드에서 접속**
   - 새 시크릿 창에서 `https://portfoliojihee.vercel.app` 접속

## 커스텀 도메인 추가 (선택사항)

나중에 커스텀 도메인을 추가하려면:

1. Vercel 대시보드 → Settings → Domains
2. "Add Domain" 버튼 클릭
3. 도메인 입력 (예: `yourdomain.com`)
4. DNS 설정 안내에 따라 설정

## 현재 설정 확인

```bash
# 프로젝트 정보 확인
npx vercel project ls

# 배포 목록 확인
npx vercel ls
```


