import ReactDOM from 'react-dom/client';
import { HtmlResize } from '@logicflow/extension';
import TaskUI from '../innerComponents/TaskUI';

export default function getregisterTaskobj(lf: LogicFlow) {
    class ResizeTaskModel extends HtmlResize.model {
        constructor(data: any, graphModel: any) {
            super(data, graphModel);
            this.menu = [
                {
                    className: 'lf-menu-delete',
                    text: '删除',
                    callback(node) {
                        // const comfirm = window.confirm('你确定要删除吗？')
                        lf.deleteNode(node.id);
                    },
                },
                {
                    text: '编辑',
                    className: 'lf-menu-item',
                    callback(node) {
                        lf.editText(node.id);
                    },
                },
                {
                    text: '复制',
                    className: 'lf-menu-item',
                    callback(node) {
                        lf.cloneNode(node.id);
                    },
                },
            ];
        }
        initNodeData(data: any) {
            super.initNodeData(data);
            this.width = 400;
            this.height = 320;
            this.text.draggable = false;
            this.text.editable = false;
        }
        getNodeStyle() {
            const style = super.getNodeStyle();
            style.fill = '#f1a131';
            style.strokeWidth = 1;
            return style;
        }
    }
    class ResizableTaskView extends HtmlResize.view {
        isMounted: boolean;
        constructor(props: any) {
            super(props);
            this.isMounted = false;
        }
        setHtml(rootEl: HTMLElement) {
            if (!this.isMounted) {
                this.isMounted = true;
                const root = ReactDOM.createRoot(rootEl);
                root.render(<TaskUI loginflowInstance={lf}/>);
            }
        }
    }

    return {
        type: 'task',
        view: ResizableTaskView,
        model: ResizeTaskModel,
    };
}
