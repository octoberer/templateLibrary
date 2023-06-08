import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/style/index.css';
import { useEffect, useRef } from 'react';
import { Menu } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css';
import { Bus } from '../tools/Bus';
import {
    getregisterEndobj,
    getregisterProcessControlWaitAllobj,
    getregisterProcessControlWaitAnyobj,
    getregisterStartobj,
    getregisterTaskobj,
} from '../registerNode';

interface LogicFlowCanvaspropsType {
    getLFinstanceobj: (obj: LogicFlow) => void;
    getLFcurrentClickNode: (currentClickNode: any) => void;
}

export default function LogicFlowCanvas({ getLFinstanceobj, getLFcurrentClickNode }: LogicFlowCanvaspropsType) {
    const LogicFlowBox = useRef<HTMLDivElement | null>(null);
    const addLfEvent = (LogicFlowobj: LogicFlow) => {
        LogicFlowobj.on('node:click', ({ data }) => {
            getLFcurrentClickNode(data);
            Bus.emit('ClickNodeDataUpdate', data);
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
        lfinstance.register(getregisterProcessControlWaitAnyobj(lfinstance));
        lfinstance.register(getregisterProcessControlWaitAllobj(lfinstance));
        lfinstance.register(getregisterTaskobj(lfinstance));
        lfinstance.register(getregisterStartobj());
        lfinstance.register(getregisterEndobj());
        lfinstance.setTheme({
            text: {
                color: 'red',
                fontSize: 24,
                background: {
                    fill: 'transparent',
                },
            },
            nodeText: {
                color: '#000000',
                overflowMode: 'default',
                lineHeight: 1.2,
                fontSize: 16,
            },
        });
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
        // 给父祖件传实例值
        getLFinstanceobj(lfinstance);
        // 注册监听事件
        addLfEvent(lfinstance);
    }, []);
    return <div ref={LogicFlowBox}>LogicFlow</div>;
}
