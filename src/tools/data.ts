import { getTemplateId, getTemplateInstanceId } from './genTypeObj';

function graphdataobj2templatestructurefromStart(data: { nodes: any; edges: any }, res: { [x: string]: any }) {
    // 找到流程开始节点，start
    const { nodes, edges } = data;
    let startNode = nodes.find((item: { type: string }) => item.type === 'start');
    // 找其包含sourceNodeId节点的所有边
    let allfindEdgeIds = edges
        .filter((item: { sourceNodeId: any }) => item.sourceNodeId === startNode.id)
        .map((item: { targetNodeId: any }) => item.targetNodeId);
    let targetNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    // 完善这些节点的输入组件
    solveAllTargetnodes(data, targetNodes, res);
}
function solveAllTargetnodes(data: { nodes: any; edges: any }, targetNodes: { properties: any }[], res: { [x: string]: any }) {
    targetNodes.forEach((item: { properties: any }) => {
        let tempproperties = item.properties;
        let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
        res[nodeid] = {
            ...tempproperties,
            inputTask: undefined,
        };
        makeTaskInputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
    });
}
function makeTaskInputTaskConnection({ currentNode, currentNodeId, data, res }) {
    const { nodes, edges } = data;
    let allfindEdgeIds = edges
        .filter((item: { sourceNodeId: any }) => item.sourceNodeId === currentNode.id)
        .map((item: { targetNodeId: any }) => item.targetNodeId);
    let targetNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    targetNodes.forEach((item: { type: string; properties: any }) => {
        if (item.type !== 'end') {
            let tempproperties = item.properties;
            let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
            if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                res[nodeid] = {
                    ...tempproperties,
                    ...res[nodeid], //合并outputtask
                    inputArgs: res[currentNodeId].outputArgs,
                    inputTask: { ...res[nodeid]?.inputTask, [currentNodeId]: res[currentNodeId] },
                };
            } else {
                res[nodeid] = {
                    ...tempproperties,
                    ...res[nodeid], //合并outputtask
                    inputTask: { ...res[nodeid]?.inputTask, [currentNodeId]: res[currentNodeId] },
                };
            }
            makeTaskInputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
        }
    });
}

