import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';

const TemplateForm = (props: { getMessage: ({briefName, doc}:{briefName: string, doc: string}) => void }) => {
    const { getMessage } = props;
    const [templateMessage, setTemplateMessage] = useState({ briefName: '', doc: '' });
    useEffect(() => {
        getMessage(templateMessage);
    }, [templateMessage]);
    return (
        <Form>
            <Form.Item name="name" label="模板名字" rules={[{ required: true }]}>
                <Input onChange={(e) => setTemplateMessage({ ...templateMessage, briefName: e.target.value })} />
            </Form.Item>
            <Form.Item name="doc" label="模板介绍" rules={[{ required: true }]}>
                <TextArea onChange={(e) => setTemplateMessage({ ...templateMessage, doc: e.target.value })} />
            </Form.Item>
        </Form>
    );
};

export default TemplateForm;
