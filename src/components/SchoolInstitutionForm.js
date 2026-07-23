import { useState, useEffect } from "react";
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
  Divider,
} from "antd";
import {
  BookOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  BankOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import { useParams, useNavigate } from "react-router-dom";

const { Option } = Select;

const SchoolInstitutionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ provinces: [], districts: [], phases: [], sectors: [], quintiles: [] });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const isEdit = Boolean(id);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load filter options for dropdowns
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get("/api/school-institutions/filters", { headers });
        setFilters(res.data);
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    };
    fetchFilters();
  }, []);

  // Load existing school data for edit mode
  useEffect(() => {
    if (!isEdit) return;
    const fetchSchool = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`/api/school-institutions/${id}`, { headers });
        form.setFieldsValue(res.data);
      } catch (err) {
        console.error("Failed to fetch school:", err);
        message.error("Failed to load school data.");
        navigate("/school-institutions");
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [id, isEdit, form, navigate]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (isEdit) {
        await axios.put(`/api/school-institutions/${id}`, values, { headers });
        message.success("School updated successfully!");
      } else {
        await axios.post("/api/school-institutions", values, { headers });
        message.success("School created successfully!");
      }
      navigate("/school-institutions");
    } catch (err) {
      console.error("Submit failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || "Something went wrong";
      message.error(typeof errorMsg === "string" ? errorMsg : "Failed to save school.");
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
            onClick={() => navigate("/school-institutions")}
            style={{ color: "#fff", padding: "4px 8px" }}
          />
          <div>
            <h2 style={{ margin: 0 }}>
              <BookOutlined style={{ marginRight: 8 }} />
              {isEdit ? "Edit School" : "Add New School"}
            </h2>
            <p style={{ margin: "4px 0 0" }}>
              {isEdit ? "Update school institution details" : "Register a new school institution"}
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
      >
        {/* General Information */}
        <div className="page-card">
          <h3><BankOutlined style={{ marginRight: 6 }} /> General Information</h3>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={24}>
              <Form.Item
                label="Official Institution Name"
                name="officialInstitutionName"
                rules={[{ required: true, message: "Please enter the school name" }]}
              >
                <Input placeholder="e.g. Springfield Primary School" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="NAT EMIS Number"
                name="natEmis"
              >
                <InputNumber
                  placeholder="e.g. 300012345"
                  style={{ width: "100%", borderRadius: 8 }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Exam Number"
                name="examNumber"
              >
                <Input placeholder="Exam number" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Sector" name="sector">
                <Select placeholder="Select sector" allowClear style={{ borderRadius: 8 }}>
                  {filters.sectors?.length > 0 ? (
                    filters.sectors.map((s) => <Option key={s} value={s}>{s}</Option>)
                  ) : (
                    <>
                      <Option value="PUBLIC">PUBLIC</Option>
                      <Option value="INDEPENDENT">INDEPENDENT</Option>
                    </>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Phase" name="phase">
                <Select placeholder="Select phase" allowClear showSearch style={{ borderRadius: 8 }}>
                  {filters.phases?.length > 0 ? (
                    filters.phases.map((p) => <Option key={p} value={p}>{p}</Option>)
                  ) : (
                    <>
                      <Option value="PRIMARY">PRIMARY</Option>
                      <Option value="SECONDARY">SECONDARY</Option>
                      <Option value="COMBINED">COMBINED</Option>
                      <Option value="INTERMEDIATE">INTERMEDIATE</Option>
                    </>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Quintile" name="quintile">
                <Select placeholder="Select quintile" allowClear style={{ borderRadius: 8 }}>
                  {filters.quintiles?.length > 0 ? (
                    filters.quintiles.map((q) => <Option key={q} value={q}>{q}</Option>)
                  ) : (
                    <>
                      <Option value="1">1</Option>
                      <Option value="2">2</Option>
                      <Option value="3">3</Option>
                      <Option value="4">4</Option>
                      <Option value="5">5</Option>
                    </>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Urban / Rural" name="urbanRural">
                <Select placeholder="Select type" allowClear style={{ borderRadius: 8 }}>
                  <Option value="URBAN">Urban</Option>
                  <Option value="RURAL">Rural</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Status" name="status">
                <Select placeholder="Select status" allowClear style={{ borderRadius: 8 }}>
                  <Option value="OPEN">Open</Option>
                  <Option value="CLOSED">Closed</Option>
                  <Option value="MERGED">Merged</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Location */}
        <div className="page-card">
          <h3><EnvironmentOutlined style={{ marginRight: 6 }} /> Location</h3>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Province" name="province">
                <Select placeholder="Select province" allowClear showSearch style={{ borderRadius: 8 }}>
                  {filters.provinces?.length > 0 ? (
                    filters.provinces.map((p) => <Option key={p} value={p}>{p}</Option>)
                  ) : (
                    <>
                      <Option value="EASTERN CAPE">Eastern Cape</Option>
                      <Option value="FREE STATE">Free State</Option>
                      <Option value="GAUTENG">Gauteng</Option>
                      <Option value="KWAZULU-NATAL">KwaZulu-Natal</Option>
                      <Option value="LIMPOPO">Limpopo</Option>
                      <Option value="MPUMALANGA">Mpumalanga</Option>
                      <Option value="NORTH WEST">North West</Option>
                      <Option value="NORTHERN CAPE">Northern Cape</Option>
                      <Option value="WESTERN CAPE">Western Cape</Option>
                    </>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="District" name="district">
                <Select placeholder="Select or type district" allowClear showSearch style={{ borderRadius: 8 }}>
                  {filters.districts?.map((d) => (
                    <Option key={d} value={d}>{d}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Circuit" name="circuit">
                <Input placeholder="Circuit name" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Town / City" name="townCity">
                <Input placeholder="Town or city" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Street Address" name="streetAddress">
                <Input placeholder="Physical street address" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Postal Address" name="postalAddress">
                <Input placeholder="Postal address" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Latitude" name="latitude">
                <InputNumber
                  placeholder="e.g. -26.2041"
                  style={{ width: "100%", borderRadius: 8 }}
                  step={0.0001}
                  min={-90}
                  max={90}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Longitude" name="longitude">
                <InputNumber
                  placeholder="e.g. 28.0473"
                  style={{ width: "100%", borderRadius: 8 }}
                  step={0.0001}
                  min={-180}
                  max={180}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Contact */}
        <div className="page-card">
          <h3><PhoneOutlined style={{ marginRight: 6 }} /> Contact Information</h3>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Telephone" name="telephone">
                <Input placeholder="e.g. 011 123 4567" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Fax" name="fax">
                <Input placeholder="Fax number" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Please enter a valid email" }]}
              >
                <Input placeholder="school@example.co.za" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Additional Details */}
        <div className="page-card">
          <h3><TeamOutlined style={{ marginRight: 6 }} /> Additional Details</h3>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Total Learners" name="totalLearners">
                <InputNumber
                  placeholder="Number of learners"
                  style={{ width: "100%", borderRadius: 8 }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Total Educators" name="totalEducators">
                <InputNumber
                  placeholder="Number of educators"
                  style={{ width: "100%", borderRadius: 8 }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Registration Date" name="registrationDate">
                <Input placeholder="e.g. 1995-01-15" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Year of Data" name="yearOfData">
                <InputNumber
                  placeholder="e.g. 2024"
                  style={{ width: "100%", borderRadius: 8 }}
                  min={1900}
                  max={2100}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Submit */}
        <div className="page-card" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/school-institutions")}
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
            {isEdit ? "Update School" : "Create School"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SchoolInstitutionForm;