function graphdataobj2templatestructurefromEnd(data: { nodes: any; edges: any }, res: { [x: string]: any }) {
    // 找到流程结束节点，end
    const { nodes, edges } = data;
    let endNode = nodes.find((item: { type: string }) => item.type === 'end');
    // 找其对应的边上所target节点
    let allfindEdgeIds = edges
        .filter((item: { targetNodeId: any }) => item.targetNodeId === endNode.id)
        .map((item: { sourceNodeId: any }) => item.sourceNodeId);
    let sourceNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    // 完善这些节点的输入组件
    solveAllSourcenodes(data, sourceNodes, res);
}
function solveAllSourcenodes(data: { nodes: any; edges: any }, sourceNodes: { properties: any }[], res: { [x: string]: any }) {
    sourceNodes.forEach((item: { properties: any }) => {
        let tempproperties = item.properties;
        let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
        res[nodeid] = {
            ...tempproperties,
            ...res[nodeid], //合并inputtask
            outputTask: undefined,
        };
        makeTaskOutputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
    });
}
function makeTaskOutputTaskConnection({ currentNode, currentNodeId, data, res }) {
    const { nodes, edges } = data;
    let allfindEdgeIds = edges
        .filter((item: { targetNodeId: any }) => item.targetNodeId === currentNode.id)
        .map((item: { sourceNodeId: any }) => item.sourceNodeId);
    let SourceNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    SourceNodes.forEach((item: { type: string; properties: any }) => {
        if (item.type !== 'start') {
            let tempproperties = item.properties;
            let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
            if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                res[nodeid] = {
                    ...tempproperties,
                    ...res[nodeid], //合并outputtask
                    outputArgs: res[currentNodeId].inputArgs,
                    outputTask: { ...res[nodeid]?.outputTask, [currentNodeId]: res[currentNodeId] },
                };
            } else {
                res[nodeid] = {
                    ...tempproperties,
                    ...res[nodeid], //合并outputtask
                    outputTask: { ...res[nodeid]?.outputTask, [currentNodeId]: res[currentNodeId] },
                };
            }
            makeTaskOutputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
        }
    });
}
export function graphdataobj2templatestructure(data: any[]) {
    let res = {};
    graphdataobj2templatestructurefromStart(data, res);
    graphdataobj2templatestructurefromEnd(data, res);
    return res;
}
const initialallTemplatedata = [
    {
        id: 1,
        instanceId: 1,
        doc: '1111111111111',
        briefName: 'test',
        renderNodeData: {
            nodes: [
                {
                    id: '14f8872d-66fc-4692-ad5a-ecc9727c96ba',
                    type: 'task',
                    height: 368,
                    width: 420,
                    x: 100,
                    y: 100,
                    properties: {
                        nodeSize: {
                            width: 420,
                            height: 368,
                        },
                        id: '1',
                        instanceId: '1',
                        outputhandlArg: {
                            label: 'opop',
                            name: 'opop',
                            type: 'string',
                            doc: '',
                            uiComponent: 'select',
                            isFixedValue: false,
                            allowEdit: true,
                        },
                        inputhandlArg: [
                            {
                                label: 'jj',
                                name: 'jj',
                                type: 'string',
                                doc: '',
                                uiComponent: 'select',
                                isFixedValue: false,
                                allowEdit: true,
                            },
                            {
                                type: 'undefined',
                                doc: '',
                                uiComponent: 'AutoComplete',
                                value: 'zz',
                                isFixedValue: true,
                                allowEdit: true,
                            },
                        ],
                        inputArgs: [
                            {
                                label: 'jj',
                                name: 'jj',
                                type: 'string',
                            },
                            {
                                label: 'zz',
                                name: 'zz',
                                type: 'string',
                            },
                        ],
                        outputArgs: [
                            {
                                label: 'opop',
                                name: 'opop',
                                type: 'string',
                                doc: '',
                            },
                        ],
                        handle: 'add',
                        handleType: 'basicTask',
                    },
                },
                {
                    id: '6a221f3f-929a-4126-bded-4628d035d36f',
                    type: 'task',
                    height: 320,
                    width: 400,
                    x: 560,
                    y: 100,
                    properties: {
                        id: '3',
                        instanceId: '1',
                        outputhandlArg: {
                            label: 'hh',
                            name: 'hh',
                            type: 'string',
                            doc: '',
                            uiComponent: 'select',
                            isFixedValue: false,
                            allowEdit: true,
                        },
                        inputhandlArg: [
                            {
                                label: 'rt',
                                name: 'rt',
                                type: 'string',
                                doc: '',
                                uiComponent: 'select',
                                isFixedValue: false,
                                allowEdit: true,
                            },
                            {
                                label: '5',
                                name: '5',
                                type: 'string',
                                doc: '',
                                uiComponent: 'AutoComplete',
                                isFixedValue: false,
                                allowEdit: true,
                            },
                        ],
                        inputArgs: [
                            {
                                label: 'rt',
                                name: 'rt',
                                type: 'string',
                            },
                        ],
                        outputArgs: [
                            {
                                label: 'hh',
                                name: 'hh',
                                type: 'string',
                                doc: '',
                            },
                        ],
                        handle: 'multipy',
                        handleType: 'basicTask',
                    },
                },
                {
                    id: 'b99a0c85-c13e-4ad8-ab9b-1155fe09467e',
                    type: 'processControlWaitAny',
                    height: 80,
                    width: 100,
                    x: 320,
                    y: 480,
                    properties: {
                        id: 101,
                        instanceId: '1',
                        handleType: 'processControl',
                        handle: 'processControlWaitAny',
                    },
                },
                {
                    id: '03406491-0e1d-4315-abd1-f840863d9d8b',
                    type: 'task',
                    height: 345,
                    width: 401,
                    x: 320,
                    y: 800,
                    properties: {
                        nodeSize: {
                            width: 401,
                            height: 345,
                        },
                        id: '2',
                        instanceId: '1',
                        outputhandlArg: {
                            label: 'dhggg',
                            name: 'dhggg',
                            type: 'string',
                            doc: '',
                            uiComponent: 'select',
                            isFixedValue: false,
                            allowEdit: true,
                        },
                        inputhandlArg: [
                            {
                                label: 'oppo',
                                name: 'oppo',
                                type: 'string',
                                doc: '',
                                uiComponent: 'select',
                                isFixedValue: false,
                                allowEdit: true,
                            },
                            {
                                type: 'undefined',
                                doc: '',
                                uiComponent: 'AutoComplete',
                                value: 'hh',
                                isFixedValue: true,
                                allowEdit: true,
                            },
                        ],
                        inputArgs: [
                            {
                                label: 'oppo',
                                name: 'oppo',
                                type: 'string',
                            },
                            {
                                label: 'hh',
                                name: 'hh',
                                type: 'string',
                            },
                        ],
                        outputArgs: [
                            {
                                label: 'dhggg',
                                name: 'dhggg',
                                type: 'string',
                                doc: '',
                            },
                        ],
                        handle: 'sub',
                        handleType: 'basicTask',
                    },
                },
            ],
            edges: [
                {
                    id: '256a3303-08e4-422f-94b4-258eb80e7935',
                    type: 'polyline',
                    sourceNodeId: '14f8872d-66fc-4692-ad5a-ecc9727c96ba',
                    targetNodeId: 'b99a0c85-c13e-4ad8-ab9b-1155fe09467e',
                },
                {
                    id: '5acfb1d9-3603-49b0-b735-35efbf8399f4',
                    type: 'polyline',
                    sourceNodeId: '6a221f3f-929a-4126-bded-4628d035d36f',
                    targetNodeId: 'b99a0c85-c13e-4ad8-ab9b-1155fe09467e',
                },
                {
                    id: '2354682a-1ebf-4da0-a105-4b8f3e264ff7',
                    type: 'polyline',
                    sourceNodeId: 'b99a0c85-c13e-4ad8-ab9b-1155fe09467e',
                    targetNodeId: '03406491-0e1d-4315-abd1-f840863d9d8b',
                },
            ],
        },
        componentArg: null,
        inputArgs: [
            [
                {
                    label: 'jj',
                    name: 'jj',
                    type: 'string',
                },
            ],
            [
                {
                    label: 's',
                    name: 's',
                    type: 'string',
                },
            ],
        ],
        outputArgs: [
            [
                {
                    label: 'y',
                    name: 'y',
                    type: 'string',
                    doc: '',
                },
            ],
        ],
        handleType: 'template',
        handle: [
            {
                '1_1': {
                    aaaaa: '找到了吗',
                    id: '1',
                    instanceId: '1',
                    outputhandlArg: {
                        label: 'opop',
                        name: 'opop',
                        type: 'string',
                        doc: '',
                        uiComponent: 'select',
                        isFixedValue: false,
                        allowEdit: true,
                    },
                    inputhandlArg: [
                        {
                            label: 'jj',
                            name: 'jj',
                            type: 'string',
                            doc: '',
                            uiComponent: 'select',
                            isFixedValue: false,
                            allowEdit: true,
                        },
                        {
                            type: 'undefined',
                            doc: '',
                            uiComponent: 'AutoComplete',
                            value: 'jj',
                            isFixedValue: true,
                            allowEdit: true,
                        },
                    ],
                    inputArgs: [
                        {
                            label: 'jj',
                            name: 'jj',
                            type: 'string',
                        },
                    ],
                    outputArgs: [
                        {
                            label: 'opop',
                            name: 'opop',
                            type: 'string',
                            doc: '',
                        },
                    ],
                    handle: 'add',
                    handleType: 'basicTask',
                    outputTask: {
                        '100_1': {
                            id: 100,
                            instanceId: '1',
                            handleType: 'processControl',
                            handle: 'processControlWaitAll',
                            inputArgs: [
                                {
                                    label: 'opopio',
                                    name: 'opopio',
                                    type: 'string',
                                    doc: '',
                                },
                            ],
                            inputTask: {
                                '1_1': {
                                    aaaaa: '找到了吗',
                                    id: '1',
                                    instanceId: '1',
                                    outputhandlArg: {
                                        label: 'opop',
                                        name: 'opop',
                                        type: 'string',
                                        doc: '',
                                        uiComponent: 'select',
                                        isFixedValue: false,
                                        allowEdit: true,
                                    },
                                    inputhandlArg: [
                                        {
                                            label: 'jj',
                                            name: 'jj',
                                            type: 'string',
                                            doc: '',
                                            uiComponent: 'select',
                                            isFixedValue: false,
                                            allowEdit: true,
                                        },
                                        {
                                            type: 'undefined',
                                            doc: '',
                                            uiComponent: 'AutoComplete',
                                            value: 'jj',
                                            isFixedValue: true,
                                            allowEdit: true,
                                        },
                                    ],
                                    inputArgs: [
                                        {
                                            label: 'jj',
                                            name: 'jj',
                                            type: 'string',
                                        },
                                    ],
                                    outputArgs: [
                                        {
                                            label: 'opop',
                                            name: 'opop',
                                            type: 'string',
                                            doc: '',
                                        },
                                    ],
                                    handle: 'add',
                                    handleType: 'basicTask',
                                },
                                '1_2': {
                                    bbbbbb: '艾',
                                    id: '1',
                                    instanceId: '2',
                                    outputhandlArg: {
                                        label: 'opopio',
                                        name: 'opopio',
                                        type: 'string',
                                        doc: '',
                                        uiComponent: 'select',
                                        isFixedValue: false,
                                        allowEdit: true,
                                    },
                                    inputhandlArg: [
                                        {
                                            label: 's',
                                            name: 's',
                                            type: 'string',
                                            doc: '',
                                            uiComponent: 'select',
                                            isFixedValue: false,
                                            allowEdit: true,
                                        },
                                        {
                                            type: 'undefined',
                                            doc: '',
                                            uiComponent: 'AutoComplete',
                                            value: 's',
                                            isFixedValue: true,
                                            allowEdit: true,
                                        },
                                    ],
                                    inputArgs: [
                                        {
                                            label: 's',
                                            name: 's',
                                            type: 'string',
                                        },
                                    ],
                                    outputArgs: [
                                        {
                                            label: 'opopio',
                                            name: 'opopio',
                                            type: 'string',
                                            doc: '',
                                        },
                                    ],
                                    handle: 'add',
                                    handleType: 'basicTask',
                                },
                            },
                            outputArgs: [
                                {
                                    label: 'rt',
                                    name: 'rt',
                                    type: 'string',
                                },
                            ],
                            outputTask: {
                                '4_1': {
                                    id: '4',
                                    instanceId: '1',
                                    outputhandlArg: {
                                        label: 'y',
                                        name: 'y',
                                        type: 'string',
                                        doc: '',
                                        uiComponent: 'select',
                                        isFixedValue: false,
                                        allowEdit: true,
                                    },
                                    inputhandlArg: [
                                        {
                                            label: 'rt',
                                            name: 'rt',
                                            type: 'string',
                                            doc: '',
                                            uiComponent: 'select',
                                            isFixedValue: false,
                                            allowEdit: true,
                                        },
                                        {
                                            type: 'undefined',
                                            doc: '',
                                            uiComponent: 'AutoComplete',
                                            value: 'rt',
                                            isFixedValue: true,
                                            allowEdit: true,
                                        },
                                    ],
                                    inputArgs: [
                                        {
                                            label: 'rt',
                                            name: 'rt',
                                            type: 'string',
                                        },
                                    ],
                                    outputArgs: [
                                        {
                                            label: 'y',
                                            name: 'y',
                                            type: 'string',
                                            doc: '',
                                        },
                                    ],
                                    handle: 'divide',
                                    handleType: 'basicTask',
                                    inputTask: {
                                        '100_1': {
                                            id: 100,
                                            instanceId: '1',
                                            handleType: 'processControl',
                                            handle: 'processControlWaitAll',
                                            inputArgs: [
                                                {
                                                    label: 'opopio',
                                                    name: 'opopio',
                                                    type: 'string',
                                                    doc: '',
                                                },
                                            ],
                                            inputTask: {
                                                '1_1': {
                                                    aaaaa: '找到了吗',
                                                    id: '1',
                                                    instanceId: '1',
                                                    outputhandlArg: {
                                                        label: 'opop',
                                                        name: 'opop',
                                                        type: 'string',
                                                        doc: '',
                                                        uiComponent: 'select',
                                                        isFixedValue: false,
                                                        allowEdit: true,
                                                    },
                                                    inputhandlArg: [
                                                        {
                                                            label: 'jj',
                                                            name: 'jj',
                                                            type: 'string',
                                                            doc: '',
                                                            uiComponent: 'select',
                                                            isFixedValue: false,
                                                            allowEdit: true,
                                                        },
                                                        {
                                                            type: 'undefined',
                                                            doc: '',
                                                            uiComponent: 'AutoComplete',
                                                            value: 'jj',
                                                            isFixedValue: true,
                                                            allowEdit: true,
                                                        },
                                                    ],
                                                    inputArgs: [
                                                        {
                                                            label: 'jj',
                                                            name: 'jj',
                                                            type: 'string',
                                                        },
                                                    ],
                                                    outputArgs: [
                                                        {
                                                            label: 'opop',
                                                            name: 'opop',
                                                            type: 'string',
                                                            doc: '',
                                                        },
                                                    ],
                                                    handle: 'add',
                                                    handleType: 'basicTask',
                                                },
                                                '1_2': {
                                                    bbbbbb: '艾',
                                                    id: '1',
                                                    instanceId: '2',
                                                    outputhandlArg: {
                                                        label: 'opopio',
                                                        name: 'opopio',
                                                        type: 'string',
                                                        doc: '',
                                                        uiComponent: 'select',
                                                        isFixedValue: false,
                                                        allowEdit: true,
                                                    },
                                                    inputhandlArg: [
                                                        {
                                                            label: 's',
                                                            name: 's',
                                                            type: 'string',
                                                            doc: '',
                                                            uiComponent: 'select',
                                                            isFixedValue: false,
                                                            allowEdit: true,
                                                        },
                                                        {
                                                            type: 'undefined',
                                                            doc: '',
                                                            uiComponent: 'AutoComplete',
                                                            value: 's',
                                                            isFixedValue: true,
                                                            allowEdit: true,
                                                        },
                                                    ],
                                                    inputArgs: [
                                                        {
                                                            label: 's',
                                                            name: 's',
                                                            type: 'string',
                                                        },
                                                    ],
                                                    outputArgs: [
                                                        {
                                                            label: 'opopio',
                                                            name: 'opopio',
                                                            type: 'string',
                                                            doc: '',
                                                        },
                                                    ],
                                                    handle: 'add',
                                                    handleType: 'basicTask',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            {
                '1_2': {
                    bbbbbb: '艾',
                    id: '1',
                    instanceId: '2',
                    outputhandlArg: {
                        label: 'opopio',
                        name: 'opopio',
                        type: 'string',
                        doc: '',
                        uiComponent: 'select',
                        isFixedValue: false,
                        allowEdit: true,
                    },
                    inputhandlArg: [
                        {
                            label: 's',
                            name: 's',
                            type: 'string',
                            doc: '',
                            uiComponent: 'select',
                            isFixedValue: false,
                            allowEdit: true,
                        },
                        {
                            type: 'undefined',
                            doc: '',
                            uiComponent: 'AutoComplete',
                            value: 's',
                            isFixedValue: true,
                            allowEdit: true,
                        },
                    ],
                    inputArgs: [
                        {
                            label: 's',
                            name: 's',
                            type: 'string',
                        },
                    ],
                    outputArgs: [
                        {
                            label: 'opopio',
                            name: 'opopio',
                            type: 'string',
                            doc: '',
                        },
                    ],
                    handle: 'add',
                    handleType: 'basicTask',
                    outputTask: {
                        '100_1': {
                            id: 100,
                            instanceId: '1',
                            handleType: 'processControl',
                            handle: 'processControlWaitAll',
                            inputArgs: [
                                {
                                    label: 'opopio',
                                    name: 'opopio',
                                    type: 'string',
                                    doc: '',
                                },
                            ],
                            inputTask: {
                                '1_1': {
                                    aaaaa: '找到了吗',
                                    id: '1',
                                    instanceId: '1',
                                    outputhandlArg: {
                                        label: 'opop',
                                        name: 'opop',
                                        type: 'string',
                                        doc: '',
                                        uiComponent: 'select',
                                        isFixedValue: false,
                                        allowEdit: true,
                                    },
                                    inputhandlArg: [
                                        {
                                            label: 'jj',
                                            name: 'jj',
                                            type: 'string',
                                            doc: '',
                                            uiComponent: 'select',
                                            isFixedValue: false,
                                            allowEdit: true,
                                        },
                                        {
                                            type: 'undefined',
                                            doc: '',
                                            uiComponent: 'AutoComplete',
                                            value: 'jj',
                                            isFixedValue: true,
                                            allowEdit: true,
                                        },
                                    ],
                                    inputArgs: [
                                        {
                                            label: 'jj',
                                            name: 'jj',
                                            type: 'string',
                                        },
                                    ],
                                    outputArgs: [
                                        {
                                            label: 'opop',
                                            name: 'opop',
                                            type: 'string',
                                            doc: '',
                                        },
                                    ],
                                    handle: 'add',
                                    handleType: 'basicTask',
                                },
                                '1_2': {
                                    bbbbbb: '艾',
                                    id: '1',
                                    instanceId: '2',
                                    outputhandlArg: {
                                        label: 'opopio',
                                        name: 'opopio',
                                        type: 'string',
                                        doc: '',
                                        uiComponent: 'select',
                                        isFixedValue: false,
                                        allowEdit: true,
                                    },
                                    inputhandlArg: [
                                        {
                                            label: 's',
                                            name: 's',
                                            type: 'string',
                                            doc: '',
                                            uiComponent: 'select',
                                            isFixedValue: false,
                                            allowEdit: true,
                                        },
                                        {
                                            type: 'undefined',
                                            doc: '',
                                            uiComponent: 'AutoComplete',
                                            value: 's',
                                            isFixedValue: true,
                                            allowEdit: true,
                                        },
                                    ],
                                    inputArgs: [
                                        {
                                            label: 's',
                                            name: 's',
                                            type: 'string',
                                        },
                                    ],
                                    outputArgs: [
                                        {
                                            label: 'opopio',
                                            name: 'opopio',
                                            type: 'string',
                                            doc: '',
                                        },
                                    ],
                                    handle: 'add',
                                    handleType: 'basicTask',
                                },
                            },
                            outputArgs: [
                                {
                                    label: 'rt',
                                    name: 'rt',
                                    type: 'string',
                                },
                            ],
                            outputTask: {
                                '4_1': {
                                    id: '4',
                                    instanceId: '1',
                                    outputhandlArg: {
                                        label: 'y',
                                        name: 'y',
                                        type: 'string',
                                        doc: '',
                                        uiComponent: 'select',
                                        isFixedValue: false,
                                        allowEdit: true,
                                    },
                                    inputhandlArg: [
                                        {
                                            label: 'rt',
                                            name: 'rt',
                                            type: 'string',
                                            doc: '',
                                            uiComponent: 'select',
                                            isFixedValue: false,
                                            allowEdit: true,
                                        },
                                        {
                                            type: 'undefined',
                                            doc: '',
                                            uiComponent: 'AutoComplete',
                                            value: 'rt',
                                            isFixedValue: true,
                                            allowEdit: true,
                                        },
                                    ],
                                    inputArgs: [
                                        {
                                            label: 'rt',
                                            name: 'rt',
                                            type: 'string',
                                        },
                                    ],
                                    outputArgs: [
                                        {
                                            label: 'y',
                                            name: 'y',
                                            type: 'string',
                                            doc: '',
                                        },
                                    ],
                                    handle: 'divide',
                                    handleType: 'basicTask',
                                    inputTask: {
                                        '100_1': {
                                            id: 100,
                                            instanceId: '1',
                                            handleType: 'processControl',
                                            handle: 'processControlWaitAll',
                                            inputArgs: [
                                                {
                                                    label: 'opopio',
                                                    name: 'opopio',
                                                    type: 'string',
                                                    doc: '',
                                                },
                                            ],
                                            inputTask: {
                                                '1_1': {
                                                    aaaaa: '找到了吗',
                                                    id: '1',
                                                    instanceId: '1',
                                                    outputhandlArg: {
                                                        label: 'opop',
                                                        name: 'opop',
                                                        type: 'string',
                                                        doc: '',
                                                        uiComponent: 'select',
                                                        isFixedValue: false,
                                                        allowEdit: true,
                                                    },
                                                    inputhandlArg: [
                                                        {
                                                            label: 'jj',
                                                            name: 'jj',
                                                            type: 'string',
                                                            doc: '',
                                                            uiComponent: 'select',
                                                            isFixedValue: false,
                                                            allowEdit: true,
                                                        },
                                                        {
                                                            type: 'undefined',
                                                            doc: '',
                                                            uiComponent: 'AutoComplete',
                                                            value: 'jj',
                                                            isFixedValue: true,
                                                            allowEdit: true,
                                                        },
                                                    ],
                                                    inputArgs: [
                                                        {
                                                            label: 'jj',
                                                            name: 'jj',
                                                            type: 'string',
                                                        },
                                                    ],
                                                    outputArgs: [
                                                        {
                                                            label: 'opop',
                                                            name: 'opop',
                                                            type: 'string',
                                                            doc: '',
                                                        },
                                                    ],
                                                    handle: 'add',
                                                    handleType: 'basicTask',
                                                },
                                                '1_2': {
                                                    bbbbbb: '艾',
                                                    id: '1',
                                                    instanceId: '2',
                                                    outputhandlArg: {
                                                        label: 'opopio',
                                                        name: 'opopio',
                                                        type: 'string',
                                                        doc: '',
                                                        uiComponent: 'select',
                                                        isFixedValue: false,
                                                        allowEdit: true,
                                                    },
                                                    inputhandlArg: [
                                                        {
                                                            label: 's',
                                                            name: 's',
                                                            type: 'string',
                                                            doc: '',
                                                            uiComponent: 'select',
                                                            isFixedValue: false,
                                                            allowEdit: true,
                                                        },
                                                        {
                                                            type: 'undefined',
                                                            doc: '',
                                                            uiComponent: 'AutoComplete',
                                                            value: 's',
                                                            isFixedValue: true,
                                                            allowEdit: true,
                                                        },
                                                    ],
                                                    inputArgs: [
                                                        {
                                                            label: 's',
                                                            name: 's',
                                                            type: 'string',
                                                        },
                                                    ],
                                                    outputArgs: [
                                                        {
                                                            label: 'opopio',
                                                            name: 'opopio',
                                                            type: 'string',
                                                            doc: '',
                                                        },
                                                    ],
                                                    handle: 'add',
                                                    handleType: 'basicTask',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
    },
];
if (!localStorage.getItem('allTemplatedata')) {
    localStorage.setItem('allTemplatedata', JSON.stringify(initialallTemplatedata));
}
export const addTemplatedata = (data: any[], { doc, briefName }: { doc: any; briefName: any }) => {
    let allTemplatedata = JSON.parse(localStorage.getItem('allTemplatedata') || '[]');
    const templatedata = createTemplateObj(data, { doc, briefName });
    if (allTemplatedata) allTemplatedata.push(templatedata);
    localStorage.setItem('allTemplatedata', JSON.stringify(allTemplatedata));
};
export const getAllTemplatedata = () => {
    return JSON.parse(localStorage.getItem('allTemplatedata') || '[]');
};
localStorage.setItem('allstructureData', JSON.stringify({}));
export const addstructureData = (res: any) => {
    let allstructureData = JSON.parse(localStorage.getItem('allstructureData') || '');
    allstructureData = { ...allstructureData, ...res };
    localStorage.setItem('allstructureData', JSON.stringify(allstructureData));
};
export const getStructureData = (id: string | number) => {
    let allstructureData = JSON.parse(localStorage.getItem('allstructureData') || '');
    if (allstructureData) return allstructureData[id];
};
function createTemplateObj(NodeData: any[], { doc, briefName }: { doc: any; briefName: any }) {
    let id = getTemplateId();
    let instanceId = getTemplateInstanceId(id);
    const renderNodeData = Array.isArray(NodeData) ? selectAreadata2RendernodeData(NodeData) : NodeData;
    const structureData = Array.isArray(NodeData)
        ? renderNodeData2templatestructure(NodeData, false)
        : renderNodeData2templatestructure(NodeData, true);
    const inputTasks = Object.values(structureData).filter((item) => item.inputTask === undefined);
    const outputTasks = Object.values(structureData).filter((item) => item.outputTask === undefined);
    const inputArgs = inputTasks.map((item) => item.inputArgs);
    const handle = inputTasks.map((item) => ({ [`${item.id}_${item.instanceId}`]: item }));
    const outputArgs = outputTasks.map((item) => item.outputArgs);
    let templateobj = {
        id,
        instanceId,
        doc: doc,
        briefName: briefName,
        renderNodeData: renderNodeData,
        componentArg: null, //模板组件的配置参数
        inputArgs,
        outputArgs,
        handleType: 'template',
        handle: handle,
    };
    addstructureData(structureData);
    return templateobj;
}

export function selectAreadata2RendernodeData(selectAreaArray: any[]) {
    debugger;
    let nodes: { id: any; type: any; height: any; width: any; x: any; y: any; properties: { [key: string]: any }; children?: any[],nodetype?:string }[] = [],
        edges: { id: string; type: any; sourceNodeId: any; targetNodeId: any }[] = [];
    const offsetx = selectAreaArray.find((item) => item.BaseType === 'node').x - 100;
    const offsety = selectAreaArray.find((item) => item.BaseType === 'node').y - 100;
    selectAreaArray.forEach(
        (item: {
            children: any;
            BaseType: string;
            properties: { [x: string]: any };
            id: any;
            type: any;
            _height: any;
            _width: any;
            x: any;
            y: any;
            sourceNodeId: any;
            targetNodeId: any;
        }) => {
            if (item.BaseType === 'node') {
                let newPropertiesobj: { [key: string]: any } = {};
                for (let key in item.properties) {
                    newPropertiesobj[key] = item.properties[key];
                }
                if (item.children) {
                    nodes.push({
                        id: item.id,
                        type: item.type,
                        height: item._height,
                        width: item._width,
                        x: item.x - offsetx,
                        y: item.y - offsety,
                        properties: newPropertiesobj,
                        children: item.children,
                        nodetype:'group'
                    });
                } else {
                    nodes.push({
                        id: item.id,
                        type: item.type,
                        height: item._height,
                        width: item._width,
                        x: item.x - offsetx,
                        y: item.y - offsety,
                        properties: newPropertiesobj,
                    });
                }
            }
            if (item.BaseType === 'edge') {
                edges.push({
                    id: item.id,
                    type: item.type,
                    sourceNodeId: item.sourceNodeId,
                    targetNodeId: item.targetNodeId,
                });
            }
        }
    );
    return {
        nodes,
        edges,
    };
}

function selectAreaobj2templatestructure(data) {
    const { edges, nodes } = data;
    let res = {};
    let havetargetNodes: any[] = [];
    let haveSourceNodes: any[] = [];
    edges.forEach((item) => {
        if (havetargetNodes.indexOf(item.sourceNodeId) < 0) {
            havetargetNodes.push(item.sourceNodeId);
        }
    });
    edges.forEach((item) => {
        if (haveSourceNodes.indexOf(item.targetNodeId) < 0) {
            haveSourceNodes.push(item.targetNodeId);
        }
    });
    let sourceNodes = nodes.filter((item) => haveSourceNodes.indexOf(item.id) < 0);
    let targetNodes = nodes.filter((item) => havetargetNodes.indexOf(item.id) < 0);
    solveAllTargetnodes(data, sourceNodes, res);
    solveAllSourcenodes(data, targetNodes, res);
    return res;
}
export function renderNodeData2templatestructure(data: any, hasStartFlag: boolean) {
    if (hasStartFlag) {
        return graphdataobj2templatestructure(data);
    } else {
        const temp = {
            edges: [
                {
                    type: 'polyline',
                    sourceNodeId: 'rect_2',
                    targetNodeId: 'control_1',
                },
                {
                    type: 'polyline',
                    sourceNodeId: 'rect_3',
                    targetNodeId: 'control_1',
                },
                {
                    type: 'polyline',
                    sourceNodeId: 'control_1',
                    targetNodeId: 'rect_4',
                },
            ],
            nodes: [
                {
                    id: 'rect_2',
                    type: 'task',
                    height: 320,
                    width: 400,
                    x: 380,
                    y: 340,
                    properties: {
                        aaaaa: '找到了吗',
                        id: '1',
                        instanceId: '1',
                        outputhandlArg: {
                            label: 'opop',
                            name: 'opop',
                            type: 'string',
                            doc: '',
                            uiComponent: 'select',
                            isFixedValue: false,
                            allowEdit: true,
                        },
                        inputhandlArg: [
                            {
                                label: 'jj',
                                name: 'jj',
                                type: 'string',
                                doc: '',
                                uiComponent: 'select',
                                isFixedValue: false,
                                allowEdit: true,
                            },
                            {
                                type: 'undefined',
                                doc: '',
                                uiComponent: 'AutoComplete',
                                value: 'jj',
                                isFixedValue: true,
                                allowEdit: true,
                            },
                        ],
                        inputArgs: [
                            {
                                label: 'jj',
                                name: 'jj',
                                type: 'string',
                            },
                        ],
                        outputArgs: [
                            {
                                label: 'opop',
                                name: 'opop',
                                type: 'string',
                                doc: '',
                            },
                        ],
                        handle: 'add',
                        handleType: 'basicTask',
                    },
                },
                {
                    id: 'rect_3',
                    type: 'task',
                    height: 320,
                    width: 400,
                    x: 880,
                    y: 340,
                    properties: {
                        bbbbbb: '艾',
                        id: '1',
                        instanceId: '2',
                        outputhandlArg: {
                            label: 'opopio',
                            name: 'opopio',
                            type: 'string',
                            doc: '',
                            uiComponent: 'select',
                            isFixedValue: false,
                            allowEdit: true,
                        },
                        inputhandlArg: [
                            {
                                label: 's',
                                name: 's',
                                type: 'string',
                                doc: '',
                                uiComponent: 'select',
                                isFixedValue: false,
                                allowEdit: true,
                            },
                            {
                                type: 'undefined',
                                doc: '',
                                uiComponent: 'AutoComplete',
                                value: 's',
                                isFixedValue: true,
                                allowEdit: true,
                            },
                        ],
                        inputArgs: [
                            {
                                label: 's',
                                name: 's',
                                type: 'string',
                            },
                        ],
                        outputArgs: [
                            {
                                label: 'opopio',
                                name: 'opopio',
                                type: 'string',
                                doc: '',
                            },
                        ],
                        handle: 'add',
                        handleType: 'basicTask',
                    },
                },
                {
                    id: 'rect_4',
                    type: 'task',
                    height: 320,
                    width: 400,
                    x: 680,
                    y: 1040,
                    properties: {
                        id: '4',
                        instanceId: '1',
                        outputhandlArg: {
                            label: 'y',
                            name: 'y',
                            type: 'string',
                            doc: '',
                            uiComponent: 'select',
                            isFixedValue: false,
                            allowEdit: true,
                        },
                        inputhandlArg: [
                            {
                                label: 'rt',
                                name: 'rt',
                                type: 'string',
                                doc: '',
                                uiComponent: 'select',
                                isFixedValue: false,
                                allowEdit: true,
                            },
                            {
                                type: 'undefined',
                                doc: '',
                                uiComponent: 'AutoComplete',
                                value: 'rt',
                                isFixedValue: true,
                                allowEdit: true,
                            },
                        ],
                        inputArgs: [
                            {
                                label: 'rt',
                                name: 'rt',
                                type: 'string',
                            },
                        ],
                        outputArgs: [
                            {
                                label: 'y',
                                name: 'y',
                                type: 'string',
                                doc: '',
                            },
                        ],
                        handle: 'divide',
                        handleType: 'basicTask',
                    },
                },
                {
                    id: 'control_1',
                    type: 'processControlWaitAll',
                    height: 80,
                    width: 100,
                    x: 680,
                    y: 720,
                    properties: {
                        id: 100,
                        instanceId: '1',
                        handleType: 'processControl',
                        handle: 'processControlWaitAll',
                    },
                },
            ],
        };
        // const NodeDatap=selectAreadata2CommonNodeData(data)
        // return selectAreaobj2templatestructure(NodeDatap);
        return selectAreaobj2templatestructure(temp);
    }
}
function selectAreadata2CommonNodeData(selectAreadata: any[]) {
    let nodes: { id: any; type: any; properties: { [key: string]: any } }[] = [],
        edges: { id: string; type: any; sourceNodeId: any; targetNodeId: any }[] = [];
    selectAreadata.forEach(
        (item: {
            BaseType: string;
            properties: { [x: string]: any };
            id: any;
            type: any;
            _height: any;
            _width: any;
            x: any;
            y: any;
            sourceNodeId: any;
            targetNodeId: any;
        }) => {
            if (item.BaseType === 'node') {
                let newPropertiesobj: { [key: string]: any } = {};
                for (let key in item.properties) {
                    newPropertiesobj[key] = item.properties[key];
                }
                nodes.push({
                    id: item.id,
                    type: item.type,
                    properties: newPropertiesobj,
                });
            }
            if (item.BaseType === 'edge') {
                edges.push({
                    id: item.id,
                    type: item.type,
                    sourceNodeId: item.sourceNodeId,
                    targetNodeId: item.targetNodeId,
                });
            }
        }
    );
    return {
        nodes,
        edges,
    };
}
