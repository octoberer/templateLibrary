// 转化过程中用到的通用方法

import  { BaseNodeModel } from '@logicflow/core';
import { basicTaskDefine, processControlTaskDefine, templateDefine, templateTaskDefine } from '../define';
import { addTaskList, addandGetTemplateInstance, getAllTaskList, getTaskByKey } from '../tools/initialData';

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
export const addBasicNodes2Handle = (BasicNodes: BaseNodeModel[], data: { nodes: any; edges: any; topTemplateId?: any }) => {
    const { edges, nodes } = data;
    const handle = [];
    const BasicNodeIds = BasicNodes.map((node) => node.id);
    const BasicNodeObj: { [x: string]: BaseNodeModel } = {};
    BasicNodes.forEach((node) => (BasicNodeObj[node.id] = node));

    const allSourceNodeIds = edges.map((edge: { sourceNodeId: any; }) => edge.sourceNodeId);
    const allTargetNodeIds = edges.map((edge: { targetNodeId: any; }) => edge.targetNodeId);
    const allBasicSourceNodes: BaseNodeModel[] = nodes.filter(
        (node: BaseNodeModel) => allSourceNodeIds.indexOf(node.id) > -1 && BasicNodeIds.indexOf(node.id) > -1
    );
    const allBasicTargetNodes: BaseNodeModel[] = nodes.filter(
        (node:BaseNodeModel) => allTargetNodeIds.indexOf(node.id) > -1 && BasicNodeIds.indexOf(node.id) > -1
    );
    const allBasicSourceNodeIds: string[] = allBasicSourceNodes.map((node) => node.id);
    const allBasicTargetNodeIds: string[] = allBasicTargetNodes.map((node) => node.id);

    for (let nodeid of [...allBasicSourceNodeIds]) {
        if (allBasicTargetNodeIds.indexOf(nodeid) < 0) {
            handle.push(getTaskKeyByNode(BasicNodeObj[nodeid]));
        }
    }
    return handle;
};
export const instanceTemplateTask = (template: templateDefine) => {
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
export const padding = 40;


export const getTaskKeyByNodeId = (nodeId: any, nodes: any[]) => {
    const node = nodes.find((node) => node.id === nodeId);
    return getTaskKeyByNode(node);
};

function getTargetNode(sourceNode: BaseNodeModel, data: { nodes: any; edges: any }) {
    const { nodes, edges } = data;
    const TargetNodeids: any[] = [];
    for (let edge of edges) {
        if (edge.sourceNodeId === sourceNode.id) {
            TargetNodeids.push(edge.targetNodeId);
        }
    }
    return nodes.filter((node: { id: any }) => TargetNodeids.indexOf(node.id) > -1);
}
function getSourceNode(targetNode: { id: any }, data: { nodes: any; edges: any }) {
    debugger;
    const { nodes, edges } = data;
    const sourceNodeids: any[] = [];
    for (let edge of edges) {
        if (edge.targetNodeId === targetNode.id) {
            sourceNodeids.push(edge.sourceNodeId);
        }
    }
    return nodes.filter((node: { id: any }) => sourceNodeids.indexOf(node.id) > -1);
}
export function getNodeBykey(key: string, nodes: BaseNodeModel[]) {
    return nodes.find((node: BaseNodeModel) => getTaskKeyByNode(node) === key);
}
export const isTemplateGroup = (taskKey: string) => {
    const taskobj = getTaskByKey(taskKey);
    const ontology = getTaskByKey(taskobj.id);
    if (ontology && ontology.handleType === 'templateGroup') {
       return true
    } else {
       return false
    }
};
export const getTopNode=(template: templateDefine)=>{
    const {memoChildren,handle}=template
    if(memoChildren.indexOf(handle[0])>=0){
        return handle[0]
    }
    else{
        for(let childrenkey of memoChildren){
            if(isTemplateGroup(childrenkey)){
                const res=getTopNode(getTaskByKey(childrenkey.split('_')[0]))
                if(res){
                    return childrenkey
                }
            }
        }
    }
}
export const taskWidth=400
export const taskHeight=250