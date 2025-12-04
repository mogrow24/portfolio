// 자동 번역 유틸리티
// MyMemory Translation API 사용 (무료, 일일 1000개 요청)

interface TranslationResult {
  success: boolean;
  translatedText: string;
  error?: string;
}

/**
 * 한글 텍스트를 영어로 번역
 * @param text 번역할 한글 텍스트
 * @returns 번역된 영어 텍스트
 */
export async function translateKoToEn(text: string): Promise<TranslationResult> {
  if (!text.trim()) {
    return { success: true, translatedText: '' };
  }

  try {
    // MyMemory API 사용 (무료, API 키 불필요)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ko|en`
    );

    if (!response.ok) {
      throw new Error('Translation API request failed');
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return {
        success: true,
        translatedText: data.responseData.translatedText,
      };
    }

    // API 제한 초과 시 대체 메시지
    if (data.responseStatus === 429) {
      return {
        success: false,
        translatedText: '',
        error: '번역 API 일일 한도 초과. 직접 입력해주세요.',
      };
    }

    throw new Error(data.responseDetails || 'Translation failed');
  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      translatedText: '',
      error: error instanceof Error ? error.message : '번역 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 여러 텍스트를 한번에 번역 (배열)
 * @param texts 번역할 한글 텍스트 배열
 * @returns 번역된 영어 텍스트 배열
 */
export async function translateArrayKoToEn(texts: string[]): Promise<string[]> {
  const results = await Promise.all(
    texts.map(async (text) => {
      if (!text.trim()) return '';
      const result = await translateKoToEn(text);
      return result.success ? result.translatedText : text;
    })
  );
  return results;
}

/**
 * 한글 텍스트인지 확인
 * @param text 확인할 텍스트
 * @returns 한글 포함 여부
 */
export function containsKorean(text: string): boolean {
  const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
  return koreanRegex.test(text);
}

