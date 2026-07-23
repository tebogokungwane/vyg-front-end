import { useState, useEffect, useContext } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Spin,
  message,
  InputNumber,
  Row,
  Col,
  Switch,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  IdcardOutlined,
  BookOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const LearnerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ grades: [] });
  const [schoolInstitutions, setSchoolInstitutions] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const isEdit = Boolean(id);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load filter options (grades)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get("/api/learners/filters", { headers });
        setFilters(res.data);
      } catch (err) {
        console.error("Failed to load filters:", err);
      }
    };
    fetchFilters();
  }, []);

  // Load school institutions for dropdown
  useEffect(() => {
    const fetchSchoolInstitutions = async () => {
      setSchoolsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get("/api/school-institutions/all", { headers });
        setSchoolInstitutions(res.data || []);
      } catch (err) {
        console.error("Failed to load school institutions:", err);
      } finally {
        setSchoolsLoading(false);
      }
    };
    fetchSchoolInstitutions();
  }, []);

  // Load existing learner for edit
  useEffect(() => {
    if (!isEdit) return;
    const fetchLearner = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`/api/learners/${id}`, { headers });
        const data = res.data;
        form.setFieldsValue({
          ...data,
          dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
          schoolInstitutionId: data.schoolInstitution?.id || null,
          schoolId: data.school?.id || null,
        });
      } catch (err) {
        message.error("Failed to load learner data.");
        navigate("/learners");
      } finally {
        setLoading(false);
      }
    };
    fetchLearner();
  }, [id, isEdit, form, navigate]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
        capturedBy: values.capturedBy || `${user?.name || ""} ${user?.surname || ""}`.trim(),
      };

      // Remove fields that aren't part of the request DTO
      delete payload.schoolInstitution;
      delete payload.school;
      delete payload.dateCreated;

      if (isEdit) {
        await axios.put(`/api/learners/${id}`, payload, { headers });
        message.success("Learner updated successfully!");
      } else {
        await axios.post("/api/learners", payload, { headers });
        message.success("Learner created successfully!");
      }
      navigate("/learners");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Something went wrong";
      message.error(typeof errorMsg === "string" ? errorMsg : "Failed to save learner.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{ color: "#fff" }} />}
            onClick={() => navigate("/learners")}
            style={{ color: "#fff", padding: "4px 8px" }}
          />
          <div>
            <h2 style={{ margin: 0 }}>
              <UserOutlined style={{ marginRight: 8 }} />
              {isEdit ? "Edit Learner" : "Add New Learner"}
            </h2>
            <p style={{ margin: "4px 0 0" }}>
              {isEdit ? "Update learner information" : "Register a new learner"}
            </p>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
        size="large"
        initialValues={{ isActive: true, needsMentor: false }}
      >
        {/* Personal Information */}
        <div className="page-card">
          <h3><IdcardOutlined style={{ marginRight: 6 }} /> Personal Information</h3>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: "Please enter first name" }]}
              >
                <Input placeholder="e.g. Thabo" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: "Please enter last name" }]}
              >
                <Input placeholder="e.g. Molefe" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="ID Number" name="idNumber">
                <Input placeholder="SA ID number (13 digits)" maxLength={13} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Date of Birth" name="dateOfBirth">
                <DatePicker
                  style={{ width: "100%", borderRadius: 8 }}
                  placeholder="Select date of birth"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Gender" name="gender">
                <Select placeholder="Select gender" allowClear style={{ borderRadius: 8 }}>
                  <Option value="MALE">Male</Option>
                  <Option value="FEMALE">Female</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Active" name="isActive" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Academic Information */}
        <div className="page-card">
          <h3><BookOutlined style={{ marginRight: 6 }} /> Academic Information</h3>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Grade" name="grade">
                <Select placeholder="Select grade" allowClear showSearch style={{ borderRadius: 8 }}>
                  {filters.grades?.length > 0 ? (
                    filters.grades.map((g) => (
                      <Option key={g} value={g}>Grade {g}</Option>
                    ))
                  ) : (
                    <>
                      {[...Array(12)].map((_, i) => (
                        <Option key={i + 1} value={String(i + 1)}>Grade {i + 1}</Option>
                      ))}
                      <Option value="R">Grade R</Option>
                    </>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Class Name" name="className">
                <Input placeholder="e.g. 10A, 8B" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="School Institution" name="schoolInstitutionId">
                <Select
                  placeholder="Search school institution..."
                  allowClear
                  showSearch
                  loading={schoolsLoading}
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ borderRadius: 8 }}
                >
                  {schoolInstitutions.map((si) => (
                    <Option key={si.id} value={si.id}>
                      {si.officialInstitutionName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="School ID" name="schoolId">
                <InputNumber
                  placeholder="School ID (if applicable)"
                  style={{ width: "100%", borderRadius: 8 }}
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Programme Interests" name="programmeInterests">
                <TextArea
                  placeholder="e.g. Science, Mathematics, Arts"
                  rows={2}
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Needs Mentor" name="needsMentor" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Contact Information */}
        <div className="page-card">
          <h3><PhoneOutlined style={{ marginRight: 6 }} /> Contact Information</h3>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Cell Number" name="cellNumber">
                <Input placeholder="e.g. 071 123 4567" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Please enter a valid email" }]}
              >
                <Input placeholder="learner@example.co.za" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Residential Address" name="residentialAddress">
                <TextArea
                  placeholder="Full residential address"
                  rows={2}
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Submit */}
        <div className="page-card" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/learners")}
            style={{ borderRadius: 8 }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={submitting}
            style={{ borderRadius: 8, minWidth: 160 }}
          >
            {isEdit ? "Update Learner" : "Create Learner"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default LearnerForm;
