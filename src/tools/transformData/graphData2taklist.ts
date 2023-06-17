import { template } from "../../define";
import { addAndgetTemplateId, addTaskList } from "../genTypeObj";
import { graphRenderData2TaskListCore } from "./graphData2taklistcore";
import { selectAreadata2graphRenderData } from "./selectAreadata2graphData";
import { getUniqueId } from "./taskList2Graph";


function addTemplatedata({ currentTaskList, firstTasks },{doc,briefName},id){
    const memoChildren = Object.values(currentTaskList)
        .filter((task) => task.parId === id)
        .map((task) => getUniqueId(task));
    const handle: any[] = [];
    firstTasks.forEach((node: { properties: { id: any; instanceId: any } }) =>
        handle.push(`${node.properties.id}_${node.properties.instanceId}`)
    );
    let templateobj: template = {
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
    let id = addAndgetTemplateId();
    let graphRenderData = Array.isArray(NodeData) ? selectAreadata2graphRenderData(NodeData) : NodeData;
    const { currentTaskList, firstTasks } = graphRenderData2TaskListCore({ ...graphRenderData, topTemplateId: id }); //得到res以id为键的对象
    addTaskList(currentTaskList);
    addTemplatedata({ currentTaskList, firstTasks },{doc,briefName},id)
}

export {graphData2taklist}