import { AutoComplete, Input, Select } from 'antd';
import React, { useEffect, Fragment, useState } from 'react';
import WrapperValidate from './wrapperValidate';
import { convertToSymbol,getcomponentArgObj } from './toolfn';

interface TwoparamsFouroperationsType {
    inputparams: string[];
    outputparams: string[];
    selectmethod: string;
    getHandleData: (data: any) => void;
}
export default function TwoparamsFouroperations({ inputparams, outputparams, selectmethod, getHandleData }: TwoparamsFouroperationsType) {
    const options = inputparams.map((item) => ({ value: item }));
    const [output, setOutput] = useState<any>();
    const [input1, setInput1] = useState<any>();
    const [input2, setInput2] = useState<any>();

    useEffect(() => {
        let input2obj;
        if (inputparams.indexOf(input2) > -1) {
            input2obj = { paramsName: undefined, isFixedValue: true, value: input2 };
        } else {
            input2obj = { paramsName: input2, isFixedValue: false, value: undefined };
        }
        getHandleData({
            output:getcomponentArgObj({paramsName: output, uiComponent: 'select', isFixedValue: false, value: undefined }),
            input: [
                getcomponentArgObj({ paramsName: input1, uiComponent: 'select', isFixedValue: false, value: undefined }),
                getcomponentArgObj({ ...input2obj, uiComponent: 'AutoComplete' }),
            ],
        });
    }, [output, input1, input2]);
    return (
        <Fragment>
            <WrapperValidate name={'output'}>
                <Select value={output} onChange={setOutput}>
                    {outputparams.map((item) => (
                        <Select.Option value={item}>{item}</Select.Option>
                    ))}
                </Select>
            </WrapperValidate>
            <div className="text-4xl">=</div>
            <WrapperValidate name={'input1'}>
                <Select onSelect={setInput1}>
                    {inputparams.map((item) => (
                        <Select.Option value={item}>{item}</Select.Option>
                    ))}
                </Select>
            </WrapperValidate>
            <div className="text-2xl">{convertToSymbol(selectmethod)}</div>
            <WrapperValidate name={'input2'}>
                <AutoComplete
                    options={options}
                    placeholder="参数"
                    filterOption={(inputValue, option) => option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                    onChange={setInput2}
                />
            </WrapperValidate>
        </Fragment>
    );
}
