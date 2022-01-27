import React, { useMemo, useRef } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import { QURAN_READER_OBSERVER_ID } from '../QuranReader/observer';

import isCenterAlignedPage from './pageUtils';
import VerseHighlighter from './VerseHighlighter';
import styles from './VerseText.module.scss';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import useIntersectionObserver from 'src/hooks/useObserveElement';
import { selectLoadedFontFaces } from 'src/redux/slices/QuranReader/font-faces';
import { selectWordByWordByWordPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { isQCFFont } from 'src/utils/fontFaceHelper';
import { getFirstWordOfSurah } from 'src/utils/verse';
import { QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

type VerseTextProps = {
  words: Word[];
  isReadingMode?: boolean;
  isHighlighted?: boolean;
  shouldShowH1ForSEO?: boolean;
};

const VerseText = ({
  words,
  isReadingMode = false,
  isHighlighted,
  shouldShowH1ForSEO = false,
}: VerseTextProps) => {
  const textRef = useRef(null);
  const loadedFonts = useSelector(selectLoadedFontFaces);
  useIntersectionObserver(textRef, QURAN_READER_OBSERVER_ID);
  const { quranFont, quranTextFontScale } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  ) as QuranReaderStyles;
  const [firstWord] = words;
  const isFontLoaded = useMemo(() => {
    if (!isQCFFont(quranFont)) {
      return true;
    }
    return loadedFonts.includes(`p${firstWord.pageNumber}-${quranFont.replace('code_', '')}`);
  }, [firstWord.pageNumber, loadedFonts, quranFont]);
  const { lineNumber, pageNumber, location, verseKey, hizbNumber } = firstWord;
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordByWordPreferences,
    shallowEqual,
  );
  const centerAlignPage = useMemo(
    () => isCenterAlignedPage(pageNumber, lineNumber, quranFont),
    [pageNumber, lineNumber, quranFont],
  );
  const firstWordData = getFirstWordOfSurah(location);
  const isTajweedFont = quranFont === QuranFont.Tajweed;
  const isBigTextLayout =
    (isReadingMode &&
      (quranTextFontScale > 3 || showWordByWordTranslation || showWordByWordTransliteration)) ||
    isTajweedFont;

  const { chapterId, isFirstWordOfSurah } = firstWordData;

  const VerseTextContainer = shouldShowH1ForSEO ? 'h1' : 'div';
  return (
    <>
      {isReadingMode && isFirstWordOfSurah && (
        <div className={styles.chapterHeaderContainer}>
          <ChapterHeader chapterId={chapterId} pageNumber={pageNumber} hizbNumber={hizbNumber} />
        </div>
      )}
      <VerseTextContainer
        ref={textRef}
        data-verse-key={verseKey}
        data-page={pageNumber}
        data-chapter-id={chapterId}
        data-hizb={hizbNumber}
        className={classNames(styles.verseTextContainer, {
          [styles.largeQuranTextLayoutContainer]: isBigTextLayout,
          [styles.highlighted]: isHighlighted,
          [styles[`${quranFont}-font-size-${quranTextFontScale}`]]: !isTajweedFont,
          [styles.tafsirOrTranslationMode]: !isReadingMode,
        })}
      >
        <div
          className={classNames(styles.verseText, {
            [styles.verseTextWrap]: !isReadingMode,
            [styles.largeQuranTextLayout]: isBigTextLayout,
            [styles.verseTextCenterAlign]: isReadingMode && centerAlignPage,
            [styles.verseTextSpaceBetween]: isReadingMode && !centerAlignPage,
          })}
        >
          <VerseHighlighter
            words={words}
            font={quranFont}
            isFontLoaded={isFontLoaded}
            textRef={textRef}
          />
        </div>
      </VerseTextContainer>
    </>
  );
};

export default React.memo(VerseText);
