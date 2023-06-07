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
export interface TaskIOArgs {
    label: string; //参数显示    在ui上面的名称
    name: string; //参数名称，实际代码解析时候的名称
    type: string; //参数类型，用于ui显示和判断参数是否正确
    doc: string; //参数文档，这里就是一句话就行
}
export interface componentArgs {
    label: string; //参数显示在ui上面的名称
    name: string; //参数名称，实际代码解析时候的名称
    type: string; //参数类型
    doc: string; //参数文档，这里就是一句话就行
    uiComponent: string; //显示参数配置组件的名称，如按钮，输入框，开关等对应的英文
    uiArgs: string; //ui参数的一些配置，如长宽，颜色，圆角等,json字符串
    value: string; //参数的值，json字符串
    allowEdit: boolean; //如果为true，则显示在最外层，如果为false，则不显示
}
export interface TaskBindArgs {
    [paramsName: string]: TaskIOArgs;
}
export interface Task {
    [templateinstanceIdOrTaskinstanceId: string]: basicTaskDefine | template | processControlDefine;
}
export interface IdBind {
    [instanceId: string]: string;
}
export interface basicTaskDefine {
    id: string;
    instanceId: string; //运用改任务计算方式的一个
    inputArgs: TaskBindArgs;
    outputArgs: TaskBindArgs;
    inputTask: Task;
    outputTask: Task;
    handle: string; //输入、参数作为handle的输入，输出会赋值给output所有的输入,如果是componentDefine的id，则调用对应处理器，如果是基础组件如add，则使用基础运算
}
export interface template {
    id: string; //当前解析器模板的唯一id
    instanceId: string; //当前解析器唯一id-+
    doc: string; //文档markdown格式，到时候用一个markdown解析器来显示
    briefName: string;
    args: componentArgs[]; //参数数组
    inputArgs: TaskBindArgs;
    outputArgs: TaskBindArgs;
    inputTask: Task;
    outputTask: Task;
    handOutputIdBindOutputId: IdBind;
    statusId: string; //前端通过状态id查找对应的状态卡片，id->ui，需要手动编写各种组建的状态卡片，这个需求应该挺少，一般顶层组件可能需要
    status: string; //状态卡片的参数，从输入输出和配置项拿，会不断地传给子节点，去丰富状态，json字符串，如果是业务系统中非配置页面，则只展示状态卡片
    handle: Task; //输入、参数作为handle的输入，输出会赋值给output所有的输入,如果是componentDefine的id，则调用对应处理器，如果是基础组件如add，则使用基础运算
}
export interface processControlDefine {
    id: string;
    instanceId: string; //运用改任务计算方式的一个
    inputArgs: TaskBindArgs;
    outputArgs: TaskBindArgs;
    inputTask: Task;
    outputTask: Task;
    handle: 'waitany' | 'wait all';
}
