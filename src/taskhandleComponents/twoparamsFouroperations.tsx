import { AutoComplete, Input, Select } from 'antd';
interface TwoparamsFouroperationsType {
    inputparams: string[];
    outputparams: string[];
    operation: string;
}
export default function TwoparamsFouroperations({ inputparams, outputparams, operation }: TwoparamsFouroperationsType) {
    const options=inputparams.map(item=>({value:item}))

    return (
        <div className="flex justify-around items-center">
            <Select style={{ width: '20%' }}>
                {outputparams.map((item) => (
                    <Select.Option value={item}>{item}</Select.Option>
                ))}
            </Select>
            <div className="text-4xl">=</div>
            <AutoComplete
                style={{ width: 200 }}
                options={options}
                placeholder="参数"
                filterOption={(inputValue, option) => option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
            />
            <div className="text-2xl">{operation}</div>
            <AutoComplete
                style={{ width: 200 }}
                options={options}
                placeholder="参数"
                filterOption={(inputValue, option) => option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
            />
        </div>
    );
}
