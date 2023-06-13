import { AutoComplete, Input, Select } from 'antd';
import React, { useEffect, Fragment, useState } from 'react';
import WrapperValidate from './wrapperValidate';
import { getcomponentArgObj } from '../tools/genTypeObj';
import { convertToSymbol } from './tool';

interface MultipleParamsOperationType {
    inputparams: string[];
    outputparams: string[];
    selectmethod: string;
    getHandleData: (data: any) => void;
}
export default function MultipleParamsOperation({ inputparams, outputparams, selectmethod, getHandleData }: MultipleParamsOperationType) {
    // debugger
    const options = inputparams.map((item) => ({ value: item }));
    const [output, setOutput] = useState<any>();
    const [input, setInput] = useState<any[]>([]);
    useEffect(() => {
        getHandleData({
            output: getcomponentArgObj({ paramsName: output, uiComponent: 'select', isFixedValue: false, value: undefined }),
            input: [
                input.map((item) =>
                    getcomponentArgObj({ paramsName: item, uiComponent: 'selectmultiple', isFixedValue: false, value: undefined })
                ),
            ],
        });
    }, [output, input]);
    return (
        <Fragment>
            <WrapperValidate name={'multipleoutput'}>
                <Select value={output} onChange={setOutput}>
                    {outputparams.map((item) => (
                        <Select.Option value={item}>{item}</Select.Option>
                    ))}
                </Select>
            </WrapperValidate>
            <div className="text-2xl">{'＝'}</div>
            <div className="text-2xl mx-1">{convertToSymbol(selectmethod)}</div>
            <WrapperValidate name={'multipleinput'} width={'60%'}>
                <Select mode="multiple" allowClear placeholder="请选择操作的项" onChange={setInput} options={options} />
            </WrapperValidate>
        </Fragment>
    );
}
