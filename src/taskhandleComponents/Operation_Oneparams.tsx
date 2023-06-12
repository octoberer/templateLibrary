import { Form, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import { getcomponentArgObj } from '../tools/genTypeObj';
import WrapperValidate from './wrapperValidate';
import { convertToSymbol } from './tool';
interface TwoparamsFouroperationsType {
    inputparams: string[];
    outputparams: string[];
    selectmethod: string;
    getHandleData: (data: any) => void;
}
export default function OneparamsOperations({ inputparams, outputparams, selectmethod, getHandleData }: TwoparamsFouroperationsType) {
    const [output, setOutput] = useState<any>();
    const [input1, setInput1] = useState<any>();
    const [input2, setInput2] = useState<any>();

    useEffect(() => {
        getHandleData({
            output: getcomponentArgObj({ paramsName: output, uiComponent: 'select', isFixedValue: false, value: undefined }),
            input: [
                getcomponentArgObj({ paramsName: input1, uiComponent: 'select', isFixedValue: false, value: undefined }),
                getcomponentArgObj({ paramsName: input2, isFixedValue: false, value: undefined, uiComponent: 'Input' }),
            ],
        });
    }, [output, input1, input2]);
    return (
        <>
            <WrapperValidate name={'output'}>
                <Select value={output} onChange={setOutput}>
                    {outputparams.map((item) => (
                        <Select.Option value={item}>{item}</Select.Option>
                    ))}
                </Select>
            </WrapperValidate>
            <div className="text-4xl">=</div>
            <WrapperValidate name={'input1'}>
                <Select  onChange={(value) => setInput1(value)}>
                    {inputparams.map((item) => (
                        <Select.Option value={item}>{item}</Select.Option>
                    ))}
                </Select>
            </WrapperValidate>
            <div className="text-2xl mx-1">{convertToSymbol(selectmethod)}</div>
            <WrapperValidate name={'input2'}>
                <Input onChange={(e) => setInput2(e.target.value)}></Input>
            </WrapperValidate>
        </>
    );
}
