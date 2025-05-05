import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Upload,
  message,
  Button,
  Spin,
  Modal,
  Form,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import defaultImage from "../images/vyg.jpg";
import "../styles/SettingNations.css";

const { confirm } = Modal;

const SettingNations = () => {
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newNationName, setNewNationName] = useState("");
  const [newNationImage, setNewNationImage] = useState(null);

  useEffect(() => {
    fetchNations();
  }, []);

  const fetchNations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:2025/api/nations");
      setNations(res.data);
    } catch (err) {
      message.error("Failed to fetch nations.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditName = (index, value) => {
    const updated = [...nations];
    updated[index].nation = value;
    setNations(updated);
  };

  const updateNationName = async (id, name) => {
    try {
      await axios.put(`http://localhost:2025/api/nations/${id}/name`, {
        nation: name,
      });
      message.success(`Nation name updated`);
      fetchNations();
    } catch (error) {
      console.error("Failed to update nation name:", error);
      message.error("Failed to update nation name.");
    }
  };

  const handleImageUpload = async (file, index) => {
    const nation = nations[index];
    const formData = new FormData();
    formData.append("nation", JSON.stringify({ nation: nation.nation }));
    formData.append("imageFile", file);

    try {
      setUploadingId(nation.id);
      await axios.put(`http://localhost:2025/api/nations/${nation.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = [...nations];
      updated[index].imageUrl = URL.createObjectURL(file);
      updated[index].file = file;
      setNations(updated);

      message.success("Image updated successfully!");
    } catch (err) {
      message.error("Image update failed");
    } finally {
      setUploadingId(null);
    }

    return false;
  };

  const confirmDelete = (nationId, nationName) => {
    confirm({
      title: `Are you sure you want to delete '${nationName}'?`,
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      onOk: () => {
        return new Promise((resolve, reject) => {
          handleDelete(nationId)
            .then(resolve)
            .catch(reject);
        });
      },
    });
  };

  const handleDelete = async (nationId) => {
    try {
      // const response = await axios.delete(`http://localhost:2025/api/nations/${nationId}`);
      setNations(nations.filter((n) => n.id !== nationId));
      message.success(`Deleted nation with ID: ${nationId}`);
    } catch (err) {
      console.error("Failed to delete nation:", err);
      message.error("Failed to delete nation.");
    }
  };

  const handleCreateNation = async () => {
    if (!newNationName || !newNationImage) {
      return message.warning("Please provide a name and select an image");
    }

    const formData = new FormData();
    formData.append("nation", JSON.stringify({ nation: newNationName }));
    formData.append("imageFile", newNationImage);

    try {
      setCreating(true);
      await axios.post("http://localhost:2025/api/nations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchNations();

      setNewNationName("");
      setNewNationImage(null);
      message.success("Nation created successfully!");
      setIsModalVisible(false);
    } catch (err) {
      message.error("Failed to create nation.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="setting-nations-wrapper">
      <div className="setting-nations-inner">
        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Create Nation
          </Button>
        </div>

        <Modal
          title="Create Nation"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setNewNationName("");
            setNewNationImage(null);
          }}
          onOk={handleCreateNation}
          okText="Create"
          confirmLoading={creating}
        >
          <Form layout="vertical">
            <Form.Item label="Nation Name">
              <Input
                value={newNationName}
                onChange={(e) => setNewNationName(e.target.value)}
                placeholder="Enter nation name"
              />
            </Form.Item>
            <Form.Item label="Upload Image">
              <Upload
                beforeUpload={(file) => {
                  setNewNationImage(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Select Image</Button>
                {newNationImage && (
                  <div style={{ marginTop: 8 }}>{newNationImage.name}</div>
                )}
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            {nations.map((nation, idx) => (
              <Col
                key={nation.id}
                xs={24}
                sm={24}
                md={12}
                lg={8}
                className="nation-card-col"
              >
                <Card
                  className="nation-card"
                  hoverable
                  cover={
                    <img
                      alt={nation.nation}
                      src={`http://localhost:2025/api/nations/${nation.id}/image`}
                      onError={(e) => (e.target.src = defaultImage)}
                      style={{ height: 200, objectFit: "cover", width: "100%" }}
                    />
                  }
                  title={
                    <div className="nation-card-header" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Input
                        value={nation.nation}
                        onChange={(e) => handleEditName(idx, e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => updateNationName(nation.id, nation.nation)}
                      >
                        Save
                      </Button>
                    </div>
                  }
                  actions={[
                    <Upload
                      beforeUpload={(file) => handleImageUpload(file, idx)}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />} loading={uploadingId === nation.id}>
                        Upload Image
                      </Button>
                    </Upload>,
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      disabled={uploadingId === nation.id}
                      onClick={() => confirmDelete(nation.id, nation.nation)}
                    >
                      Delete
                    </Button>,
                  ]}
                />
              </Col>
            ))}
          </Row>
        </Spin>
      </div>
    </div>
  );
};

export default SettingNations;
