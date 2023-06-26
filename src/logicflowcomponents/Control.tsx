import { Button } from 'antd/es/radio';
import LogicFlow from '@logicflow/core';
import { Avatar, Card, Drawer, Modal } from 'antd';
import { EditOutlined, SettingOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import Meta from 'antd/es/card/Meta';
import TemplateForm from './templateForm';
import {  templateDefine } from '../define';
import { graphdata2tasklist } from '../core/graphdata2tasklist';
import { getTaskByKey } from '../tools/genTypeObj';
import { getAllTemplatedata } from '../core/tools';
import { tasklist2graph } from '../core/tasklist2graph';

export default function Control({ LFinstanceobj }: { LFinstanceobj: LogicFlow | null }) {
    const [allTemplatedata, setAllTemplatedata] = useState<any>([]);
    const [templateListDrawerOpen, setTemplateListDrawerOpen] = useState(false);
    const [templateInformationModalopen, setTemplateInformationModalopen] = useState(false);
    const TemplateMessage = useRef<any>({});
    const templateOperation = useRef<'add' | 'update'>('add');
    const [currentTemplate, setCurrentTemplate] = useState<templateDefine | null>(null);
    const currentTemplateRef = useRef<templateDefine | null>(null);
    const saveAsTemplate = () => {};
    const getTemplateMessage = (data) => {
        TemplateMessage.current = data;
    };
    const handleOk = () => {
        setTemplateInformationModalopen(false);
        if (templateOperation.current == 'add') {
            const getGraphData = LFinstanceobj?.getGraphData();
            graphdata2tasklist(getGraphData, { ...TemplateMessage.current });
        } else if (templateOperation.current == 'update') {
            if (currentTemplateRef.current) {
                let temptemplate = currentTemplateRef.current;
                let template = getTaskByKey(temptemplate.id);
                template = { ...template, ...TemplateMessage.current };
            }
        }
    };
    useEffect(() => {
        currentTemplateRef.current = currentTemplate;
        if (!LFinstanceobj) return;
        if (currentTemplate) {
            tasklist2graph(currentTemplate, LFinstanceobj);
        }
        LFinstanceobj.render(LFinstanceobj?.getGraphData());
    }, [currentTemplate]);

    return (
        <div>
            <Button
                onClick={() => {
                    setTemplateInformationModalopen(true);
                    templateOperation.current = 'add';
                }}
            >
                存储为执行模板
            </Button>
            <Button
                onClick={() => {
                    setTemplateInformationModalopen(true);
                    templateOperation.current = 'update';
                }}
            >
                修改模板信息
            </Button>
            <Button
                onClick={() => {
                    setTemplateListDrawerOpen(true);
                    setAllTemplatedata(getAllTemplatedata());
                }}
            >
                引入模板
            </Button>

            <Button
                onClick={() => {
                    console.log(LFinstanceobj?.getGraphRawData());
                }}
            >
                查看图数据
            </Button>

            <Drawer
                width={'80vw'}
                title="选择模板"
                placement="right"
                onClose={() => setTemplateListDrawerOpen(false)}
                open={templateListDrawerOpen}
            >
                {allTemplatedata.map((item: any) => (
                    <Card
                        style={{ width: 300 }}
                        cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                        actions={[
                            <SettingOutlined key="setting" />,
                            <EditOutlined key="edit" />,
                            <Button
                                onClick={() => {
                                    setTemplateListDrawerOpen(false);
                                    setCurrentTemplate(item);
                                }}
                            >
                                导入
                            </Button>,
                        ]}
                    >
                        <Meta
                            avatar={<Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel" />}
                            title={item.briefName}
                            description={item.doc}
                        />
                    </Card>
                ))}
            </Drawer>
            <Modal
                title={'定义该模板基础信息'}
                open={templateInformationModalopen}
                onOk={handleOk}
                onCancel={() => {
                    setTemplateInformationModalopen(false);
                }}
                okText="确认"
                cancelText="取消"
            >
                <TemplateForm getMessage={getTemplateMessage}></TemplateForm>
            </Modal>
            
        </div>
    );
}
