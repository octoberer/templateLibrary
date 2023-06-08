import { Form, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import { convertToSymbol, getcomponentArgObj } from './toolfn';
interface TwoparamsFouroperationsType {
    inputparams: string[];
    outputparams: string[];
    selectmethod: string;
    getHandleData: (data: any) => void;
}
export default function OneparamsFouroperations({ inputparams, outputparams, selectmethod, getHandleData }: TwoparamsFouroperationsType) {
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
            <Select style={{ width: '20%' }} value={output} onChange={setOutput}>
                {outputparams.map((item) => (
                    <Select.Option value={item}>{item}</Select.Option>
                ))}
            </Select>
            <div className="text-4xl">=</div>
            <Select style={{ width: '20%' }} onChange={(value) => setInput1(value)}>
                {inputparams.map((item) => (
                    <Select.Option value={item}>{item}</Select.Option>
                ))}
            </Select>
            <div className="text-2xl">{convertToSymbol(selectmethod)}</div>
            <Input onChange={(e) => setInput2(e.target.value)}></Input>
        </>
    );
}
