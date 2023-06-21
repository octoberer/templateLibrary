import { BaseNodeModel } from '@logicflow/core';
import { basicTaskInstanceDefine, templateTaskDefine } from '../../define';
import { addandGetTaskinstanceId, getTaskListByID } from '../genTypeObj';
import {  getUniqueIdByBasicTaskId, instanceTemplateTask, mergeduplicates } from './graphData2taklistcore';
export const getUniqueIdByNodeId = (nodeid, nodes) => {
    const node = nodes.filter((node) => node.id === nodeid)[0];
    return getUniqueIdByBasicTaskId(node.properties.id);
};
const instanceBasicTask = (res: any, node: BaseNodeModel, parId: string) => {
    const id = node.properties.id;
    let flag = getTaskListByID(id) || res[id];
    if (!flag) {
        res[id] = { ...node.properties };
    }
    const tempobj: basicTaskInstanceDefine = {
        id,
        instanceId: addandGetTaskinstanceId(id),
        parId,
        inputTaskKeys: [],
        outputTaskKeys: [],
        x: node.x,
        y: node.y,
    };
    res[`${id}_${tempobj.instanceId}`] = tempobj;
    return `${id}_${tempobj.instanceId}`;
};
function separateAllNode(nodes: any[]) {
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
export function graphdata2tasklist(data) {
    const { nodes, edges, topTemplateId } = data;
    const res = {};
    const { BasicNodes, GroupNodes } = separateAllNode(nodes);
    BasicNodes.forEach((node) => {
        instanceBasicTask(res, node, topTemplateId);
    });
    GroupNodes.forEach((GroupNode) => {
        instanceTemplate(GroupNode, data, res);
    });
    solveEdges({ nodes: nodes, edges }, res);
    return res;
}
function instanceTemplate(
    GroupNode: { properties: any; children: string | any[] },
    data: { nodes: any; edges: any; temptopTemplateId?: string; topTemplateId?: any },
    res: { [x: string]: templateTaskDefine }
) {
    const { nodes, edges, topTemplateId } = data;
    const template = GroupNode.properties;
    let TemplateUniqueId = instanceTemplateTask(res, template, topTemplateId, GroupNode);
    const topGroupchildrenNodes = nodes.filter((nodechild) => GroupNode.children.indexOf(nodechild.id) >= 0);
    const sourceNodes = [],
        targetNodes: any[] = [],
        nodeid2taskKeyobj: { [x: string]: string } = {};
    // 建立父子关系
    for (let childnode of topGroupchildrenNodes) {
        const { targetNodeId, sourceNodeId } = childnode;
        targetNodes.push(targetNodeId);
        sourceNodes.push(sourceNodeId);
        if (childnode.type !== 'templateGroup') {
            const uniqueId = instanceBasicTask(res, childnode, TemplateUniqueId);
            nodeid2taskKeyobj[childnode.id] = uniqueId;
            res[TemplateUniqueId].memoChildren.push(uniqueId);
        } else {
            const tempnodes = nodes.filter((node: { id: any }) => childnode.children.indexOf(node.id) > -1);
            const tempedges = edges.filter(
                (edge: { sourceNodeId: any; targetNodeId: any }) =>
                    childnode.children.indexOf(edge.sourceNodeId) > -1 && childnode.children.indexOf(edge.targetNodeId) > -1
            );
            let temptopTemplateId = TemplateUniqueId;
            const uniqueId = instanceTemplate(childnode, { nodes: tempnodes, edges: tempedges, topTemplateId: temptopTemplateId }, res);
            nodeid2taskKeyobj[childnode.id] = uniqueId;
            res[TemplateUniqueId].memoChildren.push(uniqueId);
        }
    }
    const finalsourceNodes = sourceNodes.filter((node) => targetNodes.indexOf(node) < 0);
    res[TemplateUniqueId].handle = finalsourceNodes.map((nodeid) => nodeid2taskKeyobj[nodeid]);
    // 处理相邻边，建立inputtask等关系
    solveEdges({ nodes, edges }, res);
    return TemplateUniqueId;
}
function solveEdges(data, res) {
    const { nodes, edges } = data;
    for (let childnode of nodes) {
        if (childnode.type !== 'templateGroup') {
            const tempsourceedge = edges.filter(
                (edge: { sourceNodeId: any; targetNodeId: any }) => edge.sourceNodeId === childnode.id || edge.targetNodeId === childnode.id
            );
            for (let edge of tempsourceedge) {
                const { sourceNodeId, targetNodeId } = edge;
                debugger;
                let taskUniqueId = getUniqueIdByNodeId(sourceNodeId, nodes);
                let beConnectedTaskUniqueId = getUniqueIdByNodeId(targetNodeId, nodes);
                if (!(res[taskUniqueId] && res[beConnectedTaskUniqueId])) {
                    continue;
                }
                const sourcerelations = getRelations(taskUniqueId, res);
                const targetrelations = getRelations(beConnectedTaskUniqueId, res);
                const TaskKey = {
                    source: taskUniqueId,
                    target: beConnectedTaskUniqueId,
                    sourcerelations,
                    targetrelations,
                };
                res[beConnectedTaskUniqueId].inputTaskKeys = mergeduplicates([...res[beConnectedTaskUniqueId].inputTaskKeys, TaskKey]);
                res[taskUniqueId].outputTaskKeys = mergeduplicates([...res[taskUniqueId].outputTaskKeys, TaskKey]);
            }
        }
    }
}
function getRelations(key, res) {
    const relations = [];
    let temp = key;
    while (res[temp]) {
        temp = res[temp].parId;
        relations.push(temp);
    }
    return relations;
}
export const getTemplateAndLayer = (parId: string) => {
    let tempNodeparId = parId;
    let a = getTaskListByID(parId);
    let layer = 0;
    while (a.handleType != 'templateGroup') {
        tempNodeparId = a.parId;
        a = getTaskListByID(tempNodeparId);
        layer++;
    }
    return { template: a, layer };
} ;
