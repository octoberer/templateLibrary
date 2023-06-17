export const initialallTemplatedata = [
    // {
    //     id: 1000,
    //     instanceId: 1,
    //     doc: '1',
    //     briefName: 'start',
    //     componentArg: null,
    //     handleType: 'templateGroup',
    //     handle: ['1_1', '3_1'],
    //     memoChildren: ['1_1', '3_1', '14_1'],
    //     inputTask: {},
    //     outputTask: {},
    //     gen: false,
    // },
];
export const initialRes = {};
// export const initialRes = {
//     '1002': {
//         id: '1002',
//         doc: '',
//         briefName: '1',
//         handleType: 'templateGroup',
//         handle: ['1_2'],
//         statusId: '',
//         status: '',
//         memoChildren: [],
//     },
//     '1_2': {
//         id: '1',
//         instanceId: '2',
//         outputhandlArg: {
//             label: 'hh',
//             name: 'hh',
//             type: 'string',
//             doc: '',
//             uiComponent: 'select',
//             isFixedValue: false,
//             allowEdit: true,
//         },
//         inputhandlArg: [
//             {
//                 label: 'jj',
//                 name: 'jj',
//                 type: 'string',
//                 doc: '',
//                 uiComponent: 'select',
//                 isFixedValue: false,
//                 allowEdit: true,
//             },
//             {
//                 type: 'undefined',
//                 doc: '',
//                 uiComponent: 'AutoComplete',
//                 value: 'zz',
//                 isFixedValue: true,
//                 allowEdit: true,
//             },
//         ],
//         inputArgs: [
//             {
//                 label: 'jj',
//                 name: 'jj',
//                 type: 'string',
//             },
//             {
//                 label: 'zz',
//                 name: 'zz',
//                 type: 'string',
//             },
//         ],
//         outputArgs: [
//             {
//                 label: 'hh',
//                 name: 'hh',
//                 type: 'string',
//                 doc: '',
//             },
//         ],
//         handle: 'add',
//         handleType: 'task',
//         inputTask: [],
//         outputTask: ['7_1'],
//     },
//     '7_1': {
//         id: '7',
//         instanceId: '1',
//         outputhandlArg: {
//             label: 'res',
//             name: 'res',
//             type: 'string',
//             doc: '',
//             uiComponent: 'select',
//             isFixedValue: false,
//             allowEdit: true,
//         },
//         inputhandlArg: [
//             {
//                 label: 'oppo',
//                 name: 'oppo',
//                 type: 'string',
//                 doc: '',
//                 uiComponent: 'select',
//                 isFixedValue: false,
//                 allowEdit: true,
//             },
//             {
//                 label: '45',
//                 name: '45',
//                 type: 'string',
//                 doc: '',
//                 uiComponent: 'Input',
//                 isFixedValue: false,
//                 allowEdit: true,
//             },
//         ],
//         inputArgs: [
//             {
//                 label: 'oppo',
//                 name: 'oppo',
//                 type: 'string',
//             },
//         ],
//         outputArgs: [
//             {
//                 label: 'res',
//                 name: 'res',
//                 type: 'string',
//                 doc: '',
//             },
//         ],
//         handle: 'extractAroot',
//         handleType: 'task',
//         inputTask: ['1_2'],
//         outputTask: [],
//     },
// };
// export const initialRes = {
//     '1_1': {
//         gen:false,
//         id: '1',
//         instanceId: '1',
//         outputhandlArg: {
//             label: 'opop',
//             name: 'opop',
//             type: 'string',
//             doc: '',
//             uiComponent: 'select',
//             isFixedValue: false,
//             allowEdit: true,
//         },
//         inputhandlArg: [
//             {
//                 label: 'jj',
//                 name: 'jj',
//                 type: 'string',
//                 doc: '',
//                 uiComponent: 'select',
//                 isFixedValue: false,
//                 allowEdit: true,
//             },
//             {
//                 label: '2',
//                 name: '2',
//                 type: 'string',
//                 doc: '',
//                 uiComponent: 'AutoComplete',
//                 isFixedValue: false,
//                 allowEdit: true,
//             },
//         ],
//         inputArgs: [
//             {
//                 label: 'jj',
//                 name: 'jj',
//                 type: 'string',
//             },
//         ],
//         outputArgs: [
//             {
//                 label: 'opop',
//                 name: 'opop',
//                 type: 'string',
//                 doc: '',
//             },
//         ],
//         handle: 'add',
//         handleType: 'task',
//         inputTask: [],
//         outputTask: ['14_1'],
//         parId:'1000_1'
//     },
//     '14_1': {
//         nodeSize: {
//             width: 417,
//             height: 355,
//         },
//         parId:'1000_1',
//         id: '14',
//         instanceId: '1',
//         outputhandlArg: {
//             label: 'end',
//             name: 'end',
//             type: 'string',
//             doc: '',
//             uiComponent: 'select',
//             isFixedValue: false,
//             allowEdit: true,
//         },
//         inputhandlArg: [
//             [
//                 {
//                     label: 'res',
//                     name: 'res',
//                     type: 'string',
//                     doc: '',
//                     uiComponent: 'selectmultiple',
//                     isFixedValue: false,
//                     allowEdit: true,
//                 },
//                 {
//                     label: 'opop',
//                     name: 'opop',
//                     type: 'string',
//                     doc: '',
//                     uiComponent: 'selectmultiple',
//                     isFixedValue: false,
//                     allowEdit: true,
//                 },
//             ],
//         ],
//         inputArgs: [
//             {
//                 label: 'res',
//                 name: 'res',
//                 type: 'string',
//             },
//             {
//                 label: 'opop',
//                 name: 'opop',
//                 type: 'string',
//             },
//         ],
//         outputArgs: [
//             {
//                 label: 'end',
//                 name: 'end',
//                 type: 'string',
//                 doc: '',
//             },
//         ],
//         handle: 'sum',
//         handleType: 'task',
//         inputTask: ['1_1', '3_1'],
//         outputTask: [],
//         parId: '1000_1',
//         gen:false,
//     },
//     '3_1': {
//         parId:'1000_1',
//         id: '3',
//         instanceId: '1',
//         gen:false,
//         outputhandlArg: {
//             label: 'res',
//             name: 'res',
//             type: 'string',
//             doc: '',
//             uiComponent: 'select',
//             isFixedValue: false,
//             allowEdit: true,
//         },
//         inputhandlArg: [
//             {
//                 label: 'rt',
//                 name: 'rt',
//                 type: 'string',
//                 doc: '',
//                 uiComponent: 'select',
//                 isFixedValue: false,
//                 allowEdit: true,
//             },
//             {
//                 label: '4',
//                 name: '4',
//                 type: 'string',
//                 doc: '',
//                 uiComponent: 'AutoComplete',
//                 isFixedValue: false,
//                 allowEdit: true,
//             },
//         ],
//         inputArgs: [
//             {
//                 label: 'rt',
//                 name: 'rt',
//                 type: 'string',
//             },
//         ],
//         outputArgs: [
//             {
//                 label: 'res',
//                 name: 'res',
//                 type: 'string',
//                 doc: '',
//             },
//         ],
//         handle: 'multipy',
//         handleType: 'task',
//         inputTask: [],
//         outputTask: ['14_1'],
//     },
//     '1000_1': {
//         gen:false,
//         id: 1000,
//         instanceId: 1,
//         doc: '1',
//         briefName: 'start',
//         componentArg: null,
//         handleType: 'templateGroup',
//         handle: ['1_1', '3_1'],
//         memoChildren: ['1_1', '3_1', '14_1'],
//         inputTask: {},
//         outputTask: {},
//     },
// };
export const tempGraphrenderData = {
    nodes: [
        {
            id: 'fc9b2fe8-7a14-47a6-bd28-69ec450ff5e6',
            type: 'task',
            x: 440,
            y: 220,
           
        },
        {
            id: 'e9c9f765-3264-48d8-85d2-e9eb08977b16',
            type: 'task',
            x: 1000,
            y: 200,
            
        },
        {
            id: '69c18d94-e455-4b95-9c6e-d7806a22ff96',
            type: 'task',
            x: 1360,
            y: 560,
        },
        {
            id: '3989ed05-31be-4cee-ade5-9b5a36d58825',
            type: 'processControlWaitAll',
            x: 740,
            y: 540,
            properties: {
                id: '100',
                instanceId: 1,
                handleType: 'processControl',
                handle: 'processControlWaitAll',
                outputTask: [],
                inputTask: [],
            },
            text: {
                x: 740,
                y: 540,
                value: 'processControlWaitAny',
            },
        },
    ],
    edges: [
        {
            id: '65a393b2-c295-44dd-8fb2-deefd204b670',
            type: 'polyline',
            sourceNodeId: 'fc9b2fe8-7a14-47a6-bd28-69ec450ff5e6',
            targetNodeId: '3989ed05-31be-4cee-ade5-9b5a36d58825',
            startPoint: {
                x: 440,
                y: 380,
            },
            endPoint: {
                x: 740,
                y: 480,
            },
            properties: {},
            pointsList: [
                {
                    x: 440,
                    y: 380,
                },
                {
                    x: 440,
                    y: 450,
                },
                {
                    x: 740,
                    y: 450,
                },
                {
                    x: 740,
                    y: 480,
                },
            ],
        },
        {
            id: 'cb89faa4-a7bf-494f-a8ce-a5a4230e2e6f',
            type: 'polyline',
            sourceNodeId: 'e9c9f765-3264-48d8-85d2-e9eb08977b16',
            targetNodeId: '3989ed05-31be-4cee-ade5-9b5a36d58825',
            startPoint: {
                x: 1000,
                y: 360,
            },
            endPoint: {
                x: 740,
                y: 480,
            },
            properties: {},
            pointsList: [
                {
                    x: 1000,
                    y: 360,
                },
                {
                    x: 1000,
                    y: 450,
                },
                {
                    x: 740,
                    y: 450,
                },
                {
                    x: 740,
                    y: 480,
                },
            ],
        },
        {
            id: '900ae38c-2d7d-4831-80f9-ab68dad5df98',
            type: 'polyline',
            sourceNodeId: '3989ed05-31be-4cee-ade5-9b5a36d58825',
            targetNodeId: '69c18d94-e455-4b95-9c6e-d7806a22ff96',
            startPoint: {
                x: 860,
                y: 540,
            },
            endPoint: {
                x: 1160,
                y: 560,
            },
            properties: {},
            pointsList: [
                {
                    x: 860,
                    y: 540,
                },
                {
                    x: 1010,
                    y: 540,
                },
                {
                    x: 1010,
                    y: 560,
                },
                {
                    x: 1160,
                    y: 560,
                },
            ],
        },
    ],
};
