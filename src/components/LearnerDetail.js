import { useState, useEffect } from "react";
import {
  Spin,
  Alert,
  Tag,
  Button,
  Descriptions,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Empty,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  BookOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  IdcardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import { useParams, useNavigate } from "react-router-dom";

const LearnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [learner, setLearner] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchLearner = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`/api/learners/${id}`, { headers });
        setLearner(res.data);

        // Fetch contacts
        try {
          const contactsRes = await axios.get(`/api/learners/${id}/contacts`, { headers });
          setContacts(contactsRes.data || []);
        } catch {
          setContacts([]);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Learner not found.");
        } else {
          setError("Failed to load learner details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLearner();
  }, [id]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/learners/${id}`, { headers });
      message.success("Learner deleted successfully");
      navigate("/learners");
    } catch (err) {
      message.error("Failed to delete learner");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <Alert message={error} type="error" showIcon style={{ margin: 20 }} />
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/learners")}>
          Back to Learners
        </Button>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{ color: "#fff" }} />}
            onClick={() => navigate("/learners")}
            style={{ color: "#fff", padding: "4px 8px" }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>
              <UserOutlined style={{ marginRight: 8 }} />
              {learner?.firstName} {learner?.lastName}
            </h2>
            <p style={{ margin: "4px 0 0" }}>
              {learner?.grade && `Grade ${learner.grade}`}
              {learner?.gender && ` • ${learner.gender}`}
              {learner?.idNumber && ` • ID: ${learner.idNumber}`}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="action-row" style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/learners/edit/${id}`)}
          style={{ borderRadius: 8 }}
        >
          Edit Learner
        </Button>
        <Popconfirm
          title="Delete this learner?"
          description="This action cannot be undone."
          onConfirm={handleDelete}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <Button danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }}>
            Delete
          </Button>
        </Popconfirm>
      </div>

      {/* Quick Tags */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {learner?.isActive != null && (
          <Tag color={learner.isActive ? "green" : "red"}>
            {learner.isActive ? "Active" : "Inactive"}
          </Tag>
        )}
        {learner?.grade && <Tag color="blue">Grade {learner.grade}</Tag>}
        {learner?.gender && (
          <Tag color={learner.gender === "MALE" ? "geekblue" : "magenta"}>
            {learner.gender}
          </Tag>
        )}
        {learner?.needsMentor && <Tag color="orange">Needs Mentor</Tag>}
      </div>

      {/* Personal Information */}
      <div className="page-card">
        <h3><IdcardOutlined style={{ marginRight: 6 }} /> Personal Information</h3>
        <Descriptions
          column={isMobile ? 1 : 2}
          size="small"
          bordered
          labelStyle={{ fontWeight: 600, fontSize: 12, background: "#fafafa" }}
          contentStyle={{ fontSize: 13 }}
        >
          <Descriptions.Item label="First Name">{learner?.firstName || "—"}</Descriptions.Item>
          <Descriptions.Item label="Last Name">{learner?.lastName || "—"}</Descriptions.Item>
          <Descriptions.Item label="ID Number">{learner?.idNumber || "—"}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">{learner?.dateOfBirth || "—"}</Descriptions.Item>
          <Descriptions.Item label="Gender">
            {learner?.gender ? (
              <Tag color={learner.gender === "MALE" ? "geekblue" : "magenta"}>{learner.gender}</Tag>
            ) : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {learner?.status || (learner?.isActive ? "Active" : "Inactive")}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Academic Information */}
      <div className="page-card">
        <h3><BookOutlined style={{ marginRight: 6 }} /> Academic Information</h3>
        <Descriptions
          column={isMobile ? 1 : 2}
          size="small"
          bordered
          labelStyle={{ fontWeight: 600, fontSize: 12, background: "#fafafa" }}
          contentStyle={{ fontSize: 13 }}
        >
          <Descriptions.Item label="Grade">
            {learner?.grade ? <Tag color="blue">Grade {learner.grade}</Tag> : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Class Name">{learner?.className || "—"}</Descriptions.Item>
          <Descriptions.Item label="School Institution" span={2}>
            {learner?.schoolInstitution?.officialInstitutionName || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="School" span={2}>
            {learner?.school?.name || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Programme Interests" span={2}>
            {learner?.programmeInterests || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Needs Mentor">
            {learner?.needsMentor ? <Tag color="orange">Yes</Tag> : <Tag>No</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Contact Information */}
      <div className="page-card">
        <h3><PhoneOutlined style={{ marginRight: 6 }} /> Contact Information</h3>
        <Descriptions
          column={isMobile ? 1 : 2}
          size="small"
          bordered
          labelStyle={{ fontWeight: 600, fontSize: 12, background: "#fafafa" }}
          contentStyle={{ fontSize: 13 }}
        >
          <Descriptions.Item label="Cell Number">{learner?.cellNumber || "—"}</Descriptions.Item>
          <Descriptions.Item label="Email">
            {learner?.email ? <a href={`mailto:${learner.email}`}>{learner.email}</a> : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Residential Address" span={2}>
            {learner?.residentialAddress || "—"}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Linked Contacts */}
      <div className="page-card">
        <h3><TeamOutlined style={{ marginRight: 6 }} /> Linked Contacts</h3>
        {contacts.length === 0 ? (
          <Empty description="No linked contacts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Row gutter={[12, 12]}>
            {contacts.map((contact) => (
              <Col xs={24} sm={12} key={contact.id}>
                <Card
                  size="small"
                  style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}
                  styles={{ body: { padding: 12 } }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                    {contact.firstName} {contact.lastName}
                  </div>
                  {contact.relationship && (
                    <Tag color="purple" style={{ fontSize: 11, marginBottom: 4 }}>
                      {contact.relationship}
                    </Tag>
                  )}
                  {contact.cellNumber && (
                    <div style={{ fontSize: 12, color: "#666" }}>
                      <PhoneOutlined style={{ marginRight: 4 }} />
                      {contact.cellNumber}
                    </div>
                  )}
                  {contact.email && (
                    <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                      <MailOutlined style={{ marginRight: 4 }} />
                      {contact.email}
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Metadata */}
      <div className="page-card">
        <h3><CalendarOutlined style={{ marginRight: 6 }} /> Record Info</h3>
        <Descriptions
          column={isMobile ? 1 : 2}
          size="small"
          bordered
          labelStyle={{ fontWeight: 600, fontSize: 12, background: "#fafafa" }}
          contentStyle={{ fontSize: 13 }}
        >
          <Descriptions.Item label="Date Created">{learner?.dateCreated || "—"}</Descriptions.Item>
          <Descriptions.Item label="Captured By">{learner?.capturedBy || "—"}</Descriptions.Item>
        </Descriptions>
      </div>

      {/* Back */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/learners")}
          style={{ borderRadius: 8 }}
        >
          Back to All Learners
        </Button>
      </div>
    </div>
  );
};

export default LearnerDetail;
