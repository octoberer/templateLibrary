import ReactDOM from 'react-dom';
import { HtmlResize } from '@logicflow/extension';
import PossessControlUI from '../innerComponents/ProcessControlUI';
import ProcessControlUI from '../innerComponents/ProcessControlUI';
import { h } from '@logicflow/core';

export default function getregisterProcessControlobj(lf: LogicFlow) {
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
            this.width = 300;
            this.height = 300;
            this.text.draggable = false;
        }
        getNodeStyle() {
            const style = super.getNodeStyle();
            style.fill = '#f1a131';
            style.strokeWidth = 1;
            return style;
        }
    }
    class ResizableTaskView extends HtmlResize.view {
        // getResizeShape() {
        //     debugger
        //     const { model } = this.props;
        //     const { x, y, width, height, radius } = model;
        //     const style = model.getNodeStyle();
        //     return h('g', {}, [
        //         h('rect', {
        //             ...style,
        //             x: x - width / 2,
        //             y: y - height / 2,
        //             rx: radius,
        //             ry: radius,
        //             width,
        //             height: width,
        //         }),
        //     ]);
        // }
        setHtml(rootEl: HTMLElement) {
            const { properties } = this.props.model;
            console.log(properties.name);
            ReactDOM.render(<ProcessControlUI />, rootEl);
            // ReactDOM.render(<div />, rootEl);
        }
    }

    return {
        type: 'ProcessControl',
        view: ResizableTaskView,
        model: ResizeTaskModel,
    };
}
