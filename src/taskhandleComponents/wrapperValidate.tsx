import { Form } from 'antd';

export default function WrapperValidate({ name, children, width }: { name: string; children: any; width?: any }) {
    return (
        <Form.Item style={width ? { width } : { width: '30%' }} name={name} rules={[{ required: true, message: '请补充该项' }]}>
            {children}
        </Form.Item>
    );
}
