import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import PlayIcon from '../../../../public/icons/play-arrow.svg';

import styles from './VerseHighlighterAction.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import Counter from 'src/components/dls/Counter/Counter';
import Popover, { ContentAlign, ContentSide } from 'src/components/dls/Popover';

const VerseHighlighterAction = ({ children }) => {
  const { t } = useTranslation('common');
  const [repeatCount, setRepeatCount] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <Popover
      trigger={children}
      contentSide={ContentSide.BOTTOM}
      contentAlign={ContentAlign.CENTER}
      open
      defaultStyling={false}
      tip
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseUp={(e) => e.stopPropagation()}>
        {open ? (
          <>
            <h1 className={styles.title}>{t('audio.player.repeat-settings')}</h1>
            <div className={styles.inputGroup}>
              <label>Repeat count</label>
              <div>
                <Counter
                  count={repeatCount}
                  onIncrement={() => setRepeatCount((c) => c + 1)}
                  onDecrement={() => setRepeatCount((c) => c - 1)}
                />
                <span>{t('audio.player.times')}</span>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Pause between</label>
              <div>
                <Counter
                  count={pauseCount}
                  onIncrement={() => setPauseCount((c) => c + 1)}
                  onDecrement={() => setPauseCount((c) => (c > 0 ? c - 1 : c))}
                />
                <span>seconds</span>
              </div>
            </div>
            <Button
              prefix={<PlayIcon />}
              variant={ButtonVariant.Ghost}
              type={ButtonType.Success}
              size={ButtonSize.Small}
              shouldFlipOnRTL={false}
            >
              Play this part
            </Button>
          </>
        ) : (
          <Button
            variant={ButtonVariant.Ghost}
            type={ButtonType.Success}
            size={ButtonSize.Small}
            prefix={<PlayIcon />}
            onClick={() => setOpen(true)}
            shouldFlipOnRTL={false}
          >
            {t('audio.play-segment')}
          </Button>
        )}
      </div>
    </Popover>
  );
};

export default VerseHighlighterAction;
