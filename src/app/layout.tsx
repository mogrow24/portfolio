import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { LocaleProvider } from '@/context/LocaleContext';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-jihee-yun.vercel.app'),
  title: '윤지희 | PM · 서비스 콘텐츠 기획자 포트폴리오',
  description: '사용자 경험을 중심으로 생각하고, 데이터 기반의 의사결정으로 서비스를 성장시키는 PM · 서비스 콘텐츠 기획자 윤지희의 포트폴리오입니다.',
  keywords: ['PM', '서비스 기획', '콘텐츠 기획', 'UX', '포트폴리오', '윤지희'],
  authors: [{ name: '윤지희' }],
  openGraph: {
    title: '윤지희 | PM · 서비스 콘텐츠 기획자 포트폴리오',
    description: '사용자 경험을 중심으로 생각하고, 데이터 기반의 의사결정으로 서비스를 성장시키는 기획자',
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: '윤지희 포트폴리오',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '윤지희 | PM · 서비스 콘텐츠 기획자 포트폴리오',
    description: '사용자 경험을 중심으로 생각하고, 데이터 기반의 의사결정으로 서비스를 성장시키는 기획자',
    images: ['/opengraph-image'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
