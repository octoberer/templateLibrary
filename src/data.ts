import { basicTaskDefine } from './define';

interface ComponentType {
    nodeId: string;
    ComponentType: 'processControlWaitAny' | 'processControlWaitAll';
    properties: { [key: string]: any } | undefined;
}

export let currentChoseComponent: ComponentType = {
    nodeId: '',
    ComponentType: 'processControlWaitAny',
    properties: undefined,
};
export const allProcessComponent: { [key: string]: ComponentType } = {};



