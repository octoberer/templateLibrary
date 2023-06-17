import { Button } from 'antd/es/radio';
import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import { Avatar, Card, Drawer, Modal } from 'antd';
import { EditOutlined, SettingOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import Meta from 'antd/es/card/Meta';
import { Bus } from '../tools/Bus';
import TemplateForm from './templateForm';
import {  generateGraph, graphData2taklist } from '../tools/transformData';
import { template } from '../define';
import { getAllTemplatedata } from '../tools/transformData/taskList2Graph';

export default function Control({ LFinstanceobj }: { LFinstanceobj: LogicFlow | null }) {
    const [selectNodeData, setSelectNodeData] = useState<any>(null);
    const [allTemplatedata, setAllTemplatedata] = useState<any>([]);
    const [draweropen, setDrawerOpen] = useState(false);
    const [modalopen, setModalopen] = useState(false);
    const TemplateMessage = useRef<any>({});
    useEffect(() => {
        Bus.subscribe('selectNodeDataUpdate', (data) => {
            console.log('selectNodeDataUpdate', data);
            setSelectNodeData(data);
        });
    }, []);
    const saveAsTemplate = () => {
        // 自定义模板信息
        setModalopen(true);
    };
    const importTemplate = () => {
        // allTemplatedata;
        setDrawerOpen(true);
        setAllTemplatedata(getAllTemplatedata());
    };
    const getTemplateMessage = (data) => {
        TemplateMessage.current = data;
    };
    const handleOk = () => {
        setModalopen(false);
        const getGraphData = LFinstanceobj?.getGraphData();
        const NodeData = selectNodeData || getGraphData;
        graphData2taklist(NodeData, { ...TemplateMessage.current })
        setSelectNodeData([]);
    };

    const handleCancel = () => {
        setModalopen(false);
    };
    function OnCardImport(item: template) {
        setDrawerOpen(false);
        // let { newnodes } = old2newgraphRenderData(item.graphRenderData,LFinstanceobj);
        if (!LFinstanceobj) return;
        // generateTemplateGraph({templateobj:item,LFinstance:LFinstanceobj})
        debugger
        generateGraph(item, LFinstanceobj);
        LFinstanceobj.render(LFinstanceobj?.getGraphData());
    }

    return (
        <div>
            <Button onClick={()=>{
                handleOk()
            }}>调式</Button>
            <Button
                onClick={() => {
                    console.log(LFinstanceobj?.getGraphRawData());
                }}
            >
                存储所有为执行模板
            </Button>
            <Button onClick={saveAsTemplate}>存储选区为执行模板</Button>
            <Button
                onClick={() => {
                    importTemplate();
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

            <Drawer width={'80vw'} title="选择模板" placement="right" onClose={() => setDrawerOpen(false)} open={draweropen}>
                {allTemplatedata.map((item: any) => (
                    <Card
                        style={{ width: 300 }}
                        cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                        actions={[
                            <SettingOutlined key="setting" />,
                            <EditOutlined key="edit" />,
                            <Button
                                onClick={() => {
                                    OnCardImport(item);
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
            <Modal title="定义该模板基础信息" open={modalopen} onOk={handleOk} onCancel={handleCancel} okText="确认" cancelText="取消">
                <TemplateForm getMessage={getTemplateMessage}></TemplateForm>
            </Modal>
        </div>
    );
}
