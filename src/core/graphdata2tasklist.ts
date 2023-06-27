import {
    getNodeBykey,
    getTaskKeyByNode,
    getTaskKeyByNodeId,
    isTemplateGroup,
    separateAllNode,
} from './tools';
import { templateConnectTaskObjDefine } from '../define';
import { createTemplate } from './createTemplate';
import { BaseNodeModel } from '@logicflow/core';
import { addTaskList, getTaskByKey, updateTaskByKey } from '../tools/initialData';

export function graphdata2tasklist(
    data: { nodes: BaseNodeModel[]; edges: any; topTemplateId: any },
    { doc = 'test', briefName = 'llll' }: { doc: any; briefName: any }
) {
    const { nodes } = data;
    // 获取模板的Children
    const memoChildren = getMemoChildren(data);
    const groups = nodes.filter((node) => node.type === 'templateGroup');
    // 给每个top层节点更新输入输出任务，不属于top层边的都放到顶层group的输入输出中。（这里假定不允许模板自身内部的边进行增删改，但不同模板的节点可以新增边）
    addRelationfromEdges(data, groups);
    // 获取模板的handle属性值
    const handle = getHandle(memoChildren);
    // 给每个节点（组和basicTask)的属性添加相对于第一个handle的x,y，第一个handle定义为0，0，后面生成图需要用到这个位置信息
    initialPositionfromHandle(handle, nodes, groups);
    // 模板内部信息已经处理完成，可以生成一个模板，并放到模板库
    createTemplate({ doc, briefName }, { memoChildren, handle });
}
function addRelationfromEdges(data: { nodes: any; edges: any; topTemplateId?: any }, groups: any[]) {
    // 思路：遍历图的所有边，寻找两个节点的最顶层group,或者节点无父组，分情况为两个节点（如有顶层group，并且不相同，则为其顶层group）分别添加输入输出属性
    const { nodes, edges } = data;
    for (let edge of edges) {
        debugger;
        const { sourceNodeId, targetNodeId } = edge;
        const sourceRelations: any[] = [];
        getAncestorRelation(sourceNodeId, sourceRelations, groups);
        const targetRelations: any[] = [];
        getAncestorRelation(targetNodeId, targetRelations, groups);
        if (sourceRelations[0] && sourceRelations[0] === targetRelations[0]) {
            continue;
        }
        const sourceKey = getTaskKeyByNodeId(sourceNodeId, nodes);
        const targetKey = getTaskKeyByNodeId(targetNodeId, nodes);
        const relation: templateConnectTaskObjDefine = {
            sourceId: sourceKey,
            sourceRelations,
            targetId: targetKey,
            targetRelations,
        };
        if (sourceRelations.length > 0) {
            let templateinstance1 = getTaskByKey(sourceRelations.at(-1));
            templateinstance1.outputTaskKeys.push(relation);
            const currentgroupNode = getNodeBykey(sourceRelations.at(-1), nodes) || nodes[0];
            templateinstance1.x = currentgroupNode.x;
            templateinstance1.y = currentgroupNode.y;
            const {width,height}=currentgroupNode.properties
            templateinstance1.width=width
            templateinstance1.height=height
            updateTaskByKey(sourceRelations.at(-1), templateinstance1);
        } else {
            let task = getTaskByKey(sourceKey);
            task.outputTaskKeys.push(relation);
            updateTaskByKey(sourceKey, task);
        }
        if (targetRelations.length > 0) {
            let templateinstance1 = getTaskByKey(targetRelations.at(-1));
            templateinstance1.inputTaskKeys.push(relation);
            const currentgroupNode = getNodeBykey(targetRelations.at(-1), nodes) || nodes[0];
            templateinstance1.x = currentgroupNode.x;
            templateinstance1.y = currentgroupNode.y;
            const {width,height}=currentgroupNode.properties
            templateinstance1.width=width
            templateinstance1.height=height
            updateTaskByKey(targetRelations.at(-1), templateinstance1);
        } else {
            let task = getTaskByKey(targetKey);
            task.inputTaskKeys.push(relation);
            updateTaskByKey(targetKey, task);
        }
    }
}
function getAncestorRelation(currentNodeId: string, Relation: any[], groups: any[]) {
    const findNode = groups.find((group) => group.children.indexOf(currentNodeId) > -1);
    if (findNode) {
        Relation.push(getTaskKeyByNode(findNode));
        getAncestorRelation(findNode.id, Relation, groups);
    }
}
function getMemoChildren(data: { nodes: any; edges?: any; topTemplateId?: any; }) {
    const memoChildren = [];
    const { nodes } = data;

    const { GroupNodes, BasicNodes } = separateAllNode(nodes);
    const BasicNodeKeys = BasicNodes.map((node) => getTaskKeyByNode(node));
    const GroupNodeKeys = GroupNodes.map((node) => getTaskKeyByNode(node));
    // 初始化到tasklist
    BasicNodes.forEach((node) => addTaskList({ [getTaskKeyByNode(node)]: { ...node.properties } }));
    memoChildren.push(...BasicNodeKeys, ...GroupNodeKeys);
    return memoChildren;
}
function getHandle(memoChildren: string[]) {
    const handle = [];
    for (let childKey of memoChildren) {
        if (isTemplateGroup(childKey)) {
            const templateInstance = getTaskByKey(childKey);
            const template = getTaskByKey(templateInstance.id);
            const targetArr: string[] = [];
            templateInstance.inputTaskKeys.forEach((relation: templateConnectTaskObjDefine) => {
                const { targetId } = relation;
                targetArr.push(targetId);
            });
            for (let key of template.handle) {
                if (targetArr.indexOf(key) == -1) {
                    handle.push(key);
                }
            }
        } else if (getTaskByKey(childKey).inputTaskKeys.length == 0) {
            handle.push(childKey);
        }
    }
    return handle;
}
function initialPositionfromHandle(handle: string[], nodes: any[], groups: any[]) {
    const { GroupNodes, BasicNodes } = separateAllNode(nodes);
    let initialX = 0,
        initialY = 0;
    for (const node of nodes) {
        if (handle[0] === getTaskKeyByNode(node)) {
            const Relations: any[] = [];
            getAncestorRelation(node.id, Relations, groups);
            if (Relations.length > 0) {
                const top = Relations.at(-1);
                const topGroup=getNodeBykey(top,nodes)
                initialX = topGroup?.x||0;
                initialY = topGroup?.y||0;
            } else {
                initialX = node.x;
                initialY = node.y;
            }
            break;
        }
    }
    BasicNodes.forEach((node) => {
        updateTaskByKey(getTaskKeyByNode(node), { x: node.x - initialX, y: node.y - initialY });
    });
    GroupNodes.forEach((node) => {
        updateTaskByKey(getTaskKeyByNode(node), { x: node.x - initialX, y: node.y - initialY });
    });
}
