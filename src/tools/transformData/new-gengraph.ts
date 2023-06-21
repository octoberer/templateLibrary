import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import {
    basicTaskDefine,
    basicTaskInstanceDefine,
    processControlDefine,
    processControlInstanceDefine,
    templateConnectTaskObjDefine,
    templateDefine,
    templateTaskDefine,
} from '../../define';
import { getTaskListByID } from '../genTypeObj';
import { getUniqueIdBytask } from './taskList2Graph';
const padding = 20;

export function generateGraph(template:templateDefine, LFinstance: LogicFlow) {
    debugger;
    const obj: { [key: string]: string } = {};
    const Position = { left: 0, right: 0, top: 0, bottom: 0 };
    const { handle } = template;
    const { x: initialX, y: initialY } = getTaskListByID(handle[0]);
    (Position.left = initialX), (Position.right = initialX);
    (Position.top = initialY), (Position.bottom = initialY);

    const currentChilrenNodes: BaseNodeModel[] = [];
    const taskchildren = template.memoChildren.map((key: string) => {
        return {
            ontology: getTaskListByID(key.split('_')[0]),
            instance: getTaskListByID(key),
        };
    }) as {
        ontology: basicTaskDefine | templateDefine | processControlDefine;
        instance: basicTaskInstanceDefine | processControlInstanceDefine|templateTaskDefine;
    }[];
    taskchildren.forEach(({ ontology, instance }) => {
        const { handleType } = getTaskListByID(ontology.id);
        if (handleType === 'templateGroup') {
            const groupNode = generateGoup(instance, LFinstance, obj, Position);
            currentChilrenNodes.push(groupNode);
        } else {
            const node = genBasicNode(instance, LFinstance, obj, Position);
            currentChilrenNodes.push(node);
        }
    });
    // 生成一个组
    // 找到最左侧的位置

    genGroupFromNodes(template, currentChilrenNodes, LFinstance, obj, Position, true);
    // 加边,遍历孩子节点的所有outputask,生成边
    genGroupEdgs(taskchildren, LFinstance, obj);
}
function genBasicNode(
    instance: basicTaskInstanceDefine,
    LFinstance: LogicFlow,
    obj: { [x: string]: string },
    Position: { left: any; right: any; top: any; bottom: any }
) {
    const ontology = getTaskListByID(instance.id);
    const node = LFinstance.addNode({
        type: ontology.handleType,
        x: instance.x || 0,
        y: instance.y || 0,
        properties: {
            ...ontology,
            ...instance,
        },
    });
    let temp1 = instance.x || 0;
    let temp2 = instance.y || 0;

    Position.left = Position.left > temp1 ? temp1 : Position.left;
    Position.right = Position.right < temp1 ? temp1 : Position.right;
    Position.top = Position.top > temp2 ? temp2 : Position.top;
    Position.bottom = Position.bottom < temp2 ? temp2 : Position.bottom;

    obj[getUniqueIdBytask(instance)] = node.id;
    return node;
}
function genGroupFromNodes(
    properties: basicTaskInstanceDefine,
    nodes: any[],
    LFinstance: LogicFlow,
    obj: { [x: string]: string },
    Position: { left: any; right: any; top: any; bottom: any },
    Positionflag: boolean
) {
    const childrenIds = nodes.map((node) => node.id);
    debugger;
    let groupElem;
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
    console.log(LFinstance.getGraphData());
    console.log(LFinstance.render(LFinstance.getGraphData()));
    const groupNode = LFinstance.addNode(groupElem);
    obj[getUniqueIdBytask(properties)] = groupNode.id;
    return groupNode;
}
function genGroupEdgs(taskchildren: { ontology: any; instance: any }[], LFinstance: LogicFlow, obj: { [x: string]: any }) {
    // 这种处理方式，是针对将输入输出任务放到group上的
    taskchildren.forEach(({ ontology, instance }) => {
        if (ontology.handleType != 'templateGroup') {
            instance.outputTaskKeys.forEach((relationobj: string) => {
                const { source, target } = relationobj as unknown as templateConnectTaskObjDefine;
                const targetTask = getTaskListByID(target.split('_')[0]);
                if (targetTask.handleType != 'templateGroup') {
                    // 单节点对单节点
                    debugger
                    LFinstance.addEdge({
                        sourceNodeId: obj[source],
                        targetNodeId: obj[target],
                    });
                } else {
                    // 单节点对group
                    const sourceTaskkey = getUniqueIdBytask(instance);
                    const targetrelationTask = targetTask.inputTaskKeys.filter((relationobj) => {
                        const { source } = relationobj as templateConnectTaskObjDefine;
                        if (source === sourceTaskkey) {
                            return true;
                        }
                    });
                    targetrelationTask.forEach((targetTaskIdObj) => {
                        const { source, target } = targetTaskIdObj;
                        LFinstance.addEdge({
                            sourceNodeId: obj[source],
                            targetNodeId: obj[target],
                        });
                    });
                }
            });
        } else {
            instance.outputTaskKeys.forEach((relationobj: string) => {
                const { source, target } = relationobj as unknown as templateConnectTaskObjDefine;
                const targetTask = getTaskListByID(target.split('_')[0]);
                if (targetTask.handleType != 'templateGroup') {
                    // group对应task
                    // 找到源节点的真实节点
                    const sourceTaskkey = getUniqueIdBytask(instance);
                    const sourceTask = getTaskListByID(sourceTaskkey);
                    const sourceTaskIds = sourceTask.outputTaskKeys.filter((relationobj2) => {
                        const { target: target2 } = relationobj2 as templateConnectTaskObjDefine;
                        if (target2 === target) {
                            return true;
                        }
                    });
                    sourceTaskIds.forEach((sourceTaskIdobj) => {
                        const { source, target } = sourceTaskIdobj;
                        LFinstance.addEdge({
                            sourceNodeId: obj[source],
                            targetNodeId: obj[target],
                        });
                    });
                } else {
                    // group对group
                    const sourceTask = getTaskListByID(source);
                    const sourceTaskKeys = sourceTask.outputTaskKeys.filter((relationobj) => {
                        const { target } = relationobj as templateConnectTaskObjDefine;
                        const targetTemplateTask = getTaskListByID(targetId);
                        const targetIds = targetTemplateTask.inputTaskKeys.map((obj) => obj.target);
                        if (targetIds.indexOf(target) >= 0) {
                            return true;
                        }
                    });
                    sourceTaskKeys.forEach((sourceTaskKeyobj) => {
                        const { source, target } = sourceTaskKeyobj;
                        // 找target的实例id
                        LFinstance.addEdge({
                            sourceNodeId: obj[source],
                            targetNodeId: obj[target],
                        });
                    });
                }
            });
        }
    });
}
function generateGoup(templateInstance: templateTaskDefine, LFinstance: LogicFlow, obj: { [key: string]: string }, Position: { left: any; right: any; top: any; bottom: any; }) {
    debugger
    const currentChilrenNodes: BaseNodeModel[] = [];
    const currentPosition = { left: 0, right: 0, top: 0, bottom: 0 };
    const { handle } = getTaskListByID(templateInstance.id);
    const { x: initialX, y: initialY } = getTaskListByID(handle[0]);
    (currentPosition.left = initialX), (currentPosition.right = initialX);
    (currentPosition.top = initialY), (currentPosition.bottom = initialY);
    const taskchildren = templateInstance.memoChildren.map((key: string) => {
        return {
            ontology: getTaskListByID(key.split('_')[0]),
            instance: getTaskListByID(key),
        };
    }) as {
        ontology: basicTaskDefine | templateDefine | processControlDefine;
        instance: basicTaskInstanceDefine  | processControlInstanceDefine|templateTaskDefine;
    }[];
    taskchildren.forEach(({ ontology, instance }) => {
        const { handleType } = getTaskListByID(ontology.id);
        if (handleType === 'templateGroup') {
            const groupNode = generateGoup(instance, LFinstance, obj, currentPosition);
            currentChilrenNodes.push(groupNode);
        } else {
            const node = genBasicNode(instance, LFinstance, obj, currentPosition);
            currentChilrenNodes.push(node);
        }
    });

    const groupNode = genGroupFromNodes(
        { ...templateInstance, ...getTaskListByID(templateInstance.id) },
        currentChilrenNodes,
        LFinstance,
        obj,
        currentPosition,
        true
    );
    Position.left = Position.left > currentPosition.left ? currentPosition.left-padding : Position.left;
    Position.right = Position.right <  currentPosition.right ? currentPosition.right : Position.right;
    Position.top = Position.top >  currentPosition.top ? currentPosition.top-padding  : Position.top;
    Position.bottom = Position.bottom < currentPosition.bottom ? currentPosition.bottom : Position.bottom;
    // 加边,遍历孩子节点的所有outputask,生成边
    genGroupEdgs(taskchildren, LFinstance, obj);
    return groupNode;
}
