import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Form,
  Input,
  Select,
  Typography,
  Spin,
  notification,
  Button,
  Space,
  Modal,
} from "antd";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";

const { Option } = Select;
const { Text } = Typography;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  children,
  mentors,
  nations,
  ...restProps
}) => {
  let inputNode = <Input />;

  if (dataIndex === "mentorId") {
    inputNode = (
      <Select placeholder="Select mentor" showSearch optionFilterProp="children">
        {mentors.map((mentor) => (
          <Option key={mentor.id} value={mentor.id}>
            {mentor.name} {mentor.surname}
          </Option>
        ))}
      </Select>
    );
  } else if (dataIndex === "nation") {
    inputNode = (
      <Select placeholder="Select nation" showSearch optionFilterProp="children">
        {nations.map((n) => (
          <Option key={n.id} value={n.nation}>
            {n.nation}
          </Option>
        ))}
      </Select>
    );
  } else if (dataIndex === "role") {
    inputNode = (
      <Select placeholder="Select role">
        <Option value="MEMBER">Member</Option>
        <Option value="MENTOR">Mentor</Option>
        <Option value="SECRETARY">Secretary</Option>
        <Option value="PASTOR">Pastor</Option>
        <Option value="PR">PR</Option>
      </Select>
    );
  } else if (dataIndex === "status") {
    inputNode = (
      <Select placeholder="Select status">
        <Option value="Active">Active</Option>
        <Option value="Inactive">Inactive</Option>
      </Select>
    );
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please input ${title}` }]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const AssignRolesAndNations = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [nations, setNations] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useContext(UserContext);

  const isEditing = (record) => record.key === editingKey;

  useEffect(() => {
    if (!user?.address?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [mentorsRes, nationsRes, membersRes] = await Promise.all([
          axios.get('/api/member/mentor/address/${user.address.id}'),
          axios.get( `/api/nations`),
          axios.get('/api/member/all-saved-members/address/${user.address.id}'),
        ]);

        setMentors(mentorsRes.data);
        setNations(nationsRes.data);

        const members = membersRes.data.content || [];
        const formatted = members.map((m) => ({
          key: m.id,
          id: m.id,
          name: m.name,
          surname: m.surname,
          cellNumber: m.cellNumber,
          nation: m.nation || "No Nation Assigned",
          residentialAddress: m.residentialAddress,
          status: m.active ? "Active" : "Inactive",
          mentorId: m.mentorId,
          mentorName: m.mentorName || "No Mentor Assigned",
          role: m.role,
          email: m.email,
        }));

        setData(formatted);
        setOriginalData(formatted);
      } catch (err) {
        console.error("Failed to load data:", err);
        notification.error({
          message: "Data Loading Failed",
          description: "Could not load member data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.address?.id]);

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setData(originalData);
      return;
    }

    const filteredData = originalData.filter((item) =>
      Object.values(item).some(
        (field) =>
          field &&
          field.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setData(filteredData);
  };

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const showSuccessModal = (name, surname, newRole) => {
    Modal.success({
      title: 'Update Successful',
      content: (
        <div>
          <p>{name} {surname} has been updated successfully.</p>
          {newRole && (
            <p>
              <strong>New role:</strong> {newRole}. An email with login details has been sent.
            </p>
          )}
        </div>
      ),
      okText: 'Close',
    });
  };

  const save = async (key) => {
    setIsSaving(true);
    try {
      const row = await form.validateFields();
      const oldUser = data.find((user) => user.key === key);
      const roleChanged = row.role !== oldUser.role;
      const isElevatedRole = ["MENTOR", "SECRETARY", "PR", "PASTOR"].includes(row.role);

      const payload = {
        id: key,
        name: row.name,
        surname: row.surname,
        cellNumber: row.cellNumber,
        residentialAddress: row.residentialAddress,
        nation: row.nation,
        mentorId: row.mentorId,
        role: row.role,
        active: row.status === "Active",
      };

      // Update member data
      await axios.put(`/api/member/updateMember/${key}`, payload);

      // Handle role change and email notification
      if (roleChanged && isElevatedRole) {
        try {
          const newPassword = Math.random().toString(36).slice(-8);
          
          // Send email notification
          await axios.post( `/api/member/send-email`, {
            email: oldUser.email,
            subject: "Your VYG Role Has Been Updated",
            message: `Dear ${row.name}" " ${row.surname},\n\nYour role has been updated to ${row.role}.\n\nYour new login details are:\nUsername: ${oldUser.email}\nPassword: ${newPassword}\n\nPlease change your password after logging in.`,
          });

          // Update password in backend
          await axios.put(`/api/member/update-password/${key}`, {
            newPassword: newPassword
          });

          notification.info({
            message: "Email Sent",
            description: `Login details sent to ${oldUser.email}`,
          });
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          notification.warning({
            message: "Email Notification Failed",
            description: "Member updated but email could not be sent. Please notify them manually.",
          });
        }
      }

      // Update local state
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      newData[index] = { ...newData[index], ...row };
      
      setData(newData);
      setOriginalData(newData);
      setEditingKey("");

      // Show success modal with role change info if applicable
      showSuccessModal(
        row.name, 
        row.surname, 
        roleChanged && isElevatedRole ? row.role : null
      );

    } catch (err) {
      console.error("Update error:", err);
      notification.error({
        message: "Update Failed",
        description: err.response?.data?.message || "Failed to update member. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      editable: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Surname",
      dataIndex: "surname",
      editable: true,
      sorter: (a, b) => a.surname.localeCompare(b.surname),
    },
    {
      title: "Cell Number",
      dataIndex: "cellNumber",
      editable: true,
    },
    {
      title: "Nation",
      dataIndex: "nation",
      editable: true,
      filters: nations.map(n => ({ text: n.nation, value: n.nation })),
      onFilter: (value, record) => record.nation === value,
    },
    {
      title: "Role",
      dataIndex: "role",
      editable: true,
      filters: [
        { text: "Member", value: "MEMBER" },
        { text: "Mentor", value: "MENTOR" },
        { text: "Secretary", value: "SECRETARY" },
        { text: "Pastor", value: "PASTOR" },
        { text: "PR", value: "PR" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (text) => {
        const roleMap = {
          MEMBER: <Text>Member</Text>,
          MENTOR: <Text strong>Mentor</Text>,
          SECRETARY: <Text strong type="warning">Secretary</Text>,
          PASTOR: <Text strong type="danger">Pastor</Text>,
          PR: <Text strong type="secondary">PR</Text>,
        };
        return roleMap[text] || text;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      editable: true,
      filters: [
        { text: "Active", value: "Active" },
        { text: "Inactive", value: "Inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text) => (
        <Text type={text === "Active" ? "success" : "danger"}>
          {text}
        </Text>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => {
        const editable = isEditing(record);
        const isCurrentUser = record.key === user.id;

        return editable ? (
          <Space>
            <Button
              onClick={() => save(record.key)}
              type="primary"
              size="small"
              loading={isSaving}
            >
              Save
            </Button>
            <Button 
              onClick={cancel} 
              size="small"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Button
            type="link"
            onClick={() => edit(record)}
            disabled={isCurrentUser || editingKey !== ""}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        mentors,
        nations,
      }),
    };
  });

  return (
    <div style={{ padding: window.innerWidth < 768 ? 10 : 60 }}>
      <Input.Search
        placeholder="Search members..."
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        onSearch={handleSearch}
        allowClear
        enterButton
        style={{ marginBottom: 16, width: "100%", maxWidth: 500 }}
      />

      {loading ? (
        <Spin tip="Loading members..." size="large" />
      ) : (
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            dataSource={data}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{
              onChange: cancel,
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
            }}
            scroll={{ x: true }}
            style={{ overflowX: 'auto' }}
          />
        </Form>
      )}
    </div>
  );
};

export default AssignRolesAndNations;