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
        LFinstanceobj.dnd.startDrag({
            type: item.type,
        });
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
