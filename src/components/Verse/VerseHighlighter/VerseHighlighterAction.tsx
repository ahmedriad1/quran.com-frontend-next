import useTranslation from 'next-translate/useTranslation';

import PlayIcon from '../../../../public/icons/play-arrow.svg';

import styles from './VerseHighlighterAction.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';

const VerseHighlighterAction = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.dialog}>
      <Button
        variant={ButtonVariant.Ghost}
        type={ButtonType.Success}
        size={ButtonSize.Small}
        prefix={<PlayIcon />}
        // onClick={() => {
        //   void
        // }}
        shouldFlipOnRTL={false}
      >
        {t('audio.play-segment')}
      </Button>
    </div>
  );
};

export default VerseHighlighterAction;
