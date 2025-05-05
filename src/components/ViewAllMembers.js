import React, { useState, useEffect, useContext } from 'react';
import {
  Table,
  Form,
  Input,
  message,
  Select,
  Typography,
  Popconfirm,
  Spin,
} from 'antd';
import axios from 'axios';
import UserContext from '../context/UserContext';

const { Option } = Select;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  children,
  mentors,
  ...restProps
}) => {
  const inputNode = dataIndex === 'mentorId' ? (
    <Select placeholder="Select mentor">
      {mentors.map((mentor) => (
        <Option key={mentor.id} value={mentor.id}>
          {mentor.name} {mentor.surname}
        </Option>
      ))}
    </Select>
  ) : (
    <Input />
  );

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

const ViewAllMembers = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  const isEditing = (record) => record.key === editingKey;

  useEffect(() => {
    if (!user?.address?.id) {
      setLoading(false);
      return;
    }

    const fetchMentors = async () => {
      try {
        const res = await axios.get(
          `http://localhost:2025/api/member/mentors/address/${user.address.id}`
        );
        setMentors(res.data);
      } catch (error) {
        console.error('Failed to fetch mentors', error);
      }
    };

    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:2025/api/member/all-saved-members/address/${user.address.id}`
        );
        const members = res.data.content || [];
        const formatted = members.map((m) => ({
          key: m.id,
          id: m.id,
          name: m.name,
          surname: m.surname,
          cellNumber: m.cellNumber,
          nation: m.nation?.nation || '',
          residentialAddress: m.residentialAddress,
          status: m.active ? 'Active' : 'Inactive',
          mentorId: m.mentor?.id,
          mentorName: m.mentor ? `${m.mentor.name} ${m.mentor.surname}` : '',
        }));
        setData(formatted);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching members:', err);
        message.error('Could not load members');
        setLoading(false);
      }
    };

    fetchMentors();
    fetchMembers();
  }, [user]);

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => setEditingKey('');

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const updatedRow = { ...row, id: key };
      await axios.put(
        `http://localhost:2025/api/member/members/address/${key}`,
        updatedRow
      );

      const newData = [...data];
      const index = newData.findIndex((item) => item.key === key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
        message.success('Member updated successfully');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      message.error('Failed to save member data');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', responsive: ['xs', 'sm', 'md', 'lg'] },
    { title: 'Surname', dataIndex: 'surname', key: 'surname', responsive: ['xs', 'sm', 'md', 'lg'] },
    { title: 'Cell Number', dataIndex: 'cellNumber', key: 'cellNumber', editable: true, responsive: ['sm', 'md', 'lg'] },
    { title: 'Nation', dataIndex: 'nation', key: 'nation', responsive: ['sm', 'md', 'lg'] },
    { title: 'Residential Address', dataIndex: 'residentialAddress', key: 'residentialAddress', editable: true, responsive: ['md', 'lg'] },
    {
      title: 'Mentor',
      dataIndex: 'mentorName',
      key: 'mentorName',
      render: (_, record) => record.mentorName || '—',
      editable: true,
      responsive: ['sm', 'md', 'lg']
    },
    { title: 'Status', dataIndex: 'status', key: 'status', editable: true, responsive: ['sm', 'md', 'lg'] },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
      fixed: 'right',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <>
            <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <Popconfirm title="Cancel changes?" onConfirm={cancel}>
              <Typography.Link>Cancel</Typography.Link>
            </Popconfirm>
          </>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
        );
      },
      responsive: ['xs', 'sm', 'md', 'lg']
    },
  ];

  const mergedColumns = columns.map((col) =>
    !col.editable
      ? col
      : {
          ...col,
          onCell: (record) => ({
            record,
            inputType: 'text',
            dataIndex: col.dataIndex === 'mentorName' ? 'mentorId' : col.dataIndex,
            title: col.title,
            editing: isEditing(record),
            mentors,
          }),
        }
  );

  const filteredData = data.filter((item) =>
    `${item.name} ${item.surname}`.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div
      style={{
        padding: window.innerWidth <= 768 ? '10px' : '60px',
        margin: '0 auto',
        maxWidth: '1000px'
      }}
    >
      <Input
        placeholder="Search by name or surname..."
        style={{ marginBottom: 16, width: '100%' }}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {loading ? (
        <Spin tip="Loading members..." />
      ) : (
        <Form form={form} component={false}>
          <Table
            components={{ body: { cell: EditableCell } }}
            bordered
            dataSource={filteredData}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{ onChange: cancel }}
            scroll={{ x: 'max-content' }}
          />
        </Form>
      )}
    </div>
  );
};

export default ViewAllMembers;
