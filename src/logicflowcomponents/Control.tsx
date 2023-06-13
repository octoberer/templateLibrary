import { Button } from 'antd/es/radio';
import { addTemplatedata, getAllTemplatedata } from '../tools/data';
import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import { Avatar, Card, Drawer, Modal } from 'antd';
import { EditOutlined, SettingOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import Meta from 'antd/es/card/Meta';
import { Bus } from '../tools/Bus';
import TemplateForm from './templateForm';

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
        addTemplatedata(NodeData, { ...TemplateMessage.current });
    };

    const handleCancel = () => {
        setModalopen(false);
    };
    function OnCardImport(item: { [any: string]: any }) {
        setDrawerOpen(false);
        // let { newnodes } = old2newgraphData(item.renderNodeData);
        debugger
        let { newnodes } = old2newgraphData(LFinstanceobj?.getGraphData());

        const newnodeIds = newnodes.map((item) => item.id);
        console.log('newnodeIds', newnodeIds);
        console.log('getGraphData', LFinstanceobj?.getGraphData());
        const groupElem = {
            id: `group${item.id}_${item.instanceId}`,
            type: 'templateGroup',
            x: 300,
            y: 300,
            children: newnodeIds,
            properties: {
                templateId: `${item.id}_${item.instanceId}`,
                doc: item.doc,
                briefName: item.briefName,
                renderNodeData: item.re,
                handle: item.handle,
                inputArgs: item.inputArgs,
                outputArgs: item.outputArgs,
            },
        };
        LFinstanceobj?.addNode(groupElem);
        LFinstanceobj?.render(LFinstanceobj?.getGraphData());
    }
    const old2newgraphData = (oldgraphData: { nodes: any; edges: any }) => {
        let { nodes, edges } = oldgraphData;
        const newnodes = [];
        let groups = [];
        for (let node of nodes) {
            if (node.children) {
                groups.push(node);
            }
            if (!node.children) {
                const newnode: BaseNodeModel | undefined = LFinstanceobj?.addNode({
                    type: node.type,
                    x: node.x,
                    y: node.y,
                    properties: node.properties,
                });
                newnodes.push(newnode);
                for (let edge of edges) {
                    if (edge.targetNodeId === node.id) {
                        edge.targetNodeId = newnode?.id || '';
                    }
                    if (edge.sourceNodeId === node.id) {
                        edge.sourceNodeId = newnode?.id || '';
                    }
                }
            }
        }
        for (let edge of edges) {
            LFinstanceobj?.addEdge({
                type: edge.type,
                sourceNodeId: edge.sourceNodeId,
                targetNodeId: edge.targetNodeId,
            });
        }
        debugger
        for (let group of groups) {
            // 生成一个组
            const groupElem = {
                id: `group${group.id}_${group.instanceId}`,
                type: 'templateGroup',
                x: 300,
                y: 300,
                children: group.children,
                properties: group.properties
            };
            LFinstanceobj?.addNode(groupElem);
        }
        return { newnodes, edges };
    };
    return (
        <div>
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
