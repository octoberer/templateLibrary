import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import { getAllTaskList, getTaskListByID, resettingTaskList } from '../genTypeObj';
import { basicTaskDefine, template, templateTaskDefine } from '../../define';

export const getAllTemplatedata = () => {
    return Object.values(getAllTaskList()).filter((task) => task.handleType == 'templateGroup' && task.instanceId == undefined);
};
let x = 0,
    y = 0;
let groupx = 100,
    groupy = 100;

function Increasex() {
    x = x + 400;
}
function IncreaseY() {
    y = y + 300;
}
function IncreaseAll() {
    Increasex();
    IncreaseY();
}
export function generateGraph(templateobj: template, LFinstance: LogicFlow) {
    const AlreadyNodes: BaseNodeModel[] = [];
    generateTemplateGraph({ templateobj, LFinstance, AlreadyNodes });
}
function generateTemplateGraph({
    templateobj,
    LFinstance,
    AlreadyNodes,
}: {
    templateobj: template;
    LFinstance: LogicFlow;
    AlreadyNodes: BaseNodeModel[];
}) {
    // 找到模板的开始节点
    resettingTaskList();
    const { handle } = templateobj;
    const startTasks: (basicTaskDefine | template)[] = handle.map((id: string | number) => getTaskListByID(id));
    // 生成开始节点
    startTasks.forEach((task: basicTaskDefine | template) => {
        if (task.handleType === 'templateGroup') {
            generateTemplateGraph({ templateobj: task, LFinstance, AlreadyNodes });
        } else if (task.handleType === 'task') {
            generateGraphFromSingleNode(task, LFinstance, AlreadyNodes);
        }
        Increasex();
    });
    // genGroup(AlreadyNodes, templateobj, LFinstance);
}
function generateGraphFromSingleNode(startTask: basicTaskDefine, LFinstance: LogicFlow, AlreadyNodes: BaseNodeModel[]) {
    let startNode: BaseNodeModel | undefined;
    if (!startTask.gen) {
        startNode = LFinstance.addNode({
            type: startTask.handleType,
            x,
            y,
            properties: { ...startTask },
        });
        IncreaseY();
        AlreadyNodes.push(startNode);
        startTask.gen = true;
    } else {
        startNode = AlreadyNodes.filter((node) => `${node.properties.id}_${node.properties.instanceId}` === getUniqueId(startTask))[0];
    }

    let outputTasks: string[] = [];
    let ParTask = getTaskListByID(startTask.parId);

    if (startTask.outputTask?.length > 0) {
        outputTasks = startTask.outputTask;
    } else if (ParTask && ParTask.outputTask && Object.keys(ParTask.outputTask).length > 0) {
        // 如果group有输出任务
        const groupTask = getTaskListByID(startTask.parId);
        const tempOutputTasks = [];
        for (let id in groupTask.outputTask) {
            if (groupTask.outputTask[id] === getUniqueId(startTask)) {
                tempOutputTasks.push(id);
            }
        }
        outputTasks = tempOutputTasks;
        if (!ParTask.gen) {
            const flag = ParTask.memoChildren?.every((id: string | number) => getTaskListByID(id).gen);
            if (flag) {
                genGroup(AlreadyNodes, ParTask, LFinstance);
                ParTask.gen = true;
                let temp = { ...ParTask };
                ParTask = null;
                let res = getAllTaskList();
                for (let key in res) {
                    if (Array.isArray(res[key].memoChildren)) {
                        for (let item of res[key].memoChildren) {
                            if (item.split('_')[0] === temp.id) {
                                ParTask = getTaskListByID(res[key].id);
                                break;
                            }
                        }
                    }
                }
            }
        }
    } else if (ParTask) {
        // 如果group没有输出任务
        while (ParTask && !ParTask.gen) {
            let flag = false;
            if (!ParTask.memoChildren) {
                flag = true;
            } else {
                debugger;
                flag = ParTask.memoChildren.every((id: string) => {
                    if (getTaskListByID(id.split('_')[0])?.memoChildren) {
                        return getTaskListByID(id.split('_')[0]).gen;
                    } else {
                        return getTaskListByID(id).gen;
                    }
                });
            }
            if (flag) {
                genGroup(AlreadyNodes, ParTask, LFinstance);
                ParTask.gen = true;
                let temp = { ...ParTask };
                ParTask = null;
                let res = getAllTaskList();
                debugger;
                for (let key in res) {
                    if (Array.isArray(res[key].memoChildren)) {
                        for (let item of res[key].memoChildren) {
                            if (item.split('_')[0] === temp.id) {
                                ParTask = getTaskListByID(res[key].id);
                                break;
                            }
                        }
                    }
                }
            } else {
                break;
            }
        }
    }
    generateGraphFromOutputTask(startNode, startTask, outputTasks, LFinstance, AlreadyNodes);
}
function generateGraphFromOutputTask(
    startNode: BaseNodeModel,
    startTask: basicTaskDefine,
    outputTasks: string[],
    LFinstance: LogicFlow,
    AlreadyNodes: BaseNodeModel[]
) {
    outputTasks.forEach((outputTaskId: string) => {
        let outputTask = getTaskListByID(outputTaskId);
        if (outputTask.handleType === 'templateGroup') {
            const tempOutputTasks = [];
            for (let id in outputTask.inputTask) {
                if (outputTask.inputTask[id].indexOf(getUniqueId(startTask)) > -1) {
                    tempOutputTasks.push(id);
                }
            }
            generateGraphFromOutputTask(startNode, startTask, tempOutputTasks, LFinstance, AlreadyNodes);
            return;
        }
        let outputNewnode: BaseNodeModel | undefined;
        if (!outputTask.gen) {
            outputNewnode = LFinstance.addNode({
                type: outputTask.handleType,
                x,
                y,
                properties: { ...outputTask },
            });
            IncreaseY();
            AlreadyNodes.push(outputNewnode);
            outputTask.gen = true;
        } else {
            outputNewnode = AlreadyNodes.filter((node) => `${node.properties.id}_${node.properties.instanceId}` === outputTaskId)[0];
        }
        // 生成边
        LFinstance.addEdge({
            type: 'polyline',
            sourceNodeId: startNode.id,
            targetNodeId: outputNewnode.id,
        });
        generateGraphFromSingleNode(outputTask, LFinstance, AlreadyNodes);
    });
}
function genGroup(AlreadyNodes: any[], templateobj: template | basicTaskDefine, LFinstance: LogicFlow) {
    debugger;
    const children = AlreadyNodes.filter((node: BaseNodeModel) => {
        let parNodeId = node.properties.parId;
        if (!parNodeId) {
            let res = getAllTaskList();
            for (let key in res) {
                debugger;
                if (key !== node.properties.id && key.split('_')[0] === node.properties.id) {
                    return true;
                }
            }
        }
        return parNodeId === templateobj.id;
    });
    const childrenIds = children.map((child) => child.id);
    const groupElem = {
        type: 'templateGroup',
        x: groupx,
        y: groupy,
        children: childrenIds,
        properties: { ...templateobj },
    };
    groupx = groupx + x;
    groupy = groupx + x;
    const groupNode = LFinstance.addNode(groupElem);
    LFinstance.render(LFinstance.getGraphData());
    console.log(LFinstance.getGraphData());
    AlreadyNodes.push(groupNode);
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
export function getUniqueId(task: basicTaskDefine | templateTaskDefine) {
    return `${task.id}_${task.instanceId}`;
}