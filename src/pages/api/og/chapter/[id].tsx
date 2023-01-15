/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';
import { camelizeKeys } from 'humps';
import type { NextRequest } from 'next/server';
import type { PageConfig } from 'next/types';

import QuranTextLogo from '@/icons/quran-text-logo.svg';
import { ChapterResponse } from '@/types/ApiResponses';
import { makeChapterUrl } from '@/utils/apiPaths';
import {
  findLanguageIdByLocale,
  getLanguageDataById,
  isRTLLocale,
  toLocalizedNumber,
} from '@/utils/locale';
import { isValidChapterId } from '@/utils/validator';

export const config: PageConfig = {
  runtime: 'edge',
};

// for chapter 1-59
const oneUrl = new URL(
  '../../../../../public/fonts/quran/surah-names/surah_font.ttf',
  import.meta.url,
);

// for chapter 60-114
const twoUrl = new URL(
  '../../../../../public/fonts/quran/surah-names/surah_font_2.ttf',
  import.meta.url,
);

const getSurahNamesFont = async (chapterId: number) => {
  let fileName = oneUrl;
  if (chapterId > 59) fileName = twoUrl;

  const res = await fetch(fileName);
  const arrayBuffer = await res.arrayBuffer();

  return arrayBuffer;
};

const montserratFont = fetch(
  new URL('../../../../../public/fonts/lang/Montserrat/Montserrat-Thin.ttf', import.meta.url),
).then((res) => res.arrayBuffer());

// base64 encoded image
const bg = fetch(new URL('../../../../../public/bg.png', import.meta.url))
  .then((res) => res.arrayBuffer())
  .then((buffer) => Buffer.from(buffer).toString('base64'));

const json = (data: object, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: { 'Content-Type': 'application/json' },
  });
};

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// We use a special font for surah names (https://www.fontspace.com/quran-surah-svg2-font-f55995) which has a special character for each surah.
const chapterIdToSurahCharacter = (chapterId: number) => {
  // from 1-9 return the number
  if (chapterId < 10) return chapterId.toString();

  // from 10-33 return a letter from A to X lowercase
  if (chapterId >= 10 && chapterId <= 33) return letters[chapterId - 10].toLowerCase();

  // 34-59 return a letter from A to Z uppercase
  if (chapterId >= 34 && chapterId <= 59) return letters[chapterId - 34];

  // 60-85 return a letter from A to Z lowercase
  if (chapterId >= 60 && chapterId <= 85) return letters[chapterId - 60].toLowerCase();

  // 86-105 return a letter from A to Z uppercase
  if (chapterId >= 86 && chapterId <= 105) return letters[chapterId - 86];

  // 106-114 return a number from 1 to 9
  return (chapterId - 106 + 1).toString();
};

const fetchChapter = async (chapterIdOrSlug: string, language: string) => {
  const res = await fetch(makeChapterUrl(chapterIdOrSlug, language));
  const data = await res.json();
  return camelizeKeys(data) as ChapterResponse;
};

const unsupportedLanguages = new Set(['ar', 'ur']);
const prepareText = (t: string, locale: string) => {
  if (unsupportedLanguages.has(locale)) return t.split('').reverse().join(' ');
  return t;
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get('id');
  const lang = searchParams.get('lang') ?? 'en';

  const languageId = findLanguageIdByLocale(lang);

  if (!isValidChapterId(chapterId)) return json({ error: 'Invalid chapter id' }, 400);
  if (!languageId) return json({ error: 'Invalid language' }, 400);

  const languageData = getLanguageDataById(languageId);

  const [image, surahFontData, montserratFontData, { chapter }] = await Promise.all([
    bg,
    getSurahNamesFont(Number(chapterId)),
    montserratFont,
    fetchChapter(chapterId, languageData.code),
  ]);
  const src = `data:image/png;base64,${image}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // fontSize: 100,
          fontFamily: 'sans-serif',
          padding: '33px 46px',
          backgroundColor: '#FFFFFF',
          position: 'relative',
        }}
      >
        <img
          alt="BG"
          src={src}
          style={{
            opacity: 0.65,
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: '-1',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            // justifyContent: 'center',
            alignItems: 'center',
            marginTop: '-100px',
          }}
        >
          <div
            style={{
              fontFamily: '"Surah"',
              color: '#000000',
              fontSize: 350,
            }}
          >
            {chapterIdToSurahCharacter(Number(chapterId))}
          </div>

          <div
            style={{
              color: '#000000',
              fontSize: 40,
              fontWeight: 100,
              fontFamily: '"Montserrat"',
              display: 'flex',
            }}
            dir={isRTLLocale(lang) ? 'rtl' : 'ltr'}
          >
            Chapter {toLocalizedNumber(Number(chapterId), lang)}
            {lang !== 'ar' ? `: ${prepareText((chapter.translatedName as any).name, lang)}` : ''}
          </div>
        </div>
        <QuranTextLogo
          style={{
            fill: '#000000',
            width: 223,
            height: 40,
            position: 'absolute',
            bottom: 33,
            left: 46,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Surah',
          data: surahFontData,
          style: 'normal',
          // lang: 'ar-AR',
        },
        {
          name: 'Montserrat',
          data: montserratFontData,
          style: 'normal',
          weight: 100,
        },
      ],
    },
  );
}
