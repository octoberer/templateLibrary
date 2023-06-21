import { BaseNodeModel } from '@logicflow/core';
import { addAndgetTemplateId, addTaskList } from '../genTypeObj';
import { selectAreadata2graphRenderData } from './selectAreadata2graphData';
import { getUniqueIdBytask } from './taskList2Graph';
import { getUniqueIdByNodeId, graphdata2tasklist } from './new-graphdata2tasklist';
import { templateDefine } from '../../define';

function addTemplatedata(currentTaskList, { doc, briefName }, id) {
    debugger;
    const memoChildren = Object.values(currentTaskList)
        .filter((task) => task.parId === id)
        .map((task) => getUniqueIdBytask(task));
    const handle: any[] = [];
    for (let key in currentTaskList) {
        debugger;
        if (!currentTaskList[key].handleType) {
            if (currentTaskList[key].inputTaskKeys.length === 0) {
                handle.push(key);
            }
        }
    }
    const templateobj: templateDefine = {
        id,
        doc,
        briefName,
        handleType: 'templateGroup',
        handle: handle,
        statusId: '',
        status: '',
        memoChildren: memoChildren,
    };
    addTaskList({ [id]: templateobj });
}

function graphData2taklist(graphRenderData: any, { doc = 'test', briefName = 'llll' }: { doc: any; briefName: any }) {
    debugger;
    const id = addAndgetTemplateId();
    // const graphRenderData = Array.isArray(NodeData) ? selectAreadata2graphRenderData(NodeData) : NodeData;
    const currentTaskList = graphdata2tasklist({ ...graphRenderData, topTemplateId: id }); //得到res以id为键的对象
    addTaskList(currentTaskList);
    addTemplatedata(currentTaskList, { doc, briefName }, id);
}

export { graphData2taklist };
