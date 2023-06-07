export const nodeList = [
    {
        text: '矩形',
        type: 'rect',
        style: 'node-rect',
    },
    {
        type: 'task',
        text: '任务',
        style: 'node-task',
    },
    {
        type: 'ProcessControl',
        text: '流程控制',
        style: 'node-possessControl',
    },
    {
        type: 'end',
        text: '结束',
        style: 'node-end',
    },
];

export const BpmnNode = [
    {
        type: 'bpmn:startEvent',
        text: '开始',
        class: 'bpmn-start',
    },
    {
        type: 'bpmn:endEvent',
        text: '结束',
        class: 'bpmn-end',
    },
    {
        type: 'bpmn:exclusiveGateway',
        text: '网关',
        class: 'bpmn-exclusiveGateway',
    },
    {
        type: 'bpmn:userTask',
        text: '用户',
        class: 'bpmn-user',
    },
];
