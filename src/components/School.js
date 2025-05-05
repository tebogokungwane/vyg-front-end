// School.js
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Form,
  Input,
  Select,
  Button,
  Table,
  Typography,
  Popconfirm,
  Modal
} from "antd";
import UserContext from "../context/UserContext";
import { injectResponsiveStyles } from "../styles/responsiveTableStyle";
import { message } from "antd";
import { Alert } from 'antd';


const { Option } = Select;

const EditableCell = ({ editing, dataIndex, title, inputType, children, mentorsList, ...restProps }) => {
  let inputNode;

  if (dataIndex === "mentor") {
    inputNode = (
      <Select style={{ width: "100%" }}>
        {mentorsList?.map((mentor) => (
          <Option key={mentor.id} value={`${mentor.name} ${mentor.surname}`}>
            {mentor.name} {mentor.surname}
          </Option>
        ))}
      </Select>
    );
  } else {
    inputNode = inputType === "number" ? <Input type="number" /> : <Input />;
  }

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
  const [form] = Form.useForm();
  const [schoolForm] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mentors, setMentors] = useState([]);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showUpdateSuccessAlert, setShowUpdateSuccessAlert] = useState(false); // ✅ for "edit"


  useEffect(() => {
    injectResponsiveStyles(); // ✅ Inject styles for small screens
  }, []);

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ name: "", address: "", contact: "", mentor: "", ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      const item = newData[index];
  
      if (!item.id) {
        console.error("Missing ID for update:", item);
        message.error("Missing school ID. Cannot update.");
        return;
      }
  
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
     
        setShowUpdateSuccessAlert(true); // ✅ show update alert
        setTimeout(() => setShowUpdateSuccessAlert(false), 3000); // hide after 3 seconds
      } else {
        message.error("Update failed with unexpected status.");
      }
    } catch (err) {
      console.error("Update failed:", err);
      message.error(err.response?.data?.message || "Failed to update school.");
    }
  };
  



  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleAddSchool = (values) => {
    const payload = {
      schoolName: values.schoolName,
      schoolAddress: values.schoolAddress,
      personToContact: values.personToContact,
      contactDetails: values.contactDetails,
      mentor: values.mentor || "",
      addressId: user?.address?.id,
      createBy: `${user.name} ${user.surname}`
    };

    axios
      .post("http://localhost:2025/api/schools/register", payload)
      .then(() => {
        setIsModalOpen(false);
        schoolForm.resetFields();
        setShowSuccessAlert(true); // ✅ Show success alert
        setTimeout(() => setShowSuccessAlert(false), 3000); // ✅ Hide after 3s
        return axios.get(`http://localhost:2025/api/schools/${user.address.id}`);

      })
      .then((res) => {
        const formatted = res.data.map((school, index) => ({
          key: index.toString(),
          id: school.id,
          name: school.schoolName,
          address: school.schoolAddress,
          personToContact: school.personToContact,
          contact: school.contactDetails,
          mentor: school.mentor
        }));
        setData(formatted);
      })
      .catch((err) => {
        console.error("Error registering or fetching schools", err);
      });
  };
  useEffect(() => {
    if (user?.address?.id) {
      axios.get(`http://localhost:2025/api/schools/${user.address.id}`)
        .then((res) => {
          const formatted = res.data.map((school, index) => ({
            key: index.toString(),
            id: school.id, // ✅ include ID for PUT requests
            name: school.schoolName,
            address: school.schoolAddress,
            personToContact: school.personToContact,
            contact: school.contactDetails,
            mentor: school.mentor
          }));
          setData(formatted);
        })
        .catch((err) => console.error("Failed to load schools", err));
    }
  }, [user]);


  useEffect(() => {
    if (user?.address?.id) {
      axios
        .get(`http://localhost:2025/api/member/mentor/address/${user.address.id}`)
        .then((res) => setMentors(res.data))
        .catch((err) => console.error("Failed to load mentors", err));
    }
  }, [user]);
  

  const columns = [
    { title: "School Name", dataIndex: "name", editable: true },
    { title: "Address", dataIndex: "address", editable: true },
    { title: "Person to contact", dataIndex: "personToContact", editable: true },
    { title: "Contact", dataIndex: "contact", editable: true },
    { title: "Mentor", dataIndex: "mentor", editable: true },
    {
      title: "Actions",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <Popconfirm title="Cancel changes?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ""} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
        );
      }
    }
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
        mentorsList: mentors // ✅ Pass mentors list to EditableCell
      }),
    };
  });
  

  const filteredData = data.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));

  return (



    <div style={{ padding: "50px", margin: "0 auto", width: "100%", overflowX: "auto" }}>
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
    <Button type="primary" onClick={showModal}>
      Add School
    </Button>
  </div>

  {showUpdateSuccessAlert && (
    <Alert
      message="School updated successfully!"
      type="success"
      showIcon
      style={{ marginBottom: 16 }}
    />
  )}

  {showSuccessAlert && (
    <Alert
      message="School saved successfully!"
      type="success"
      showIcon
      style={{ marginBottom: 16 }}
    />
  )}

  <Input
    placeholder="Search schools..."
    style={{ marginBottom: 16, width: "100%" }}
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
  />


      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell } }}
          bordered
          dataSource={filteredData}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{ onChange: cancel }}
          scroll={{ x: "max-content" }} // ✅ Scrollable if needed
        />
      </Form>

      <Modal title="Register School" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={schoolForm} layout="vertical" onFinish={handleAddSchool}>
          <Form.Item name="schoolName" label="School Name" rules={[{ required: true, message: "Please enter school name!" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="schoolAddress" label="Address" rules={[{ required: true, message: "Please enter school address!" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="personToContact" label="Person to Contact" rules={[{ required: true, message: "Please enter person to contact!" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="contactDetails" label="Contact Number" rules={[{ required: true, message: "Please enter contact number!" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="mentor" label="Mentor">
            <Select placeholder="Select mentor (optional)">
              {mentors.map((mentor) => (
                <Option key={mentor.id} value={`${mentor.name} ${mentor.surname}`}>
                  {mentor.name} {mentor.surname}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default School;
