import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import {
  basicTaskDefine,
  basicTaskInstanceDefine,
  processControlDefine,
  processControlInstanceDefine,
  templateConnectTaskObjDefine,
  templateDefine,
  templateTaskInstanceDefine,
} from '../../define';
import { getTaskListByID } from '../genTypeObj';
import { getUniqueIdBytask } from './taskList2Graph';
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
export function generateGraph(template, LFinstance: LogicFlow) {
  debugger;
  const obj: { [key: string]: string } = {};
  const currentChilrenNodes: BaseNodeModel[] = [];
  const taskchildren = template.memoChildren.map((key: string) => {
    return {
      ontology: getTaskListByID(key.split('_')[0]),
      instance: getTaskListByID(key),
    };
  }) as {
    ontology: basicTaskDefine | templateDefine | processControlDefine;
    instance:
      | basicTaskInstanceDefine
      | templateTaskInstanceDefine
      | processControlInstanceDefine;
  }[];
  taskchildren.forEach(({ ontology, instance }) => {
    const { handleType } = getTaskListByID(ontology.id);
    if (handleType === 'templateGroup') {
      const groupNode = generateGoup(instance, LFinstance,obj);
      currentChilrenNodes.push(groupNode);
    } else {
      const node = genBasicNode(instance, LFinstance,obj);
      currentChilrenNodes.push(node);
    }
  });
  // 生成一个组
  genGroupFromNodes(template, currentChilrenNodes, LFinstance,obj);
  // 加边,遍历孩子节点的所有outputask,生成边
  genGroupEdgs(taskchildren, LFinstance, obj);
}
function genBasicNode(
  instance: basicTaskInstanceDefine,
  LFinstance: LogicFlow,
  obj
) {
  const ontology = getTaskListByID(instance.id);
  const node = LFinstance.addNode({
    type: ontology.handleType,
    x,
    y,
    properties: {
      ...ontology,
      ...instance,
    },
  });
  obj[getUniqueIdBytask(instance)]=node.id
  return node;
}
function genGroupFromNodes(properties, nodes, LFinstance,obj) {
  const childrenIds = nodes.map((node) => node.id);
  const groupElem = {
    type: 'templateGroup',
    x: groupx,
    y: groupy,
    children: childrenIds,
    properties,
  };
  groupx = groupx + x;
  groupy = groupx + x;
  const groupNode = LFinstance.addNode(groupElem);
  obj[getUniqueIdBytask(`${properties.id}_${properties.instanceId}`)]=groupNode.id
  return groupNode;
}
function genGroupEdgs(taskchildren, LFinstance, obj) {
  taskchildren.forEach(({ ontology, instance }) => {
    if (ontology.handleType != 'templateGroup') {
      instance.outputTaskKeys.forEach((targetId: string) => {
        const targetTask = getTaskListByID(targetId);
        if (targetTask.handleType != 'templateGroup') {
          // 单节点对单节点
          LFinstance.addEdge({
            sourceNodeId: obj[getUniqueIdBytask(instance)],
            targetNodeId: obj[targetId],
          });
        } else {
          // 单节点对group
          const sourceTaskkey = getUniqueIdBytask(instance);
          const targetTaskIds = targetTask.inputTaskKeys.filter(
            (relationobj) => {
              const { source } =
                relationobj as templateConnectTaskObjDefine;
              if (source === sourceTaskkey) {
                return true;
              }
            }
          );
          targetTaskIds.forEach((targetTaskIdObj) => {
            const { target } = targetTaskIdObj;
            LFinstance.addEdge({
              sourceNodeId: obj[sourceTaskkey],
              targetNodeId: obj[target],
            });
          });
        }
      });
    } else {
      instance.outputTaskKeys.forEach((targetId: string) => {
        const targetTask = getTaskListByID(targetId);
        if (targetTask.handleType != 'templateGroup') {
          // group对应task
          // 找到源节点的真实节点
          const sourceTaskkey = getUniqueIdBytask(instance);
          const sourceTask = getTaskListByID(sourceTaskkey);
          const sourceTaskIds = sourceTask.outputTaskKeys.filter(
            (relationobj) => {
              const { target } =
                relationobj as templateConnectTaskObjDefine;
              if (target === targetId) {
                return true;
              }
            }
          );
          sourceTaskIds.forEach((sourceTaskIdobj) => {
            const { source, target } = sourceTaskIdobj;
            LFinstance.addEdge({
              sourceNodeId: obj[source],
              targetNodeId: obj[target],
            });
          });
        } else {
          // group对group
          const sourceTask = getTaskListByID(sourceTaskkey);
          const sourceTaskKeys = sourceTask.outputTaskKeys.filter(
            (relationobj) => {
              const { target } =
                relationobj as templateConnectTaskObjDefine;
              const targetTemplateTask = getTaskListByID(targetId);
              const targetIds = targetTemplateTask.inputTaskKeys.map(
                (obj) => obj.target
              );
              if (targetIds.indexOf(target) >= 0) {
                return true;
              }
            }
          );
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
function generateGoup(
  templateInstance: templateTaskInstanceDefine,
  LFinstance: LogicFlow,
  obj: { [key: string]: string }
) {
  const currentChilrenNodes: BaseNodeModel[] = [];
  const taskchildren = templateInstance.memoChildren.map(
    (key: string) => {
      return {
        ontology: getTaskListByID(key.split('_')[0]),
        instance: getTaskListByID(key),
      };
    }
  ) as {
    ontology: basicTaskDefine | templateDefine | processControlDefine;
    instance:
      | basicTaskInstanceDefine
      | templateTaskInstanceDefine
      | processControlInstanceDefine;
  }[];
  taskchildren.forEach(({ ontology, instance }) => {
    const { handleType } = getTaskListByID(ontology.id);
    if (handleType === 'templateGroup') {
      const groupNode = generateGoup(instance, LFinstance, obj);
      currentChilrenNodes.push(groupNode);
    } else {
      const node = genBasicNode(instance, LFinstance,obj);
      currentChilrenNodes.push(node);
    }
  });
  // 生成一个组
  const groupNode = genGroupFromNodes(
    {templateInstance,...getTaskListByID(templateInstance.id)},
    currentChilrenNodes,
    LFinstance,obj
  );
  // 加边,遍历孩子节点的所有outputask,生成边
  genGroupEdgs(taskchildren, LFinstance, obj);
  return groupNode;
}
