import React, { Fragment } from 'react';
import styles from './TemplateUI.module.css';
import { Button } from 'antd';
export default function TemplateUI({ properties, loginflowInstance }) {
    let { templateId, briefName, graphData, inputArgs, outputArgs } = properties;
    inputArgs = [[{ label: 'q' }], [{ label: 'w' }]];
    outputArgs = [[{ label: 'mn' }]];
    briefName = '名字';
    return (
        <div className={styles.wrapper}>
            <div className={styles.inputarr}>
                {inputArgs.map((oneinputarr: any) => (
                    <div>
                        {oneinputarr.map((inputitem: any) => (
                            <div>{inputitem.label}</div>
                        ))}
                    </div>
                ))}
            </div>
            <div className={styles.content}>
                <div>{briefName}</div>
                <Button>展开</Button>
                <Button>编辑</Button>
            </div>
            <div className={styles.outputarr}>
                {outputArgs.map((oneoutputarr: any) => (
                    <div>
                        {oneoutputarr.map((outputitem: any) => (
                            <div>{outputitem.label}</div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
