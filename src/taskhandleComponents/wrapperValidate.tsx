import { Form } from 'antd';
import React from 'react';

export default function WrapperValidate({ name, children }) {
    return (
        <Form.Item style={{width:'30%'}} name={name} rules={[{ required: true, message: '请补充该项' }]}>
            {children}
        </Form.Item>
    );
}
