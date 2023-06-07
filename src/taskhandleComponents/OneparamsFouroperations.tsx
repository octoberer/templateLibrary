import { Input, Select } from 'antd';
interface TwoparamsFouroperationsType {
    inputparams: string[];
    outputparams: string[];
    operation: string;
}
export default function OneparamsFouroperations({ inputparams, outputparams, operation }: TwoparamsFouroperationsType) {
    return (
        <div className="flex justify-around items-center">
            <Select style={{ width: '20%' }}>
                {outputparams.map((item) => (
                    <Select.Option value={item}>{item}</Select.Option>
                ))}
            </Select>
            <div className="text-4xl">=</div>
            <Select style={{ width: '20%' }}>
                {inputparams.map((item) => (
                    <Select.Option value={item}>{item}</Select.Option>
                ))}
            </Select>
            <div className="text-2xl">{operation}</div>
            <Input></Input>
        </div>
    );
}
