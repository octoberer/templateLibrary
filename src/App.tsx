import { useEffect, useState } from 'react';
import Control from './logicflowcomponents/Control';
import LogicFlowCanvas from './logicflowcomponents/LogicFlow';
import NodePanel from './logicflowcomponents/NodePanel';
import { nodeList } from './config';
import LogicFlow from '@logicflow/core';
export default function App() {
    useEffect(() => {
        document.documentElement.style.fontSize = '16px';
    }, []);
    const [LFinstanceobj, setLFinstanceobj] = useState<LogicFlow | null>(null);

    const getLFinstanceobj = (obj: LogicFlow) => {
        setLFinstanceobj(obj);
    };
    useEffect(() => {
        LFinstanceobj?.on('custom:onBtnClick', (i) => {
            console.log(i);
        });
    }, []);
    return (
        <div className="h-screen flow-root">
            <h3 className="text-center text-2xl font-normal h-[128px] leading-[128px] ">模板编辑器</h3>
            <div className="h-[calc(100%-128px)] relative w-full">
                <LogicFlowCanvas getLFinstanceobj={getLFinstanceobj}></LogicFlowCanvas>
                <div className="absolute bottom-12 flex justify-evenly items-center left-12 z-1 bg-white shadow-2xl text-center z-10 w-[200px] h-12">
                    <Control LFinstanceobj={LFinstanceobj}/>
                </div>
                <div className="flex justify-evenly flex-col items-center  absolute top-0 left-12 w-20 h-[500px] px-3 bg-white shadow-2xl text-center z-10">
                    <NodePanel LFinstanceobj={LFinstanceobj} nodeList={nodeList}></NodePanel>
                </div>
            </div>
        </div>
    );
}
