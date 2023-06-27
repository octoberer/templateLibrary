import { DiamondResize } from '@logicflow/extension';

export default function getregisterProcessControlWaitAnyobj() {
    class ResizableDiamondModel extends DiamondResize.model {
        constructor(data: any, graphModel: any) {
            super(data, graphModel);
        }
        initNodeData(data: any) {
            super.initNodeData(data);
            this.text.draggable = false;
            this.text.editable=false
            this.text.value='processControlWaitAny'
            this.rx=120
            this.ry=60
        }
        getNodeStyle() {
            const style = super.getNodeStyle();
            style.fill = 'green';
            style.strokeWidth = 1;
            return style;
        }
    }
    class ResizableDiamondView extends DiamondResize.view {}

    return {
        type: 'processControlWaitAny',
        view: ResizableDiamondView,
        model: ResizableDiamondModel,
    };
}
