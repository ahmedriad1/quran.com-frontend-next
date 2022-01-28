import { useEffect, useState } from 'react';

import classNames from 'classnames';

import QuranWord from '../../dls/QuranWord/QuranWord';

import styles from './VerseHighlighter.module.scss';
import VerseHighlighterAction from './VerseHighlighterAction';

import { QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

type Props = {
  words: Word[];
  font: QuranFont;
  isFontLoaded: boolean;
  textRef: React.RefObject<HTMLDivElement>;
};

type HighlightState = {
  start: number;
  end: number;
};

const VerseHighlighter = ({ words, font, isFontLoaded, textRef }: Props) => {
  const [highlight, setHighlight] = useState<HighlightState>(null);

  useEffect(() => {
    const el = textRef.current;
    const close = () => setHighlight(null);

    const handle = (): void => {
      const selection = window.getSelection();

      if (!selection.containsNode(el, true) || selection.isCollapsed) {
        close();
        return;
      }

      const firstLocation = (
        selection.anchorNode.parentElement.closest('div[role=button]') as HTMLElement
      )?.dataset?.wordLocation;
      const lastLocation = (
        selection.focusNode.parentElement.closest('div[role=button]') as HTMLElement
      )?.dataset?.wordLocation;

      if (!firstLocation || !lastLocation) {
        close();
        return;
      }

      const start = Number(firstLocation.split(':')[2]);
      const end = Number(lastLocation.split(':')[2]);

      let data = { start, end };
      if (start > end) data = { start: end, end: start };

      setHighlight(data);
    };

    const events = ['mouseup', 'touchend', 'touchcancel'];
    events.forEach((event) => document.addEventListener(event, handle));

    return () => {
      events.forEach((event) => document.removeEventListener(event, handle));
    };
  }, [textRef]);

  return (
    <>
      {words?.map((word) => (
        <div
          className={classNames(styles.container, {
            [styles.highlighted]:
              highlight && word.position >= highlight.start && word.position <= highlight.end,
          })}
          key={word.location}
        >
          {/* {highlight && highlight.start === word.position ? <div className={styles.start} onDragStart={e => e.} /> : null} */}
          {highlight && highlight.start === word.position ? (
            <VerseHighlighterAction>
              <QuranWord word={word} font={font} isFontLoaded={isFontLoaded} />
            </VerseHighlighterAction>
          ) : (
            <QuranWord word={word} font={font} isFontLoaded={isFontLoaded} />
          )}
          {/* {highlight && highlight.end === word.position ? <div className={styles.end} /> : null} */}
        </div>
      ))}
    </>
  );
};

export default VerseHighlighter;
