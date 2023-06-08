import { Button, Form, Input, Select, Tag } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { basicMethods } from '../define';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TaskHandleComponent from '../taskhandleComponents/TaskHandleComponent';
import LogicFlow from '@logicflow/core';
import { Bus } from '../tools/Bus';
import styles from './TaskUI.module.css';
import { getBasicTaskId, getBasicTaskinstanceId, getTaskIOArg } from '../taskhandleComponents/toolfn';

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
    const Formbox = useRef<any>(null);
    const [selectmethod, setSelectmethod] = useState<any>('test');
    const [inputparams, setInputparams] = useState<{ name: string; doc?: string }[]>([]);
    const [outputparams, setOutputparams] = useState<{ name: string; doc?: string }[]>([]);
    const [editstatus, setEditstatus] = useState<'success' | 'processing' | 'error'>('processing');
    const [clickNode, setClickNode] = useState<any>(null);
    const [HandleData, setHandleData] = useState<any>({});
    const loginflowInstanceref = useRef(loginflowInstance);
    const onInputparamsChange = (event: InputEvent, index: number) => {
        debugger;
        if (!inputparams[index]) {
            inputparams[index] = { name: '' };
        }
        inputparams[index].name = event.target?.value;
        setInputparams([...inputparams]);
    };
    const onOutputparamsChange = (event: InputEvent, index: number) => {
        if (!outputparams[index]) {
            outputparams[index] = { name: '' };
        }
        outputparams[index].name = event.target?.value;
        setOutputparams([...outputparams]);
    };
    const removeItem = (type, index) => {
        if (type == 'input') {
            inputparams.splice(index, 1);
            setInputparams([...inputparams]);
        } else if (type == 'output') {
            outputparams.splice(index, 1);
            setOutputparams([...outputparams]);
        }
    };
    useEffect(() => {
        Formbox.current?.setFieldsValue({ input1: '', input2: '' });
    }, [inputparams]);
    useEffect(() => {
        Formbox.current?.setFieldsValue({ output: '' });
    }, [outputparams]);

    useEffect(() => {
        Bus.subscribe('ClickNodeDataUpdate', (data) => {
            setClickNode(data);
        });
    }, []);
    const onFinish = () => {
        setEditstatus('success');
        const Taskobj = {
            id: getBasicTaskId(selectmethod) + '',
            instanceId: getBasicTaskinstanceId(selectmethod) + '',
            args: HandleData,
            inputArgs: inputparams.map((inputparam) => getTaskIOArg({ param: inputparam.name, doc: inputparam.doc })),
            outputArgs: outputparams.map((outputparam) => getTaskIOArg({ param: outputparam.name, doc: '' })),
            handle: selectmethod,
        };
        loginflowInstanceref.current.setProperties(clickNode.id, Taskobj);
        setTimeout(() => {
            console.log(clickNode);
            console.log('getGraphData', loginflowInstanceref.current.getGraphData());
        });
    };
    const getHandleData = useCallback((data: any) => {
        setHandleData(data);
    }, []);
    useEffect(() => {
        loginflowInstanceref.current = loginflowInstance;
    }, [loginflowInstance]);

    const onFinishFailed = () => {
        setEditstatus('error');
    };
    const inputparamNames = useMemo(() => inputparams.map((item) => item.name), [inputparams]);
    const outputparamNames = useMemo(() => outputparams.map((item) => item.name), [outputparams]);
    return (
        <div className={styles.wrapper}>
            <Form name="basic" style={{ maxWidth: 600 }} onFinish={onFinish} onFinishFailed={onFinishFailed} ref={Formbox}>
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
                                    <MinusCircleOutlined
                                        className="dynamic-delete-button"
                                        onClick={() => {
                                            debugger;
                                            remove(field.name);
                                            removeItem('input', index);
                                        }}
                                    />
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
                                        <MinusCircleOutlined
                                            className="dynamic-delete-button"
                                            onClick={() => {
                                                remove(field.name);
                                                removeItem('output', index);
                                            }}
                                        />
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
                <Form.Item label="处理方法" name={'choosehandleMethod'} rules={[{ required: true, message: '请选择对应的处理方法' }]}>
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
                    inputparamNames={inputparamNames}
                    outputparamNames={outputparamNames}
                    getHandleData={getHandleData}
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
