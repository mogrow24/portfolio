import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // 쿠키에서 언어 설정 가져오기, 기본값은 한국어
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'ko';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

