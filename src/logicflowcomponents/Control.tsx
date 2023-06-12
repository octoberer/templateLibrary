import { Button } from 'antd/es/radio';
import { addTemplatedata, allTemplatedata, graphdataobj2templatestructure } from '../tools/data';
import LogicFlow from '@logicflow/core';
import { getTemplateId, getTemplateInstanceId } from '../tools/genTypeObj';
import { Avatar, Card, Drawer, Modal } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import Meta from 'antd/es/card/Meta';

export default function Control({ LFinstanceobj }: { LFinstanceobj: LogicFlow | null }) {
    const saveAsTemplate = () => {
        // 生成一个模板对象
        let id = getTemplateId();
        let templateObj = {
            id,
            instanceId: getTemplateInstanceId(id),
            structureData: graphdataobj2templatestructure(LFinstanceobj?.getGraphData()),
            graphdata: LFinstanceobj?.getGraphData(),
        };
        addTemplatedata(templateObj);
    };
    const importTemplate = () => {
        // allTemplatedata;
        showDrawer();
    };
    const [modalopen, setModalopen] = useState(false);

    const showModal = () => {
      setModalopen(true);
    };
  
    const hideModal = () => {
      setModalopen(false);
    };
    const handleOk = () => {
      setModalopen(false);
    };
  
    const handleCancel = () => {
      setModalopen(false);
    };
    const [open, setOpen] = useState(false);

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };
    return (
        <div>
            <Button onClick={saveAsTemplate}>存储为模板</Button>
            <Button onClick={()=>{showModal()}}>引入模板</Button>
            <Drawer width={'80vw'} title="选择模板" placement="right" onClose={onClose} open={open}>
                {allTemplatedata.map((item) => (
                    <Card
                        style={{ width: 300 }}
                        cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                        actions={[<SettingOutlined key="setting" />, <EditOutlined key="edit" />, <EllipsisOutlined key="ellipsis" />]}
                    >
                        <Meta
                            avatar={<Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel" />}
                            title="Card title"
                            description="This is the description"
                        />
                    </Card>
                ))}
            </Drawer>
            <Modal title="Modal" open={modalopen} onOk={handleOk} onCancel={handleCancel} okText="确认" cancelText="取消">
                <p>Bla bla ...</p>
                <p>Bla bla ...</p>
                <p>Bla bla ...</p>
            </Modal>
        </div>
    );
}
