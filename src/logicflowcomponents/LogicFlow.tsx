import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/style/index.css';
import { useEffect, useRef } from 'react';
import { getregisterProcessControlobj, getregisterTaskobj } from '../registerNode';
import { Menu } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css';
import { Bus } from '../tools/Bus';

interface LogicFlowCanvaspropsType {
    getLFinstanceobj: (obj: LogicFlow) => void;
    getLFcurrentClickNode: (currentClickNode: any) => void;
}

export default function LogicFlowCanvas({ getLFinstanceobj, getLFcurrentClickNode }: LogicFlowCanvaspropsType) {
    const LogicFlowBox = useRef<HTMLDivElement | null>(null);
    const addLfEvent = (LogicFlowobj: LogicFlow) => {
        LogicFlowobj.on('node:click', ({ data }) => {
            getLFcurrentClickNode(data);
            Bus.emit('ClickNodeDataUpdate',data)
        });
        LogicFlowobj.on('edge:click', ({ data }) => {
            console.log('edge:click', data);
        });
        LogicFlowobj.on('element:click', () => {
            //   this.hideAddPanel()
        });
        LogicFlowobj.on('edge:add', ({ data }) => {
            console.log('edge:add', data);
        });
        LogicFlowobj.on('node:mousemove', ({ data }) => {
            console.log('node:mousemove');
        });
        LogicFlowobj.on('blank:click', () => {});
        LogicFlowobj.on('connection:not-allowed', (data) => {});
    };
    useEffect(() => {
        let lfinstance = new LogicFlow({
            container: LogicFlowBox.current || document.body,
            plugins: [Menu],
            grid: true,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientWidth - 128,
        });
        lfinstance.register(getregisterProcessControlobj(lfinstance));
        lfinstance.register(getregisterTaskobj(lfinstance));
        lfinstance.render({
            nodes: [
                {
                    type: 'task',
                    x: 500,
                    y: 300,
                    properties: {},
                },
            ],
        });
        lfinstance.setTheme({
            circle: {
                stroke: '#000000',
                strokeWidth: 1,
                outlineColor: '#88f',
            },
            rect: {
                outlineColor: '#88f',
                strokeWidth: 1,
            },
            polygon: {
                strokeWidth: 1,
            },
            polyline: {
                stroke: '#000000',
                hoverStroke: '#000000',
                selectedStroke: '#000000',
                outlineColor: '#88f',
                strokeWidth: 1,
            },
            nodeText: {
                color: '#000000',
            },
            edgeText: {
                color: '#000000',
                background: {
                    fill: '#f7f9ff',
                },
            },
        });
        getLFinstanceobj(lfinstance);
        // 注册监听事件
        addLfEvent(lfinstance);
    }, []);
    return <div ref={LogicFlowBox}>LogicFlow</div>;
}
