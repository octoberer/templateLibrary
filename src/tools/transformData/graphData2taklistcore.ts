import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import { basicTaskDefine, processControlDefine, template, templateTaskDefine } from '../../define';
import { tempGraphrenderData } from './initialData';

import {
    addTaskinstanceId,
    addTemplateInstance,
    getAllTaskList,
    getTaskListByID,
    getTaskinstanceId,
    getTemplateInstanceId,
} from '../genTypeObj';
interface graphdataDefine {
    nodes: any;
    edges: any;
    topTemplateId: string;
}

let currentTemplate: { [any: string]: any } = { id: null };
const getAllSourceAndTargetNodes = (data: { nodes: any; edges: any }) => {
    // 找到流程开始节点，start
    let { nodes, edges } = data;
    nodes = nodes.filter((node: { type: string }) => node.type != 'templateGroup');
    let startNode = nodes.find((item: { type: string }) => item.type === 'start');
    let endNode = nodes.find((item: { type: string }) => item.type === 'end');
    let sourceNodes = [];
    let targetNodes = [];
    if (startNode) {
        let allfindEdgeIds = edges
            .filter((item: { sourceNodeId: any }) => item.sourceNodeId === startNode.id)
            .map((item: { targetNodeId: any }) => item.targetNodeId);
        sourceNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    } else {
        let haveSourceNodes: any[] = [];
        edges.forEach((item) => {
            if (haveSourceNodes.indexOf(item.targetNodeId) < 0) {
                haveSourceNodes.push(item.targetNodeId);
            }
        });
        sourceNodes = nodes.filter((item) => haveSourceNodes.indexOf(item.id) < 0);
    }
    if (endNode) {
        let allfindEdgeIds = edges
            .filter((item: { targetNodeId: any }) => item.targetNodeId === endNode.id)
            .map((item: { sourceNodeId: any }) => item.sourceNodeId);
        targetNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    } else {
        let havetargetNodes: any[] = [];
        edges.forEach((item) => {
            if (havetargetNodes.indexOf(item.sourceNodeId) < 0) {
                havetargetNodes.push(item.sourceNodeId);
            }
        });
        targetNodes = nodes.filter((item) => havetargetNodes.indexOf(item.id) < 0);
    }
    return { sourceNodes, targetNodes };
};

