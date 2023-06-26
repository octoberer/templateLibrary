import LogicFlow, { BaseNode, BaseNodeModel } from '@logicflow/core';
import { basicTaskDefine, basicTaskInstanceDefine, processControlTaskDefine, templateDefine, templateTaskDefine } from '../define';
import { addTaskList, addandGetTaskinstanceId, addandGetTemplateInstance, getAllTaskList, getTaskByKey } from '../tools/genTypeObj';

export function separateAllNode(nodes: any[]) {
    let childnodeIDs: any[] = [];
    for (let node of nodes) {
        if (node.type === 'templateGroup') {
            childnodeIDs.push(...node.children);
        }
    }
    const topGroups = nodes.filter((node) => {
        if (childnodeIDs.indexOf(node.id) < 0) {
            return true;
        }
    });
    const BasicNodes = [];
    const GroupNodes = [];
    for (let item of topGroups) {
        item.type === 'templateGroup' ? GroupNodes.push(item) : BasicNodes.push(item);
    }
    return {
        BasicNodes,
        GroupNodes,
    };
}
export const getTaskKeyByNode = (Node: BaseNodeModel) => {
    const { properties } = Node;
    return `${properties.id}_${properties.instanceId}`;
};
export const getTaskKeyByTemplate = (template: templateTaskDefine) => {
    const { instanceId, id } = template;
    return `${id}_${instanceId}`;
};
export const getAllTemplatedata = () => {
    const templates = Object.values(getAllTaskList()) as (
        | templateDefine
        | templateTaskDefine
        | basicTaskDefine
        | processControlTaskDefine
    )[];
    return templates.filter((task) => task.handleType == 'templateGroup' && task.instanceId == undefined);
};
export const addBasicNodes2Handle = (BasicNodes: BaseNodeModel[], data: { nodes: any; edges: any; topTemplateId?: any; }) => {
    const {edges,nodes}=data
    debugger;
    const handle = [];
    const BasicNodeIds = BasicNodes.map((node) => node.id);
    const BasicNodeObj: { [x: string]: BaseNodeModel } = {};
    BasicNodes.forEach((node) => (BasicNodeObj[node.id] = node));

    const allSourceNodeIds = edges.map((edge) => edge.sourceNodeId);
    const allTargetNodeIds = edges.map((edge) => edge.targetNodeId);
    const allBasicSourceNodes: BaseNodeModel[] = nodes.filter((node) => allSourceNodeIds.indexOf(node.id)>-1&&BasicNodeIds.indexOf(node.id)>-1);
    const allBasicTargetNodes: BaseNodeModel[] = nodes.filter((node) => allTargetNodeIds.indexOf(node.id)>-1&&BasicNodeIds.indexOf(node.id)>-1);
    const allBasicSourceNodeIds: string[] = allBasicSourceNodes.map((node) => node.id)
    const allBasicTargetNodeIds: string[] = allBasicTargetNodes.map((node) => node.id)

    for (let nodeid of [...allBasicSourceNodeIds]) {
        debugger
        if (allBasicTargetNodeIds.indexOf(nodeid)<0) {
            handle.push(getTaskKeyByNode(BasicNodeObj[nodeid]));
        }
    }
    return handle;
};
export const instanceTemplateTask = (template: templateDefine) => {
    debugger;
    const instanceId = addandGetTemplateInstance(template.id);
    const templateTask: templateTaskDefine = {
        id: template.id,
        instanceId: instanceId,
        inputTaskKeys: [],
        outputTaskKeys: [],
    };
    const key = getTaskKeyByTemplate(templateTask);
    addTaskList({ [key]: templateTask });
    return templateTask;
};
export const padding = 20;

export function genGroupFromNodes(
    properties: basicTaskInstanceDefine | templateTaskDefine,
    childrenIds: string[],
    LFinstance: LogicFlow,
    Position: { left: any; right: any; top: any; bottom: any },
    Positionflag: boolean,
) {
    let groupElem
    if (Positionflag) {
        const width = Position.right - Position.left + 400 + padding * 2;
        const height = Position.bottom - Position.top + 320;
        const initialX = (Position.right - Position.left) / 2 + Position.left - padding;
        const initialY = (Position.bottom - Position.top) / 2 + Position.top;
        groupElem = {
            type: 'templateGroup',
            x: initialX,
            y: initialY,
            children: childrenIds,
            properties: { ...properties, width, height },
        };
    } else {
        groupElem = {
            type: 'templateGroup',
            x: properties.x,
            y: properties.y,
            children: childrenIds,
            properties,
        };
    }
    const groupNode = LFinstance.addNode(groupElem);
    return groupNode;
}
// export const instanceBasicTasks = (BasicNodes) => {
//     BasicNodes.forEach((Node: BaseNodeModel) => {
//         const { properties } = Node;
//         const { id } = properties;
//         if (!getTaskByKey(id)) {
//             addTaskList({ [id]: properties });
//         }
//         let instanceId = addandGetTaskinstanceId(id);
//         let taskinstanceObj: basicTaskInstanceDefine = {
//             ...properties,
//             instanceId,
//             outputTaskKeys: [],
//             inputTaskKeys: [],
//         };
//         addTaskList({ [getTaskKeyByTemplate(taskinstanceObj)]: taskinstanceObj });
//     });
// };
