import { useState, useEffect } from "react";
import {
  Spin,
  Alert,
  Tag,
  Button,
  Descriptions,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import {
  BookOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  GlobalOutlined,
  BankOutlined,
  TeamOutlined,
  AimOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import { useParams, useNavigate } from "react-router-dom";

const SchoolInstitutionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSchool = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`/api/school-institutions/${id}`, { headers });
        setSchool(res.data);
      } catch (err) {
        console.error("Failed to fetch school:", err);
        if (err.response?.status === 404) {
          setError("School not found.");
        } else {
          setError("Failed to load school details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [id]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/school-institutions/${id}`, { headers });
      message.success("School deleted successfully");
      navigate("/school-institutions");
    } catch (err) {
      console.error("Delete failed:", err);
      message.error("Failed to delete school");
    }
  };

  const getPhaseColor = (phase) => {
    if (!phase) return "default";
    const p = phase.toLowerCase();
    if (p.includes("primary")) return "blue";
    if (p.includes("secondary")) return "purple";
    if (p.includes("combined")) return "cyan";
    if (p.includes("intermediate")) return "orange";
    return "default";
  };

  const getSectorColor = (sector) => {
    if (!sector) return "default";
    return sector.toUpperCase() === "PUBLIC" ? "green" : "gold";
  };

  const getQuintileColor = (q) => {
    if (!q) return "default";
    const num = parseInt(q);
    if (num <= 1) return "red";
    if (num <= 2) return "orange";
    if (num <= 3) return "gold";
    if (num <= 4) return "blue";
    return "green";
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/school-institutions")}>
          Back to Schools
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
            onClick={() => navigate("/school-institutions")}
            style={{ color: "#fff", padding: "4px 8px" }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>
              <BookOutlined style={{ marginRight: 8 }} />
              {school?.officialInstitutionName || "School Details"}
            </h2>
            <p style={{ margin: "4px 0 0" }}>
              {school?.natEmis && `EMIS: ${school.natEmis}`}
              {school?.sector && ` • ${school.sector}`}
              {school?.phase && ` • ${school.phase}`}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-row" style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/school-institutions/edit/${id}`)}
          style={{ borderRadius: 8 }}
        >
          Edit School
        </Button>
        <Popconfirm
          title="Delete this school?"
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
        {school?.sector && <Tag color={getSectorColor(school.sector)} style={{ fontSize: 12 }}>{school.sector}</Tag>}
        {school?.phase && <Tag color={getPhaseColor(school.phase)} style={{ fontSize: 12 }}>{school.phase}</Tag>}
        {school?.quintile && <Tag color={getQuintileColor(school.quintile)} style={{ fontSize: 12 }}>Quintile {school.quintile}</Tag>}
        {school?.urbanRural && (
          <Tag color={school.urbanRural?.toLowerCase() === "urban" ? "geekblue" : "lime"} style={{ fontSize: 12 }}>
            {school.urbanRural}
          </Tag>
        )}
      </div>

      {/* General Information */}
      <div className="page-card">
        <h3><BankOutlined style={{ marginRight: 6 }} /> General Information</h3>
        <Descriptions
          column={isMobile ? 1 : 2}
          size="small"
          bordered
          labelStyle={{ fontWeight: 600, fontSize: 12, background: "#fafafa" }}
          contentStyle={{ fontSize: 13 }}
        >
          <Descriptions.Item label="Official Name">
            {school?.officialInstitutionName || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="NAT EMIS">
            {school?.natEmis || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Sector">
            {school?.sector ? <Tag color={getSectorColor(school.sector)}>{school.sector}</Tag> : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Phase">
            {school?.phase ? <Tag color={getPhaseColor(school.phase)}>{school.phase}</Tag> : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Quintile">
            {school?.quintile || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Urban / Rural">
            {school?.urbanRural || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {school?.status || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Exam Number">
            {school?.examNumber || "—"}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Location Information */}
      <div className="page-card">
        <h3><EnvironmentOutlined style={{ marginRight: 6 }} /> Location</h3>
        <Descriptions
          column={isMobile ? 1 : 2}
          size="small"
          bordered
          labelStyle={{ fontWeight: 600, fontSize: 12, background: "#fafafa" }}
          contentStyle={{ fontSize: 13 }}
        >
          <Descriptions.Item label="Province">
            {school?.province || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="District">
            {school?.district || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Circuit">
            {school?.circuit || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Town / City">
            {school?.townCity || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Street Address" span={2}>
            {school?.streetAddress || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Postal Address" span={2}>
            {school?.postalAddress || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Latitude">
            {school?.latitude || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Longitude">
            {school?.longitude || "—"}
          </Descriptions.Item>
        </Descriptions>

        {/* Map preview if coordinates exist */}
        {school?.latitude && school?.longitude && (
          <div style={{ marginTop: 16, borderRadius: 12, overflow: "hidden" }}>
            <iframe
              title="School Location"
              width="100%"
              height={isMobile ? 180 : 240}
              frameBorder="0"
              style={{ border: 0, display: "block" }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${school.longitude - 0.01},${school.latitude - 0.008},${school.longitude + 0.01},${school.latitude + 0.008}&layer=mapnik&marker=${school.latitude},${school.longitude}`}
              allowFullScreen
            />
          </div>
        )}
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
          <Descriptions.Item label="Telephone">
            {school?.telephone || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Fax">
            {school?.fax || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={2}>
            {school?.email ? (
              <a href={`mailto:${school.email}`}>{school.email}</a>
            ) : "—"}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Additional Details */}
      <div className="page-card">
        <h3><TeamOutlined style={{ marginRight: 6 }} /> Additional Details</h3>
        <Descriptions
          column={isMobile ? 1 : 2}
          size="small"
          bordered
          labelStyle={{ fontWeight: 600, fontSize: 12, background: "#fafafa" }}
          contentStyle={{ fontSize: 13 }}
        >
          <Descriptions.Item label="Total Learners">
            {school?.totalLearners != null ? school.totalLearners.toLocaleString() : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Total Educators">
            {school?.totalEducators != null ? school.totalEducators.toLocaleString() : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Registration Date">
            {school?.registrationDate || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Year of Data">
            {school?.yearOfData || "—"}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Back button at bottom */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/school-institutions")}
          style={{ borderRadius: 8 }}
        >
          Back to All Schools
        </Button>
      </div>
    </div>
  );
};

export default SchoolInstitutionDetail;