function graphdataobj2templatestructurefromStart(
    data: { nodes: any; edges: any },
    res: { [x: string]: any },
    sourceNodes: { properties: any }[]
) {
    // 得到源节点作为空节点的targetnodes，来完善这些节点的inputTask
    solveAllSourcenodes(data, sourceNodes, res);
}
function solveAllSourcenodes(
    data: graphdataDefine,
    sourceNodes: BaseNodeModel[],
    res: { [id: string]: template | templateTaskDefine | basicTaskDefine }
) {
    sourceNodes.forEach((node: BaseNodeModel) => {
        const { nodes, edges, topTemplateId } = data;
        let tempproperties = node.properties as basicTaskDefine;
        // 初始化没有parId
        let beConnectedParTaskkey = tempproperties.parId;
        let nodeUniqueId = getUniqueIdBynode(node);
        let allfindEdgeIds = edges
            .filter((item: { sourceNodeId: any }) => item.sourceNodeId === node.id)
            .map((item: { targetNodeId: any }) => item.targetNodeId);
        let targetNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
        if (!beConnectedParTaskkey) {
            res[nodeUniqueId] = {
                ...tempproperties,
                inputTask: [],
            };
        }
        debugger;
        makeTaskConnection({ beConnectedNode: node, data, res, flagNode: 'end', Task: 'inputTask', Nodes: targetNodes });
    });
}
const instanceBasicTask = (res: any, node: BaseNodeModel, topTemplateId: string) => {
    if (node.properties.instanceId) {
        if (!res[getUniqueIdBynode(node)]) {
            res[getUniqueIdBynode(node)] = node.properties;
        }
    }
    if (!currentTemplate.id || currentTemplate.id != node.properties.id) {
        currentTemplate.id = addTaskinstanceId(node.properties.id);
    }
    node.properties.instanceId = getTaskinstanceId(node.properties.id);
    const nodeparId = node.properties.parId;
    if (nodeparId) {
        // 更新
        addTemplateInstance(nodeparId);
        let TemplateInstanceid = getTemplateInstanceId(nodeparId);
        node.properties.parId = TemplateInstanceid;
    } else {
        // 新增
        node.properties.parId = topTemplateId;
    }
    res[getUniqueIdBynode(node)] = node.properties;
};
const instanceTemplateTask = (res, templateId, topTemplateId) => {
    let templateTask = getTaskListByID(templateId) as templateTaskDefine;
    let instanceId = getTemplateInstanceId(templateId);
    templateTask.parId = topTemplateId;
    templateTask.instanceId = instanceId;
    let uniqueId = `${templateId}_${instanceId}`;
    if (!res[uniqueId]) {
        res[uniqueId] = templateTask;
    }
    return uniqueId;
};
function makeTaskConnection({
    beConnectedNode,
    res,
    Nodes,
    data,
    flagNode,
    Task,
}: {
    beConnectedNode: BaseNodeModel;
    Nodes: BaseNodeModel[];
    res: { [id: string]: template | templateTaskDefine | basicTaskDefine };
    data: graphdataDefine;
    flagNode: 'start' | 'end';
    Task: 'inputTask' | 'outputTask';
}) {
    const { nodes, edges, topTemplateId } = data;
    const beConnectedTaskkey = getUniqueIdBynode(beConnectedNode);
    const beConnectedParTaskkey = getTaskListByID(beConnectedTaskkey)?.parId;
    // 将每个目标节点与beConnectedNode建立inputtask的联系
    Nodes.forEach((node: BaseNodeModel) => {
        if (node.type !== flagNode) {
            const nodeid = getUniqueIdBynode(node);
            if (!res[nodeid]) {
                res[nodeid] = node.properties as basicTaskDefine;
            }
            const nodeparId = getTaskListByID(nodeid)?.parId;
            const beConnectedNodeNeedConnected = isNeedConnectedTask(beConnectedParTaskkey, topTemplateId);
            const NodeNeedConnected = isNeedConnectedTask(nodeparId, topTemplateId);
            // 同级节点不再重复建立关系
            if (!(beConnectedNodeNeedConnected || NodeNeedConnected) && nodeparId == beConnectedParTaskkey) {
            }
            // basicTask初始化建立关系
            else if (beConnectedNodeNeedConnected && NodeNeedConnected) {
                debugger
                let tempresobj = res[beConnectedTaskkey];
                const tempTask =
                    Task == 'inputTask'
                        ? { source: beConnectedTaskkey, sourcerelations: [], target: nodeid, targetrelations: [] }
                        : { target: beConnectedTaskkey, sourcerelations: [], source: nodeid, targetrelations: [] };
                res[nodeid] = genResTaskobj({ ...res[nodeid], [Task]: mergeduplicates([...res[nodeid][Task], tempTask]) });
                if (node.type === 'processControlWaitAny' || node.type === 'processControlWaitAll') {
                    Task == 'inputTask'
                        ? (res[nodeid] = { ...res[nodeid], inputArgs: tempresobj.outputArgs })
                        : (res[nodeid] = { ...res[nodeid], outputArgs: tempresobj.inputArgs });
                }
            }
            // 外节点和内部的group建立联系,给group补充,被连接那个是top级的
            else if (beConnectedNodeNeedConnected && !NodeNeedConnected) {
                let tempnodeparId = nodeparId;
                let targetrelations = [];
                while (!isNeedConnectedTask(tempnodeparId, topTemplateId)) {
                    targetrelations.push(tempnodeparId);
                    tempnodeparId = tempnodeparId.parId;
                }
                const uniqueId = instanceTemplateTask(res, tempnodeparId, topTemplateId);
                targetrelations.pop();
                targetrelations.push(uniqueId);
                const tempTask =
                    Task == 'inputTask'
                        ? { source: beConnectedTaskkey, sourcerelations: [], target: nodeid, targetrelations }
                        : { target: beConnectedTaskkey, sourcerelations: [], source: nodeid, targetrelations };
                res[uniqueId] = {
                    ...res[uniqueId],
                    // 为模板补充inputTask
                    [Task]: mergeduplicates([...res[uniqueId][Task], tempTask]),
                };
            } else if (!beConnectedNodeNeedConnected && NodeNeedConnected) {
                instanceBasicTask(res, node, topTemplateId);
                let tempbeConnectedParTaskkey = beConnectedParTaskkey;
                let sourcerelations = [tempbeConnectedParTaskkey];
                while (!isNeedConnectedTask(tempbeConnectedParTaskkey, topTemplateId)) {
                    sourcerelations.push(tempbeConnectedParTaskkey);
                    tempbeConnectedParTaskkey = tempbeConnectedParTaskkey.parId;
                }
                instanceTemplateTask(res, tempbeConnectedParTaskkey, topTemplateId);
                const tempTask =
                    Task == 'inputTask'
                        ? { source: beConnectedTaskkey, sourcerelations, target: nodeid, targetrelations: [] }
                        : { target: beConnectedTaskkey, sourcerelations, source: nodeid, targetrelations: {} };
                res[nodeid] = genResTaskobj({
                    ...res[nodeid],
                    // 为模板补充inputTask
                    [Task]: mergeduplicates([...res[nodeid][Task], tempTask]),
                });
            }
            // 两个都属于group内部的节点，但是此次产生了边
            else if (!(beConnectedNodeNeedConnected || NodeNeedConnected) && nodeparId !== beConnectedParTaskkey) {
                let tempnodeparId = nodeparId;
                let targetrelations = [];
                while (!isNeedConnectedTask(tempnodeparId, topTemplateId)) {
                    targetrelations.push(tempnodeparId);
                    tempnodeparId = tempnodeparId.parId;
                }
                let tempbeConnectedParTaskkey = beConnectedParTaskkey;
                let sourcerelations = [tempbeConnectedParTaskkey];
                while (!isNeedConnectedTask(tempbeConnectedParTaskkey, topTemplateId)) {
                    sourcerelations.push(tempbeConnectedParTaskkey);
                    tempbeConnectedParTaskkey = tempbeConnectedParTaskkey.parId;
                }
                const uniqueId = instanceTemplateTask(res, tempnodeparId, topTemplateId);
                targetrelations.pop();
                targetrelations.push(uniqueId);
                const tempTask =
                    Task == 'inputTask'
                        ? { source: beConnectedTaskkey, sourcerelations, target: nodeid, targetrelations }
                        : { target: beConnectedTaskkey, sourcerelations, source: nodeid, targetrelations };
                res[uniqueId] = genResTaskobj({
                    ...res[uniqueId], //合并outputtask
                    // 为模板补充inputTask
                    [Task]: mergeduplicates([...res[uniqueId][Task], tempTask]),
                });
            }
            let Nodes = [];
            if (Task == 'inputTask') {
                let allfindEdgeIds = edges
                    .filter((item: { sourceNodeId: any }) => item.sourceNodeId === node.id)
                    .map((item: { targetNodeId: any }) => item.targetNodeId);
                Nodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
            } else {
                let allfindEdgeIds = edges
                    .filter((item: { targetNodeId: any }) => item.targetNodeId === node.id)
                    .map((item: { sourceNodeId: any }) => item.sourceNodeId);
                Nodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
            }
            makeTaskConnection({ beConnectedNode: node, res, Nodes, data: data, flagNode, Task });
        }
    });
}

