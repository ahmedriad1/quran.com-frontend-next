import { ButtonHTMLAttributes } from 'react';

import useTranslation from 'next-translate/useTranslation';

import PlayIcon from '../../../../public/icons/play-arrow.svg';

import Button, { ButtonSize, ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import Popover, { ContentAlign, ContentSide } from 'src/components/dls/Popover';

const VerseHighlighterAction = ({ children }) => {
  const { t } = useTranslation('common');

  return (
    <Popover
      trigger={children}
      contentSide={ContentSide.BOTTOM}
      contentAlign={ContentAlign.CENTER}
      open
      defaultStyling={false}
      tip
    >
      <button onMouseUp={(e) => e.stopPropagation()}>{t('audio.play-segment')}</button>
      {/* <Button
          variant={ButtonVariant.Ghost}
          type={ButtonType.Success}
          size={ButtonSize.Small}
          prefix={<PlayIcon />}
          
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          shouldFlipOnRTL={false}
        >
          
        </Button> */}
    </Popover>
  );
};

export default VerseHighlighterAction;
