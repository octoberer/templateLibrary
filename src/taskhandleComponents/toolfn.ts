import { basicMethods } from "../define";

export const convertToSymbol = (selectmethod: any) => {
    switch (selectmethod) {
        case 'add':
            return '➕';
        case 'sub':
            return '➖';
        case 'multipy':
            return '✖';
        case 'divide':
            return '➗';
        case 'modular':
            return '%';
        case 'power':
            return '^';
        case 'extractAroot':
            return '开根';
        case 'Equalto':
            return '==';
        case 'outweight':
            return '＞';
        case 'less':
            return '＜';
        case 'atLeast':
            return '≥';
        case 'atMost':
            return '≤';
        case 'notEqualto':
            return '≠';
        default:
            return '➕';
    }
};
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
let initialId:{[key:string]:number} = {};
for (let item of basicMethods) {
    initialId[item.name] = 1;
}
export const getBasicTaskinstanceId = (selectmethod: any) => {
    // 请求后端得来，这里由自增长得来
    initialId[selectmethod]++;
    return initialId[selectmethod];
};
export const getcomponentArgObj=({paramsName,uiComponent,isFixedValue,value})=>{
    return {
        label: paramsName,
        name:paramsName,
        type:typeof paramsName,
        doc:'',
        uiComponent,
        value,
        isFixedValue,
        allowEdit:true
    }
}
export const getTaskIOArg=({param,doc})=>{
    return {
        label:param,
        name:param,
        type:typeof param,
        doc
    }
}
