import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/style/index.css';
import { useEffect, useRef } from 'react';
import { Control, DndPanel, Group, Menu, MiniMap, SelectionSelect } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css';
import { Bus } from '../tools/Bus';
import {
    getregisterEndobj,
    getregisterProcessControlWaitAllobj,
    getregisterProcessControlWaitAnyobj,
    getregisterStartobj,
    getregisterTaskobj,
    getregisterTemplateGroupObj,
} from '../registerNode';

interface LogicFlowCanvaspropsType {
    getLFinstanceobj: (obj: LogicFlow) => void;
}
// 生成LogicFlow实例，注册业务组件，定义监听事件
export default function LogicFlowCanvas({ getLFinstanceobj }: LogicFlowCanvaspropsType) {
    const LogicFlowBox = useRef<HTMLDivElement | null>(null);
    const addLfEvent = (LogicFlowobj: LogicFlow) => {
        LogicFlowobj.on('node:click', ({ data }) => {
            Bus.emit('ClickNodeDataUpdate', data);
        });
        LogicFlowobj.on('edge:click', ({ data }) => {
            // console.log('edge:click', data);
        });
        LogicFlowobj.on('element:click', () => {
            //   this.hideAddPanel()
        });
        LogicFlowobj.on('edge:add', ({ data }) => {
            // console.log('edge:add', data);
        });
        LogicFlowobj.on('node:mousemove', ({ data }) => {
        });
        LogicFlowobj.on('blank:click', () => {});
        LogicFlowobj.on('connection:not-allowed', (data) => {});
        LogicFlowobj.on('selection:selected', (data) => {
            LogicFlowobj.extension.selectionSelect.closeSelectionSelect();
            Bus.emit('selectNodeDataUpdate', data);
        });
    };
    useEffect(() => {
        let lfinstance = new LogicFlow({
            container: LogicFlowBox.current || document.body,
            plugins: [DndPanel, SelectionSelect, Control, MiniMap, Menu, Group],
            grid: true,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientWidth - 128,
            multipleSelectKey: 'meta',
        });
        lfinstance.extension.control.addItem({
            iconClass: 'custom-minimap',
            title: '',
            text: '导航',
            onMouseEnter: (lf: LogicFlow, ev: { x: number; y: number }) => {
                const position = lf.getPointByClient(ev.x, ev.y);
                lf.extension.miniMap.show(position.domOverlayPosition.x - 120, position.domOverlayPosition.y + 35);
            },
            onClick: (lf: LogicFlow, ev: { x: number; y: number }) => {
                const position = lf.getPointByClient(ev.x, ev.y);
                lf.extension.miniMap.show(position.domOverlayPosition.x - 120, position.domOverlayPosition.y + 35);
            },
        });
        lfinstance.extension.selectionSelect.setSelectionSense(true, false);
        lfinstance.register(getregisterProcessControlWaitAnyobj());
        lfinstance.register(getregisterProcessControlWaitAllobj(lfinstance));
        lfinstance.register(getregisterTaskobj(lfinstance));
        lfinstance.register(getregisterStartobj());
        lfinstance.register(getregisterEndobj());
        lfinstance.register(getregisterTemplateGroupObj());
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
        lfinstance.render();
        // 给父祖件传实例值
        getLFinstanceobj(lfinstance);
        // 注册监听事件
        addLfEvent(lfinstance);
    }, []);
    return <div ref={LogicFlowBox}>LogicFlow</div>;
}
