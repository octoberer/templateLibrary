import {  BaseNodeModel } from "@logicflow/core";
import { template } from "../../define";
import { addAndgetTemplateId, addTaskList } from "../genTypeObj";
import { getUniqueIdBynode, graphRenderData2TaskListCore } from "./graphData2taklistcore";
import { selectAreadata2graphRenderData } from "./selectAreadata2graphData";
import { getUniqueIdBytask } from "./taskList2Graph";


function addTemplatedata({ currentTaskList, sourceNodes },{doc,briefName},id){
    debugger
    const memoChildren = Object.values(currentTaskList)
        .filter((task) => task.parId === id)
        .map((task) => getUniqueIdBytask(task));
    const handle: any[] = [];
    sourceNodes.forEach((node: BaseNodeModel) =>
        handle.push(getUniqueIdBynode(node))
    );
    const templateobj: template = {
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

function graphData2taklist(NodeData: any, { doc = 'test', briefName = 'llll' }: { doc: any; briefName: any }) {
    debugger
    const id = addAndgetTemplateId();
    const graphRenderData = Array.isArray(NodeData) ? selectAreadata2graphRenderData(NodeData) : NodeData;
    const { currentTaskList, sourceNodes } = graphRenderData2TaskListCore({ ...graphRenderData, topTemplateId: id }); //得到res以id为键的对象
    addTaskList(currentTaskList);
    addTemplatedata({ currentTaskList, sourceNodes },{doc,briefName},id)
}

export {graphData2taklist}