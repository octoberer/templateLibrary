import LogicFlow, { BaseNode, BaseNodeModel } from '@logicflow/core';
import { getAllTaskList, getTaskListByID, resettingTaskList } from '../genTypeObj';
import { basicTaskDefine, basicTaskInstanceDefine, templateConnectTaskObjDefine, templateDefine, templateTaskDefine } from '../../define';
import { getUniqueIdBynode } from './graphData2taklistcore';
import { Group } from '@logicflow/extension';

export const getAllTemplatedata = () => {
    return Object.values(getAllTaskList()).filter((task) => task.handleType == 'templateGroup' && task.instanceId == undefined);
};
let x = 0,
    y = 0;
let groupx = 0,
    groupy = 0;

function Increasex(obj) {
    obj.x = obj.x + 400;
}
function IncreaseY(obj) {
    obj.y = obj.y + 400;
}
 function generateGraph(templateobj: template, LFinstance: LogicFlow) {
    const AlreadyNodes: BaseNodeModel[] = [];
    const groupQueue: any[] = [];
    generateTemplateGraph({ templateobj, LFinstance, AlreadyNodes, groupQueue });
}
function generateTemplateGraph({
    templateobj,
    LFinstance,
    AlreadyNodes,
    groupQueue,
}: {
    templateobj: template;
    LFinstance: LogicFlow;
    AlreadyNodes: BaseNodeModel[];
    groupQueue: any[];
}) {
    // 找到模板的开始节点
    resettingTaskList();
    const { handle } = templateobj;
    const startTasks: basicTaskInstanceDefine[] = handle.map((id: string | number) => getTaskListByID(id));
    // 生成开始节点
    startTasks.forEach((task: basicTaskInstanceDefine) => {
        let ParTask = getTaskListByID(task.parId);
        while (ParTask) {
            const group = begingenGroup(AlreadyNodes, LFinstance, ParTask);
            groupQueue.push(group);
        }
        generateGraphFromSingleNode(task, LFinstance, AlreadyNodes, groupQueue);
    });
    // endgenGroup(AlreadyNodes, templateobj, LFinstance);
}
function generateGraphFromSingleNode(
    startTask: basicTaskInstanceDefine,
    LFinstance: LogicFlow,
    AlreadyNodes: BaseNodeModel[],
    groupQueue: any[]
) {
    let startNode: BaseNodeModel | undefined;
    if (!startTask.gen) {
        let ontology = getTaskListByID(startTask.id);
        let currentGroup = groupQueue[0];
        startNode = LFinstance.addNode({
            type: ontology.handleType,
            x: currentGroup.x,
            y: currentGroup.y,
            properties: { ...ontology, ...startTask },
        });
        IncreaseY(currentGroup);
        AlreadyNodes.push(startNode);
        startTask.gen = true;
    } else {
        startNode = AlreadyNodes.filter((node) => getUniqueIdBynode(node) === getUniqueIdBytask(startTask))[0];
    }

    let outputTasks: templateConnectTaskObjDefine[] = [];
    let ParTask = getTaskListByID(startTask.parId);
    if (startTask.outputTaskKeys?.length > 0) {
        outputTasks = startTask.outputTaskKeys;
    } else if (ParTask && ParTask.outputTask && ParTask.outputTask > 0) {
        // 如果group有输出任务
        const groupTask = getTaskListByID(startTask.parId) as templateTaskDefine;
        const tempOutputTasks = [] as templateConnectTaskObjDefine[];
        for (const outputTaskRelation of groupTask.outputTaskKeys) {
            if (outputTaskRelation.source === getUniqueIdBytask(startTask)) {
                tempOutputTasks.push(outputTaskRelation);
            }
        }
        outputTasks = tempOutputTasks;
        if (!ParTask.gen) {
            if (isGroupAllgen(ParTask)) {
                endgenGroup(AlreadyNodes, ParTask, LFinstance);
                ParTask.gen = true;
            }
        }
    } else if (ParTask) {
        // 如果group没有输出任务
        // 判断上层的所有group是否可以生成
        while (ParTask) {
            debugger;
            if (isGroupAllgen(ParTask) && !ParTask.gen) {
                endgenGroup(AlreadyNodes, ParTask, LFinstance, groupQueue);
                ParTask.gen = true;
                ParTask = getTaskListByID(ParTask.parId);
            } else if (ParTask.gen) {
                ParTask = getTaskListByID(ParTask.parId);
            } else {
                ParTask = null;
            }
        }
        return;
    }
    generateGraphFromOutputTask(startNode, startTask, outputTasks, LFinstance, AlreadyNodes);
}
function generateGraphFromOutputTask(
    startNode: BaseNodeModel,
    startTask: basicTaskInstanceDefine,
    outputTasks: templateConnectTaskObjDefine[],
    LFinstance: LogicFlow,
    AlreadyNodes: BaseNodeModel[],
    groupQueue:any[]
) {
    outputTasks.forEach((outputTaskRelation) => {
        const outputTask = getTaskListByID(outputTaskRelation.target) as basicTaskInstanceDefine;
        let ontology = getTaskListByID(outputTask.id);
        if (ontology.handleType === 'templateGroup') {
            const tempOutputTasks = [];
            for (const inputTaskRelations of outputTask.inputTaskKeys) {
                if (getUniqueIdBytask(startTask) === inputTaskRelations.source) {
                    tempOutputTasks.push(inputTaskRelations);
                }
            }
            generateGraphFromOutputTask(startNode, startTask, tempOutputTasks, LFinstance, AlreadyNodes,groupQueue);
            return;
        }
        let outputNewnode: BaseNodeModel | undefined;
        if (!outputTask.gen) {
            let ontology = getTaskListByID(outputTask.id);
            let currentGroup = groupQueue[0];
            outputNewnode = LFinstance.addNode({
                type: ontology.handleType,
                x: currentGroup.x,
                y: currentGroup.y,
                properties: { ...ontology, ...outputTask },
            });
            IncreaseY(currentGroup);
            AlreadyNodes.push(outputNewnode);
            outputTask.gen = true;
        } else {
            outputNewnode = AlreadyNodes.filter((node) => getUniqueIdBynode(node) === getUniqueIdBytask(outputTask))[0];
        }
        // 生成边
        LFinstance.addEdge({
            type: 'polyline',
            sourceNodeId: startNode.id,
            targetNodeId: outputNewnode.id,
        });
        generateGraphFromSingleNode(outputTask, LFinstance, AlreadyNodes,groupQueue);
    });
}
function begingenGroup(AlreadyNodes: any[], LFinstance: LogicFlow, templateobj: any) {
    const groupElem = {
        type: 'templateGroup',
        x: groupx,
        y: groupy,
        properties: { ...templateobj },
    };
    groupx = groupx - x;
    groupy = groupy - y;
    const groupNode = LFinstance.addNode(groupElem);
    AlreadyNodes.push(groupNode);
    return groupNode;
}
function endgenGroup(AlreadyNodes: any[], templateobj: templateDefine | basicTaskDefine, groupQueue: any[] | LogicFlow) {
    const children = AlreadyNodes.filter((node: BaseNodeModel) => {
        let parNodeId = node.properties.parId;
        return parNodeId === templateobj.id;
    });
    const childrenIds = children.map((child) => child.id);
    let currentGroup = groupQueue.shift();
    childrenIds.forEach((id) => currentGroup.addChild(id));
}

export const old2newgraphRenderData = (oldgraphData: { nodes: any; edges: any }, LFinstanceobj: LogicFlow) => {
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
        if (allchildrennodes.indexOf(node.id) < 0 && node.type == 'task') {
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
export function getUniqueIdBytask(task: basicTaskInstanceDefine | templateTaskDefine) {
    if (!task.instanceId) {
        return task.id;
    }
    return `${task.id}_${task.instanceId}`;
}
function isGroupAllgen(templateTask: templateTaskDefine) {
    let flag = false;
    if (!templateTask.memoChildren) {
        flag = true;
    } else {
        flag = templateTask.memoChildren.every((id: string) => {
            if (getTaskListByID(id).gen) {
                return true;
            }
        });
    }
    return flag;
}
