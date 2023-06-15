import React, { useMemo } from 'react';
import styles from './FinishedTaskUI.module.css';
import { Descriptions, Tag } from 'antd';
import { convertToSymbol } from '../taskhandleComponents/tool';

export default function FinishedTaskUI({ properties }: { properties: { [key: string]: any } }) {
    let { inputArgs, outputArgs, outputhandlArg, inputhandlArg, handle } = properties;

    console.log('inputhandlArg', inputhandlArg);
    const inputArgLabels: any[] = useMemo(() => inputArgs.map((item) => item.label), [inputArgs]);
    const outputArgLabels: any[] = useMemo(() => outputArgs.map((item) => item.label), [outputArgs]);

    return (
        <div className={styles.wrapper}>
            <Descriptions title="任务细节" bordered column={1}>
                <Descriptions.Item label="输入参数">
                    {inputArgLabels.map((item) => (
                        <Tag>{item}</Tag>
                    ))}
                </Descriptions.Item>
                <Descriptions.Item label="操作方式">
                    {Array.isArray(inputhandlArg[0])
                        ? `${convertToSymbol(handle)} ${inputhandlArg[0].map(item=>item.label).join(',')}`
                        : `${outputhandlArg.label}=${inputhandlArg[0].label} ${convertToSymbol(handle)} ${
                              inputhandlArg[1].label || inputhandlArg[1].value
                          }`}
                </Descriptions.Item>
                <Descriptions.Item label="输出参数">
                    {outputArgLabels.map((item) => (
                        <Tag>{item}</Tag>
                    ))}
                </Descriptions.Item>
            </Descriptions>
        </div>
    );
}
