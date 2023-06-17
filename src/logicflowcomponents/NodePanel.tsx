import { addAndgetProcessControlId, addAndgetTaskId, addAndgetTemplateId, addProcessControlObj,  getBasicTaskId,  getProcessControlObj,  getTemplateInstanceId } from '../tools/genTypeObj';
import styles from './Nodepanel.module.css';
import LogicFlow from '@logicflow/core';

interface nodeType {
    style: string;
    text: string;
    type: string;
}
interface nodeListType {
    nodeList: nodeType[];
    LFinstanceobj: LogicFlow | null;
}

export default function NodePanel({ nodeList, LFinstanceobj }: nodeListType) {
    const dragNode = (item: nodeType) => {
        if (!LFinstanceobj) return;
        if (item.type == 'selectArea') {
            LFinstanceobj.extension.selectionSelect.openSelectionSelect();
            return;
        }
        else if (item.type == 'processControlWaitAny' || item.type == 'processControlWaitAll') {
            let id=addAndgetProcessControlId()
            LFinstanceobj.dnd.startDrag({
                type: item.type,
                properties: {
                    id: id+'',
                    handleType: 'processControl',
                    handle: item.type,
                    outputTask:[],
                    inputTask:[]
                },
            });
        }
        else if (item.type == 'task') {
            LFinstanceobj.dnd.startDrag({
                type: item.type,
                properties: {
                    id: addAndgetTaskId() + '',
                    handleType: 'task',
                    outputTask:[],
                    inputTask:[]
                },
            });
        }
        else if(item.type =='templateGroup') {
            let id=addAndgetTemplateId()
            LFinstanceobj.dnd.startDrag({
                type: item.type,
                properties: {
                    id,
                    instanceId: getTemplateInstanceId(id),
                    handleType: 'template',
                    handle: item.type,
                    outputTask:[],
                    inputTask:[]
                },
            });
        }
        else {
            LFinstanceobj.dnd.startDrag({
                type: item.type,
            });
        }
    };
    return (
        <>
            {nodeList.map((item: nodeType, index) => (
                <div onMouseDown={() => dragNode(item)} className={styles.itemwrapper} key={index}>
                    <div className={styles[item.style] + ' ' + styles['node-item-icon']}></div>
                    <span>{item.text}</span>
                </div>
            ))}
        </>
    );
}
