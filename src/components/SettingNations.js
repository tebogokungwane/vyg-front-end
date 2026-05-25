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
import axios from "../utils/axios";
import defaultImage from "../images/vyg.jpg";
import "../styles/SettingNations.css";
const baseURL = axios.defaults.baseURL;

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
      const res = await axios.get( `/api/nations`);
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
    const token = localStorage.getItem("token");
    
    try {
      await axios.put(
        `/api/nations/${id}/name`,
        { nation: name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      message.success("Nation name updated");
      fetchNations();
    } catch (error) {
      console.error("Failed to update nation name:", error);
      message.error("Failed to update nation name.");
    }
  };

  const handleImageUpload = async (file, index) => {
    const nation = nations[index];
    const formData = new FormData();
    formData.append("nationName", JSON.stringify({ nation: nation.nation }));
    formData.append("imageFile", file);

    try {
      setUploadingId(nation.id);
      await axios.put(`/api/nations/${nation.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Force refresh the image by appending a cache-busting timestamp
      const updated = [...nations];
      updated[index].imageTimestamp = Date.now();
      updated[index].imageName = "uploaded"; // Mark as having an image
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
      await axios.delete(`/api/nations/${nationId}`);
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
    formData.append("nationName", JSON.stringify({ nation: newNationName }));
    formData.append("imageFile", newNationImage);

    try {
      setCreating(true);
      await axios.post( `/api/nations`, formData, {
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
        <div style={{ textAlign: "right", marginBottom: 100 }}>
          <div className="create-button-wrapper">
            {/* Full-size button for large screens */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              className="create-button-large"
            >
              Create Nation
            </Button>

            {/* FAB button for small screens */}
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<PlusOutlined />}
              className="fab-button"
              onClick={() => setIsModalVisible(true)}
              title="Create Nation"
            />
          </div>
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
                      src={nation.imageName
                        ? `${baseURL}/api/nations/${nation.id}/image?t=${nation.imageTimestamp || ''}`
                        : defaultImage}
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