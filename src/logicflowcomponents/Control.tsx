import { Button } from 'antd/es/radio';
import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import { Avatar, Card, Drawer, Modal } from 'antd';
import { EditOutlined, SettingOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import Meta from 'antd/es/card/Meta';
import { Bus } from '../tools/Bus';
import TemplateForm from './templateForm';
import { addParProperty, addTemplatedata, createTemplateObj, getAllTemplatedata } from '../tools/transformData';
import { initialallTemplatedata, tempGraphrenderData } from '../tools/transformData/initialData';
import { graphRenderData2TaskList } from '../tools/transformData/graphdata';

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
        setSelectNodeData([]);
    };

    const handleCancel = () => {
        setModalopen(false);
    };
    function OnCardImport(item: { [any: string]: any }) {
        setDrawerOpen(false);
        debugger;
        // let { newnodes } = old2newgraphData(item.renderNodeData);
        let { newnodes } = old2newgraphRenderData(item.graphRenderData);
        const newnodeIds = newnodes.map((item) => item.id);
        console.log('newnodeIds', newnodeIds);
        console.log('getGraphData', LFinstanceobj?.getGraphData());
        debugger
        const groupElem = {
            type: 'templateGroup',
            x: 100,
            y: 100,
            children: newnodeIds,
            properties: {
                ...item,
            },
        };
        debugger
        LFinstanceobj?.addNode(groupElem);
        LFinstanceobj?.render(LFinstanceobj?.getGraphData());
    }
    const old2newgraphRenderData = (oldgraphData: { nodes: any; edges: any }) => {
        let { nodes, edges } = oldgraphData;
        const newnodes = [];
        const realnewnodes = [];
        // 找到group
        const allchildrennodes = [];
        const groupNodes = nodes.filter((node) => node.children != undefined);
        for (let group of groupNodes) {
            const childrennodes = group.children;
            for (let nodeid of childrennodes) {
                debugger;
                let node = nodes.filter((item) => item.id === nodeid)[0];
                allchildrennodes.push(nodeid);
               
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
            const newnodeIds = newnodes.map((item) => item?.id);
            const groupElem = {
                type: 'templateGroup',
                x: 300,
                y: 300,
                children: newnodeIds,
                properties: group.properties,
            };
            const realnewnode = LFinstanceobj?.addNode(groupElem);
            realnewnodes.push(realnewnode);
        }

        // 其他节点
        for (let node of nodes) {
            if (allchildrennodes.indexOf(node.id) < 0&&node.type=='task') {
                const newnode: BaseNodeModel | undefined = LFinstanceobj?.addNode({
                    type: node.type,
                    x: node.x,
                    y: node.y,
                    properties: node.properties,
                });
                realnewnodes.push(newnode);
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
        // 边
        for (let edge of edges) {
            LFinstanceobj?.addEdge({
                type: edge.type,
                sourceNodeId: edge.sourceNodeId,
                targetNodeId: edge.targetNodeId,
            });
        }
        return { newnodes: realnewnodes, edges };
    };
    return (
        <div>
            <Button onClick={() => graphRenderData2TaskList(addParProperty(LFinstanceobj?.getGraphData()))}>调式</Button>
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
