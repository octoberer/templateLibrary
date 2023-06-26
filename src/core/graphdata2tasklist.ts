import { BaseNodeModel, GraphModel } from '@logicflow/core';
import { addBasicNodes2Handle, getTaskKeyByNode, getTaskKeyByTemplate, instanceBasicTasks, separateAllNode } from './tools';
import { addTaskList, getTaskByKey, updateTaskByKey } from '../tools/genTypeObj';
import { templateTaskDefine } from '../define';
import { createTemplate } from './createTemplate';

export function graphdata2tasklist(
    data: { nodes: any; edges: any; topTemplateId: any },
    { doc = 'test', briefName = 'llll' }: { doc: any; briefName: any }
) {
    const { nodes, edges } = data;
    const memoChildren = [];
    // 记录新的task
    const templateStack: any[] = [];
    const { GroupNodes, BasicNodes } = separateAllNode(nodes);
    const BasicNodeIds = BasicNodes.map((node) => node.id);
    const BasicNodeObj: { [x: string]: BaseNodeModel } = {};
    BasicNodes.forEach((node) => (BasicNodeObj[node.id] = node));
    const BasicNodeKeys = BasicNodes.map((node) => getTaskKeyByNode(node));

    addrelation2BasicTask(BasicNodes, data);

    memoChildren.push(...BasicNodeKeys);
    const handle = addBasicNodes2Handle(BasicNodes, data);
    GroupNodes.forEach((GroupNode) => {
        // 将内部节点的连接关系转移到template的输入输出任务上
        const topTemplate = GroupNode.properties;
        addrelation2Template({ GroupNode, data, templateStack, BasicNodeIds, topTemplate });
        memoChildren.push(getTaskKeyByTemplate(topTemplate));
        const templateKey = getTaskKeyByTemplate(topTemplate);
        const task = getTaskByKey(templateKey);
        if (task.inputTaskKeys.length === 0) {
            handle.push(getTaskKeyByTemplate(task));
        }
    });
    createTemplate({ doc, briefName }, { memoChildren, handle });
}
function addrelation2Template({
    GroupNode,
    data,
    templateStack,
    BasicNodeIds,
    topTemplate,
}: {
    GroupNode: { properties: any; children: string | string[] };
    data: { nodes: any; edges: any; topTemplateId?: any };
    templateStack: any[];
    BasicNodeIds: any[];
    topTemplate: templateTaskDefine;
}) {
    const { nodes, edges } = data;
    const template = GroupNode.properties;
    templateStack.push(template);
    const groupchildrenNodes = nodes.filter((nodechild: BaseNodeModel) => GroupNode.children.indexOf(nodechild.id) >= 0);
    const groupchildrenNodeIds = groupchildrenNodes.map((nodechild: BaseNodeModel) => nodechild.id);
    debugger;
    // 建立父子关系,              
    const groups = nodes.filter((node) => node.type === 'templateGroup');
    for (let childnode of groupchildrenNodes) {
        if (childnode.type === 'templateGroup') {
            addrelation2Template({ GroupNode: childnode, data, templateStack, BasicNodeIds, topTemplate });
        } else {
            let edgeTargetNodes = edges.filter(
                (edge) => groupchildrenNodeIds.indexOf(edge.sourceNodeId) < 0 && groupchildrenNodeIds.indexOf(edge.targetNodeId) > -1
            );
            let edgeSourceNodes = edges.filter(
                (edge) => groupchildrenNodeIds.indexOf(edge.targetNodeId) < 0 && groupchildrenNodeIds.indexOf(edge.sourceNodeId) > -1
            );
            // 对该模板内部的节点连接写到template上
            edgeSourceNodes.forEach((edgeSourceNode: BaseNodeModel) => {
                const Relation: any[] = [];
                const currentNode = nodes.find((node: BaseNodeModel) => node.id === edgeSourceNode.targetNodeId);
                getAncestorRelation(currentNode, Relation, groups);
                const relations = {
                    sourceId: getTaskKeyByNode(childnode),
                    sourceRelations: [...templateStack],
                    targetId: getTaskKeyByNode(nodes.filter((node: BaseNodeModel) => node.id === edgeSourceNode.targetNodeId)[0]),
                    targetRelation: Relation,
                };
                topTemplate.outputTaskKeys.push(relations);
            });
            edgeTargetNodes.forEach((edgeTargetNode: BaseNodeModel) => {
                const Relation: any[] = [];
                const currentNode = nodes.find((node: BaseNodeModel) => node.id === edgeTargetNode.sourceNodeId);
                getAncestorRelation(currentNode, Relation, groups);
                const relations = {
                    sourceId: getTaskKeyByNode(nodes.filter((node: BaseNodeModel) => node.id === edgeTargetNode.sourceNodeId)[0]),
                    sourceRelations: Relation,
                    targetId: getTaskKeyByNode(childnode),
                    targetRelation: [...templateStack],
                };
                topTemplate.inputTaskKeys.push(relations);
            });
            const templateKey = getTaskKeyByTemplate(topTemplate);
            updateTaskByKey(templateKey, topTemplate);
        }
    }
    templateStack.pop();
}
function addrelation2BasicTask(BasicNodes, data) {
    // 初始化到tasklist
    BasicNodes.forEach((node) => addTaskList({ [getTaskKeyByNode(node)]: node.properties }));
    const BasicNodeIds = BasicNodes.map((node) => node.id);

    const { nodes, edges } = data;
    const allSourceNodeIds = edges.map((edge) => edge.sourceNodeId);
    const allTargetNodeIds = edges.map((edge) => edge.targetNodeId);
    const allBasicSourceNodes: BaseNodeModel[] = nodes.filter(
        (node) => allSourceNodeIds.indexOf(node.id) > -1 && BasicNodeIds.indexOf(node.id) > -1
    );
    const allBasicTargetNodes: BaseNodeModel[] = nodes.filter(
        (node) => allTargetNodeIds.indexOf(node.id) > -1 && BasicNodeIds.indexOf(node.id) > -1
    );
    const groups = nodes.filter((node) => node.type === 'templateGroup');
    debugger;
    for (let sourceNode of allBasicSourceNodes) {
        let task = getTaskByKey(getTaskKeyByNode(sourceNode));
        const targetNodes = getTargetNode(sourceNode, data);
        targetNodes.forEach((targetNode: BaseNodeModel) => {
            const Relation: any[] = [];
            getAncestorRelation(targetNode, Relation, groups);
            let relation = {
                sourceId: getTaskKeyByNode(sourceNode),
                sourceRelations: [],
                targetId: getTaskKeyByNode(targetNode),
                targetRelation: [...Relation],
            };
            task.x = sourceNode.x;
            task.y = sourceNode.y;
            task.outputTaskKeys.push(relation);
        });
        updateTaskByKey(getTaskKeyByNode(sourceNode), task);
    }
    for (let targetNode of allBasicTargetNodes) {
        let task = getTaskByKey(getTaskKeyByNode(targetNode));
        const sourceNodes = getSourceNode(targetNode, data);
        sourceNodes.forEach((sourceNode: BaseNodeModel) => {
            const Relation: any[] = [];
            getAncestorRelation(sourceNode, Relation, groups);
            let relation = {
                sourceId: getTaskKeyByNode(sourceNode),
                sourceRelations: [...Relation],
                targetId: getTaskKeyByNode(targetNode),
                targetRelation: [],
            };
            task.x = targetNode.x;
            task.y = targetNode.y;
            task.inputTaskKeys.push(relation);
        });
        updateTaskByKey(getTaskKeyByNode(targetNode), task);
    }
}
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
function getAncestorRelation(currentNode: { id: any }, Relation: any[], groups: any[]) {
    debugger;
    const findNode = groups.find((group) => group.children.indexOf(currentNode.id) > -1);
    if (findNode) {
        Relation.push(getTaskKeyByNode(findNode));
        getAncestorRelation(findNode, Relation, groups);
    }
}
