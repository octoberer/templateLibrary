import { basicMethods } from '../define';

export const getBasicTaskId = (selectmethod: any) => {
    switch (selectmethod) {
        case 'add':
            return 1;
        case 'sub':
            return 2;
        case 'multipy':
            return 3;
        case 'divide':
            return 4;
        case 'modular':
            return 5;
        case 'power':
            return 6;
        case 'extractAroot':
            return 7;
        case 'Equalto':
            return 8;
        case 'outweight':
            return 9;
        case 'less':
            return 10;
        case 'atLeast':
            return 11;
        case 'atMost':
            return 12;
        case 'notEqualto':
            return 13;
        default:
            return 14;
    }
};
export const getProcessControlTaskId = (selectmethod: any) => {
    switch (selectmethod) {
        case 'processControlWaitAll':
            return 100;
        case 'processControlWaitAny':
            return 101;
        default:
            return 100;
    }
};
if (!localStorage.getItem('initialTaskIdObj')) {
    localStorage.setItem('initialTaskIdObj', JSON.stringify({ 1: 1, 3: 1, 14: 1 }));
}
let initialTaskIdObjstr = localStorage.getItem('initialTaskIdObj') as string;
let initialIdObj = JSON.parse(initialTaskIdObjstr);

export const getTaskinstanceId = (selectmethod: number) => {
    const id = getBasicTaskId(selectmethod);
    if (initialIdObj[id] != undefined) {
        initialIdObj[id]++;
    } else {
        initialIdObj[id] = 1;
    }
    localStorage.setItem('initialTaskIdObj', JSON.stringify(initialIdObj));
    return initialIdObj[id];
};
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
if (!localStorage.getItem('initialTemplateId')) {
    localStorage.setItem('initialTemplateId', '1001');
}
let initialTemplateId = localStorage.getItem('initialTemplateId') || '0';
export const getTemplateId = () => {
    initialTemplateId = parseInt(initialTemplateId) + 1 + '';
    return initialTemplateId;
};
if (!localStorage.getItem('TemplateInstanceIdobj')) {
    localStorage.setItem('initialTemplateInstanceIdobj', JSON.stringify({ 1000: 1 }));
}
let str = localStorage.getItem('initialTemplateInstanceIdobj') as string;
let TemplateInstanceIdobj = JSON.parse(str);

export const getTemplateInstanceId = (id: number) => {
    if (TemplateInstanceIdobj[id] != undefined) {
        TemplateInstanceIdobj[id]++;
    } else {
        TemplateInstanceIdobj[id] = 1;
    }
    localStorage.setItem('initialTemplateInstanceIdobj', JSON.stringify(TemplateInstanceIdobj));
    return TemplateInstanceIdobj[id];
};
