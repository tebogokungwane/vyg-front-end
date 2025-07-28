import React, { useState, useEffect } from 'react';
import { Table, Card,  Tag, Input, DatePicker, Select, notification } from 'antd';
import axios from "../utils/axios";
import moment from 'moment';
import { useAuth } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ActivityLog = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    dateRange: [],
    entityType: '',
  });

  const fetchActivities = async () => {
    if (!auth?.token) {
      notification.warning({
        message: 'Authentication Required',
        description: 'Please login to view activity logs',
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const { current, pageSize } = pagination;
      const { username, action, dateRange, entityType } = filters;
      
      const response = await axios.get(`/api/audit/logs`, {
        params: {
          page: current - 1,
          size: pageSize,
          username,
          action,
          entityType,
          from: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
          to: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined,
        },
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      setActivities(response.data.content);
      setPagination({
        ...pagination,
        total: response.data.totalElements,
      });
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      if (error.response?.status === 401) {
        notification.error({
          message: 'Session Expired',
          description: 'Please login again',
        });
        navigate('/login');
      } else {
        notification.error({
          message: 'Error',
          description: error.response?.data?.message || 'Failed to fetch activity logs',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchActivities();
    }
  }, [pagination.current, filters, auth?.token]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: true,
    },
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => <Tag color={getActionColor(action)}>{action}</Tag>,
    },
    {
      title: 'Entity',
      dataIndex: 'entityType',
      key: 'entityType',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
  ];

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE':
        return 'green';
      case 'UPDATE':
        return 'blue';
      case 'DELETE':
        return 'red';
      case 'LOGIN':
        return 'purple';
      case 'LOGOUT':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <div className="activity-log-container"  style={{ paddingTop: "70px" }}>
      <Card
        variant="inner"
        className="activity-log-card"
      >
        <div className="activity-filters">
          <Input
            placeholder="Search by username"
            style={{ width: 200, marginRight: 16 }}
            onChange={(e) => handleFilterChange('username', e.target.value)}
            allowClear
          />
          <Select
            placeholder="Filter by action"
            style={{ width: 200, marginRight: 16 }}
            onChange={(value) => handleFilterChange('action', value)}
            allowClear
          >
            <Option value="CREATE">Create</Option>
            <Option value="UPDATE">Update</Option>
            <Option value="DELETE">Delete</Option>
            <Option value="LOGIN">Login</Option>
            <Option value="LOGOUT">Logout</Option>
          </Select>
          <Select
            placeholder="Filter by entity"
            style={{ width: 200, marginRight: 16 }}
            onChange={(value) => handleFilterChange('entityType', value)}
            allowClear
          >
            <Option value="MEMBER">Member</Option>
            <Option value="ADDRESS">Address</Option>
            <Option value="NATION">Nation</Option>
          </Select>
          <RangePicker
            style={{ marginRight: 16 }}
            onChange={(dates) => handleFilterChange('dateRange', dates)}
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default ActivityLog;