function graphdataobj2templatestructurefromEnd(
    data: { nodes: any; edges: any },
    res: { [x: string]: any },
    targetNodes: { properties: any }[]
) {
    // 完善这些节点的输入组件
    solveAllTargetnodes(data, targetNodes, res);
}
function solveAllTargetnodes(data: graphdataDefine, targetNodes: BaseNodeModel, res: { [x: string]: any }) {
    targetNodes.forEach((node: BaseNodeModel) => {
        const { nodes, edges, topTemplateId } = data;
        let taskobj = getTaskListByID(getUniqueIdBynode(node));
        let nodeid = getUniqueIdBynode(node);
        if (!getTaskListByID(nodeid)) {
            res[nodeid] = {
                ...taskobj,
                ...res[nodeid], //合并inputtask
                outputTask: [],
                parId: data.topTemplateId,
            };
        }
        let allfindEdgeIds = edges
            .filter((item: { targetNodeId: any }) => item.targetNodeId === node.id)
            .map((item: { sourceNodeId: any }) => item.sourceNodeId);
        let sourceNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
        makeTaskConnection({ beConnectedNode: node, data, Nodes: sourceNodes, res, flagNode: 'start', Task: 'outputTask' });
    });
}

export function graphRenderData2TaskListCore(data: { nodes: any; edges: any; topTemplateId: string }) {
    let res: { [id: string]: template | templateTaskDefine | basicTaskDefine } = getAllTaskList();
    debugger;
    data = data || tempGraphrenderData;
    const { sourceNodes, targetNodes } = getAllSourceAndTargetNodes(data);
    // 新增当前模板的字模板对象
    graphdataobj2templatestructurefromStart(data, res, sourceNodes);
    graphdataobj2templatestructurefromEnd(data, res, targetNodes);
    const currentTaskList = res;
    sourceNodes.map((item) => (item.par ? item.par : item));
    return { currentTaskList, firstTasks: sourceNodes };
}
function getUniqueIdBynode(node: BaseNodeModel) {
    if (!node.properties.instanceId) {
        return node.properties.id;
    }
    return `${node.properties.id}_${node.properties.instanceId}`;
}
function genResTaskobj(obj: templateTaskDefine | basicTaskDefine | processControlDefine) {
    const { id, instanceId, handleType, inputTask, outputTask, parId, inputArgs, outputArgs, inputhandlArg, outputhandlArg, handle } = obj;
    if (handleType == 'templateGroup') {
        return {
            id,
            instanceId,
            inputArgs,
            outputArgs,
            inputTask,
            outputTask,
            handleType: 'templateGroup',
            handle,
            parId,
        };
    }
    if (handleType == 'processControlWaitAny' || handleType == 'processControlWaitAll') {
        return {
            id,
            instanceId,
            inputArgs,
            outputArgs,
            inputTask,
            outputTask,
            handleType,
            parId,
        };
    }
    if (handleType === 'task') {
        return {
            id,
            instanceId,
            outputhandlArg,
            inputhandlArg,
            inputArgs,
            outputArgs,
            inputTask,
            outputTask,
            handleType: 'task',
            handle,
            parId,
        };
    }
    return {
        id,
        instanceId,
        outputhandlArg,
        inputhandlArg,
        inputArgs,
        outputArgs,
        inputTask,
        outputTask,
        handleType: 'task',
        handle,
        parId,
    };
}
function getUniqueIdBytemplateId(id: string | number) {
    let instanceId = getTemplateInstanceId(id);
    return `${id}_${instanceId}`;
}
function mergeduplicates(arr: any[]) {
    return [...new Set(arr)];
}
function isNeedConnectedTask(taskParKey, topTemplateId) {
    if (taskParKey === undefined || taskParKey === topTemplateId) {
        return true;
    }
    return false;
}
