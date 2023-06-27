// 生成指定数据格式的对象的所有方法

export const getcomponentArgObj = ({ paramsName, uiComponent, isFixedValue, value }) => {
    return {
        label: paramsName,
        name: paramsName,
        type: typeof paramsName,
        doc: '',
        uiComponent,
        value,
        isFixedValue,
        allowEdit: true,
    };
};
export const getTaskIOArg = ({ param, doc }) => {
    return {
        label: param,
        name: param,
        type: typeof param,
        doc,
    };
};

