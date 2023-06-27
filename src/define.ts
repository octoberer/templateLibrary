//基础函数:
//计算类:加，减，乘，除，求余数，n次方，开n次方，求平均数，最大值，最小值，中位数，大于，小于，等于，大于等于，小于等于，不等于
//流程类:异步all(输入都到达), 异步any（任意输入到达）
//执行类:暂时用console.log打印代替执行
export const basicMethods = [
    {
        label: '相加',
        name: 'add',
    },
    {
        label: '相减',
        name: 'sub',
    },
    {
        label: '相乘',
        name: 'multipy',
    },
    {
        label: '相除',
        name: 'divide',
    },
    {
        label: '求余数',
        name: 'modular',
    },
    {
        label: '乘方',
        name: 'power',
    },
    {
        label: '开方',
        name: 'extractAroot',
    },
    {
        label: '求和',
        name: 'sum',
    },
    {
        label: '求平均数',
        name: 'Averaging',
    },
    {
        label: '最大值',
        name: 'max',
    },
    {
        label: '最小值',
        name: 'min',
    },
    {
        label: '中位数',
        name: 'median',
    },
    {
        label: '等于',
        name: 'Equalto',
    },
    {
        label: '大于',
        name: 'outweight',
    },
    {
        label: '小于',
        name: 'less',
    },
    {
        label: '大于等于',
        name: 'atLeast',
    },
    {
        label: '小于等于',
        name: 'atMost',
    },
    {
        label: '不等于',
        name: 'notEqualto',
    },
];
//============基础任务相关
// 》》》定义该任务具体的操作输入输出，多个输入对应多个输出
interface handleArg {
    label: string; //参数显示在ui上面的名称
    name: string; //参数名称，实际代码解析时候的名称
    type: string; //参数数据类型
    doc: string; //参数文档，这里就是一句话就行‘
    uiComponent: string; //显示参数配置组件的名称，如按钮，输入框，开关等对应的英文
    value: string | undefined; //如果是阈值，或开n次方的n在这定义；如是输入参数，此值为undefined
    isFixedValue: boolean; //说明是否在输入参数中选择而出
    editable: boolean; //定义存储后，可否修改
}
// 》》》定义该任务的输入输出的参数的具体信息
interface TaskIOArg {
    label: string; //参数显示    在ui上面的名称
    name: string; //参数名称，实际代码解析时候的名称
    type: string; //参数类型，用于ui显示和判断参数是否正确
    doc: string; //参数文档，这里就是一句话就行
}
// 》》》定义以参数名字为键的所有输入参数/输出参数
interface TaskBindArgs {
    [paramsName: string]: TaskIOArg;
}
interface handleBindArgs {
    [paramsName: string]: handleArg;
}
type templateId = string;
type templateTaskInstanceKey = string;
type basicTaskId = string;

type templateTaskId = templateId | templateTaskInstanceKey;
type templateTaskKeyOrbasicTaskId = string;
export interface basicTaskDefine {
    id: string;
    instanceId: string;
    inputTaskKeys: templateConnectTaskObjDefine[];
    outputTaskKeys: templateConnectTaskObjDefine[];
    handleType: 'task';
    outputhandlArg: handleBindArgs;
    inputhandlArg: handleBindArgs;
    inputArgs: TaskBindArgs;
    outputArgs: TaskBindArgs;
    handle: string; //输入、参数作为handle的输入，输出会赋值给output所有的输入,如果是componentDefine的id，则调用对应处理器，如果是基础组件如add，则使用基础运算
    x?: number;
    y?: number;
}

//============模板相关
interface EditHandlArgsdefine {
    [basicTaskDefineInstanceid: string]: handleArg;
}
export interface templateComponentArgDefine {
    label: string; //主题名字
    name: string; //主题名称，实际代码解析时候的名称
    editHandlArgs: EditHandlArgsdefine;
}
export interface IdBind {
    [instanceId: string]: string;
}

export interface templateConnectTaskObjDefine {
    sourceId: basicTaskId;
    sourceRelations: templateTaskId[];
    targetId: basicTaskId;
    targetRelations: templateTaskId[];
}

export interface templateDefine {
    id: string; //当前解析器模板的唯一id
    doc: string; //文档markdown格式，到时候用一个markdown解析器来显示
    briefName: string;
    componentArg?: templateComponentArgDefine; //模板组件的配置参数
    statusId: string; //前端通过状态id查找对应的状态卡片，id->ui，需要手动编写各种组建的状态卡片，这个需求应该挺少，一般顶层组件可能需要
    status: string; //状态卡片的参数，从输入输出和配置项拿，会不断地传给子节点，去丰富状态，json字符串，如果是业务系统中非配置页面，则只展示状态卡片
    handleType: 'templateGroup';
    handle: templateTaskKeyOrbasicTaskId[]; //输入、参数作为handle的输入，输出会赋值给output所有的输入,如果是componentDefine的id，则调用对应处理器，如果是基础组件如add，则使用基础运算
    memoChildren: templateTaskKeyOrbasicTaskId[];
}
export interface templateTaskDefine {
    id: string; //当前解析器模板的唯一id
    instanceId: string; //当前解析器唯一id-+
    inputTaskKeys: templateConnectTaskObjDefine[];
    outputTaskKeys: templateConnectTaskObjDefine[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

export interface processControlDefine {
    id: string;
    handle: 'processControlWaitAny' | 'processControlWaitAll';
    handleType: 'processControlWaitAny' | 'processControlWaitAll';
}
export interface processControlTaskDefine {
    id: string;
    instanceId: string;
    inputTaskKeys: templateConnectTaskObjDefine[];
    outputTaskKeys: templateConnectTaskObjDefine[];
    inputArgs: TaskBindArgs;
    outputArgs: TaskBindArgs;
    x?: number;
    y?: number;
}
