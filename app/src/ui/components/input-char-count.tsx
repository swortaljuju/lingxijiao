import * as React from 'react';
import styles from './input-char-count.module.scss';
import i18n from '../i18n/config';

interface Props {
    charCount: number;
    charLimit: number;
}

export function InputCharCount(props: Props) {
    return <span className={styles[props.charCount > props.charLimit ? 'limit-exceeded' : 'limit-under']}>
        {i18n.t('charCount', {count: props.charCount})}
    </span>;
}
