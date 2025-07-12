import React, { useState, useEffect, useContext } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Table,
  Typography,
  Popconfirm,
  Modal,
  Alert,
  Layout,
  message,
  Card,
  Space,
  Grid,
} from "antd";
import axios from "axios";
import UserContext from "../context/UserContext";

const { Option } = Select;
const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  children,
  mentorsList,
  ...restProps
}) => {
  const inputNode =
    dataIndex === "mentor" ? (
      <Select style={{ width: "100%" }}>
        {mentorsList?.map((mentor) => (
          <Option key={mentor.id} value={`${mentor.name} ${mentor.surname}`}>
            {mentor.name} {mentor.surname}
          </Option>
        ))}
      </Select>
    ) : inputType === "number" ? (
      <Input type="number" />
    ) : (
      <Input />
    );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please input ${title}!` }]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const School = () => {
  const { user } = useContext(UserContext);
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const [schoolForm] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showUpdateSuccessAlert, setShowUpdateSuccessAlert] = useState(false);

  useEffect(() => {
    if (user?.address?.id) {
      fetchSchools();
      fetchMentors();
    }
  }, [user]);

  const fetchSchools = async () => {
    try {
      const res = await axios.get(`http://localhost:2025/api/schools/${user.address.id}`);
      const formatted = res.data.map((school, index) => ({
        key: index.toString(),
        id: school.id,
        name: school.schoolName,
        address: school.schoolAddress,
        personToContact: school.personToContact,
        contact: school.contactDetails,
        mentor: school.mentor,
      }));
      setData(formatted);
    } catch (err) {
      console.error("Failed to load schools", err);
    }
  };

  const fetchMentors = async () => {
    try {
      const res = await axios.get(`http://localhost:2025/api/member/mentor/address/${user.address.id}`);
      setMentors(res.data);
    } catch (err) {
      console.error("Failed to load mentors", err);
    }
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => setEditingKey("");

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      const item = newData[index];
      if (!item.id) return message.error("Missing school ID.");
      const updated = { ...item, ...row };

      const response = await axios.put(`http://localhost:2025/api/schools/${item.id}`, {
        schoolName: updated.name,
        schoolAddress: updated.address,
        personToContact: updated.personToContact,
        contactDetails: updated.contact,
        mentor: updated.mentor,
      });

      if (response.status === 200) {
        newData.splice(index, 1, updated);
        setData(newData);
        setEditingKey("");
        setShowUpdateSuccessAlert(true);
        setTimeout(() => setShowUpdateSuccessAlert(false), 3000);
      } else {
        message.error("Update failed.");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Update failed.");
    }
  };

  const handleAddSchool = async (values) => {
    const payload = {
      schoolName: values.schoolName,
      schoolAddress: values.schoolAddress,
      personToContact: values.personToContact,
      contactDetails: values.contactDetails,
      mentor: values.mentor || "",
      addressId: user?.address?.id,
      createBy: `${user.name} ${user.surname}`,
    };

    try {
      await axios.post("http://localhost:2025/api/schools/register", payload);
      setIsModalOpen(false);
      schoolForm.resetFields();
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      fetchSchools();
    } catch (err) {
      message.error("Failed to register school.");
    }
  };

  const columns = [
    { 
      title: "School Name", 
      dataIndex: "name", 
      editable: true,
      width: "20%",
    },
    { 
      title: "Address", 
      dataIndex: "address", 
      editable: true,
      width: "20%",
    },
    { 
      title: "Person to Contact", 
      dataIndex: "personToContact", 
      editable: true,
      width: "15%",
    },
    { 
      title: "Contact", 
      dataIndex: "contact", 
      editable: true,
      width: "15%",
    },
    { 
      title: "Mentor", 
      dataIndex: "mentor", 
      editable: true,
      width: "15%",
    },
    {
      title: "Actions",
      dataIndex: "operation",
      width: "15%",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Typography.Link onClick={() => save(record.key)}>
              Save
            </Typography.Link>
            <Popconfirm title="Cancel changes?" onConfirm={cancel}>
              <Typography.Link>Cancel</Typography.Link>
            </Popconfirm>
          </Space>
        ) : (
          <Typography.Link disabled={editingKey !== ""} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "contact" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        mentorsList: mentors,
      }),
    };
  });

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
 

      <Content style={{ 
        padding: "24px",
        background: "#fff",
        maxWidth: "100vw",
        overflow: "hidden",
      }}>
        <Card
          bordered={false}
          style={{ 
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
            borderRadius: 8,
            background: "#fff",
          }}
          bodyStyle={{ padding: screens.xs ? "16px 8px" : "24px" }}
        >
          <div style={{ marginBottom: 24 }}>
            <Space 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                marginBottom: 16,
                flexDirection: screens.xs ? "column" : "row",
                gap: screens.xs ? "12px" : "0",
                width: "100%",
              }}
            >
              <Button 
                type="primary" 
                onClick={() => setIsModalOpen(true)}
                style={{ height: 40, width: screens.xs ? "100%" : "auto" }}
              >
                Add School
              </Button>
              <Input
                placeholder="Search schools..."
                style={{ 
                  width: screens.xs ? "100%" : 300, 
                  height: 40 
                }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Space>

            {showUpdateSuccessAlert && (
              <Alert 
                message="School updated successfully!" 
                type="success" 
                showIcon 
                closable 
                style={{ marginBottom: 16 }} 
              />
            )}
            {showSuccessAlert && (
              <Alert 
                message="School saved successfully!" 
                type="success" 
                showIcon 
                closable 
                style={{ marginBottom: 16 }} 
              />
            )}
          </div>

          <div style={{ 
            width: "100%",
            overflowX: "auto",
          }}>
            <Form form={form} component={false}>
              <Table
                components={{ body: { cell: EditableCell } }}
                bordered
                dataSource={filteredData}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={{ 
                  position: ["bottomRight"],
                  pageSize: 10,
                  showSizeChanger: false,
                  style: { padding: "16px 0" }
                }}
                scroll={{ x: "max-content" }}
                style={{ 
                  fontSize: "14px",
                  minWidth: screens.xs ? "800px" : "100%",
                }}
                size="middle"
              />
            </Form>
          </div>
        </Card>

        <Modal 
          title={<span style={{ fontSize: "18px" }}>Register School</span>} 
          open={isModalOpen} 
          onCancel={() => setIsModalOpen(false)} 
          footer={null}
          centered
        >
          <Form form={schoolForm} layout="vertical" onFinish={handleAddSchool}>
            <Form.Item 
              name="schoolName" 
              label="School Name" 
              rules={[{ required: true, message: "Please input school name!" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item 
              name="schoolAddress" 
              label="Address" 
              rules={[{ required: true, message: "Please input school address!" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item 
              name="personToContact" 
              label="Person to Contact" 
              rules={[{ required: true, message: "Please input contact person!" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item 
              name="contactDetails" 
              label="Contact Number" 
              rules={[{ required: true, message: "Please input contact number!" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item name="mentor" label="Mentor">
              <Select 
                placeholder="Select mentor (optional)"
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {mentors.map((mentor) => (
                  <Option key={mentor.id} value={`${mentor.name} ${mentor.surname}`}>
                    {mentor.name} {mentor.surname}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                style={{ width: "100%" }}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>

     
    </Layout>
  );
};

export default School;