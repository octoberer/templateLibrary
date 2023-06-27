// 已弃用
import React, { useState } from 'react';
import type { RadioChangeEvent } from 'antd';
import { Radio } from 'antd';
import styles from './ProcessControlUI.module.css';
export default function ProcessControlUI() {
    const [value, setValue] = useState(1);

    const onChange = (e: RadioChangeEvent) => {
        console.log('radio checked', e.target.value);
        setValue(e.target.value);
    };
    return (
        <div className={styles.wrapper}>
            <div className={styles.innerwrapper}>
                <Radio.Group onChange={onChange} value={value}>
                    <Radio value={1}>wait any</Radio>
                    <Radio value={2}>wait all</Radio>
                </Radio.Group>
            </div>
        </div>
    );
}
