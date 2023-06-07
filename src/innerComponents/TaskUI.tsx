import { Button, Form, Input, Select, Tag } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { basicMethods } from '../define';
import { useEffect, useRef, useState } from 'react';
import TaskHandleComponent from '../taskhandleComponents/TaskHandleComponent';
import { currentBasicTask } from '../data';
import LogicFlow from '@logicflow/core';
import { Bus } from '../tools/Bus';

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
    },
};

const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
    },
};
export default function TaskUI({ loginflowInstance }: { loginflowInstance: LogicFlow }) {
    const [selectmethod, setSelectmethod] = useState();
    const [inputparams, setInputparams] = useState<string[]>([]);
    const [outputparams, setOutputparams] = useState<string[]>([]);
    const [editstatus, setEditstatus] = useState<'success' | 'processing' | 'error'>('processing');
    const [clickNode, setClickNode] = useState<any>(null);
    const loginflowInstanceref=useRef(loginflowInstance)
    const onInputparamsChange = (event: InputEvent, index: number) => {
        inputparams[index] = event.target?.value;
        setInputparams([...inputparams]);
    };
    const onOutputparamsChange = (event: InputEvent, index: number) => {
        outputparams[index] = event.target?.value;
        setOutputparams([...outputparams]);
    };
    useEffect(() => {
        Bus.subscribe('ClickNodeDataUpdate', (data) => {
            setClickNode(data);
        });
    });
    const onFinish = () => {
        setEditstatus('success');
        const Taskobj = {
            inputArgs: inputparams,
            outputArgs: outputparams,
            inputTask: null,
            outputTask: null,
            handle: selectmethod,
        };
        debugger
        loginflowInstanceref.current.setProperties(clickNode.id, Taskobj);
        setTimeout(()=>{
            console.log(clickNode)
            console.log('getGraphData',loginflowInstanceref.current.getGraphData())
        })
        // supplementToBasicTask(Taskobj);
    };
    useEffect(()=>{
        loginflowInstanceref.current=loginflowInstance
    },[loginflowInstance])

    const onFinishFailed = () => {
        setEditstatus('error');
    };
    return (
        <div style={{ background: 'white', height: '100%', border: '1px solid black', padding: '10px' }}>
            <Form name="basic" style={{ maxWidth: 600 }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                <Form.List
                    name="inputArgs"
                    rules={[
                        {
                            validator: async (_, names) => {
                                if (!names) {
                                    return Promise.reject(new Error('至少一个输入参数'));
                                }
                            },
                        },
                    ]}
                >
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map((field, index) => (
                                <Form.Item
                                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                                    label={index === 0 ? '输入参数' : ''}
                                    required={false}
                                    key={field.key}
                                >
                                    <Form.Item
                                        {...field}
                                        validateTrigger={['onChange', 'onBlur']}
                                        rules={[
                                            {
                                                required: true,
                                                whitespace: true,
                                                message: '请输入该参数的名字，或者删除该参数',
                                            },
                                        ]}
                                        noStyle
                                    >
                                        <Input
                                            placeholder="参数"
                                            style={{ width: '60%' }}
                                            onChange={(e) => onInputparamsChange(e, index)}
                                        />
                                    </Form.Item>
                                    <MinusCircleOutlined className="dynamic-delete-button" onClick={() => remove(field.name)} />
                                </Form.Item>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} style={{ width: '60%' }} icon={<PlusOutlined />}>
                                    增加输入参数
                                </Button>
                                <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                <Form.List
                    name="outputArgs"
                    rules={[
                        {
                            validator: async (_, names) => {
                                if (!names) {
                                    return Promise.reject(new Error('至少一个输出参数'));
                                }
                            },
                        },
                    ]}
                >
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map((field, index) => (
                                <Form.Item
                                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                                    label={index === 0 ? '输出参数' : ''}
                                    required={false}
                                    key={field.key}
                                >
                                    <Form.Item
                                        {...field}
                                        validateTrigger={['onChange', 'onBlur']}
                                        rules={[
                                            {
                                                required: true,
                                                whitespace: true,
                                                message: '请输入该参数的名字，或者删除该参数',
                                            },
                                        ]}
                                        noStyle
                                    >
                                        <Input
                                            placeholder="参数"
                                            style={{ width: '60%' }}
                                            onChange={(e) => onOutputparamsChange(e, index)}
                                        />
                                    </Form.Item>
                                    {fields.length > 1 ? (
                                        <MinusCircleOutlined className="dynamic-delete-button" onClick={() => remove(field.name)} />
                                    ) : null}
                                </Form.Item>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} style={{ width: '60%' }} icon={<PlusOutlined />}>
                                    增加输出参数
                                </Button>
                                <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                <Form.Item label="处理方法" name="handlemethod" rules={[{ required: true, message: '请选择对应的处理方法' }]}>
                    <Select
                        onSelect={(e) => {
                            setSelectmethod(e);
                        }}
                    >
                        {basicMethods.map((item) => (
                            <Select.Option value={item.name}>{item.label}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <TaskHandleComponent
                    selectmethod={selectmethod}
                    inputparams={inputparams}
                    outputparams={outputparams}
                ></TaskHandleComponent>
                <Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <Tag color={editstatus}>{editstatus}</Tag>
                        <Button htmlType="submit">提交</Button>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
}
