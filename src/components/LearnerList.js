import { useState, useEffect } from "react";
import {
  Input,
  Select,
  Table,
  Tag,
  Button,
  Popconfirm,
  message,
  Tooltip,
  Drawer,
  Empty,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const LearnerList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [learners, setLearners] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [sortField, setSortField] = useState("lastName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filters, setFilters] = useState({ grades: [] });
  const [stats, setStats] = useState({ totalLearners: 0, grades: [] });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load filter options
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

  // Load stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get("/api/learners/stats", { headers });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    fetchStats();
  }, []);

  // Fetch learners
  const fetchLearners = async (page = 1, size = 20) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url;
      let params = {};

      if (searchQuery) {
        url = "/api/learners/search";
        params = { name: searchQuery, page: page - 1, size };
      } else if (selectedGrade) {
        url = `/api/learners/grade/${encodeURIComponent(selectedGrade)}`;
        params = { page: page - 1, size };
      } else {
        url = "/api/learners";
        params = { page: page - 1, size, sortBy: sortField, direction: sortDirection };
      }

      const res = await axios.get(url, { headers, params });
      const data = res.data;

      setLearners(data.content || []);
      setPagination({
        current: (data.page || 0) + 1,
        pageSize: data.size || size,
        total: data.totalElements || 0,
      });
    } catch (err) {
      console.error("Failed to fetch learners:", err);
      message.error("Failed to load learners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners(1, pagination.pageSize);
  }, [searchQuery, selectedGrade, sortField, sortDirection]);

  const handleTableChange = (pag, _filters, sorter) => {
    if (sorter.field) {
      setSortField(sorter.field);
      setSortDirection(sorter.order === "descend" ? "desc" : "asc");
    }
    fetchLearners(pag.current, pag.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/learners/${id}`, { headers });
      message.success("Learner deleted successfully");
      fetchLearners(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error("Delete failed:", err);
      message.error("Failed to delete learner");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGrade(null);
    setSortField("lastName");
    setSortDirection("asc");
  };

  const getGenderColor = (gender) => {
    if (!gender) return "default";
    return gender === "MALE" ? "blue" : "magenta";
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      sorter: true,
      dataIndex: "lastName",
      render: (_, record) => (
        <div>
          <strong style={{ fontSize: 13 }}>
            {record.firstName} {record.lastName}
          </strong>
          {isMobile && (
            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
              {record.grade && `Grade ${record.grade}`}
              {record.gender && ` • ${record.gender}`}
            </div>
          )}
        </div>
      ),
    },
    ...(!isMobile
      ? [
          {
            title: "ID Number",
            dataIndex: "idNumber",
            key: "idNumber",
            width: 140,
            ellipsis: true,
            render: (v) => v || "—",
          },
          {
            title: "Grade",
            dataIndex: "grade",
            key: "grade",
            width: 100,
            render: (v) => v ? <Tag color="blue">Grade {v}</Tag> : "—",
          },
          {
            title: "Gender",
            dataIndex: "gender",
            key: "gender",
            width: 90,
            render: (v) => v ? <Tag color={getGenderColor(v)}>{v}</Tag> : "—",
          },
          {
            title: "School",
            key: "school",
            width: 180,
            ellipsis: true,
            render: (_, record) =>
              record.schoolInstitution?.officialInstitutionName ||
              record.school?.name ||
              "—",
          },
          {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            width: 90,
            render: (v) => (
              <Tag color={v ? "green" : "red"}>{v ? "Active" : "Inactive"}</Tag>
            ),
          },
        ]
      : []),
    {
      title: "Actions",
      key: "actions",
      width: isMobile ? 100 : 130,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 4 }}>
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: "#1890ff" }} />}
              onClick={() => navigate(`/learners/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: "#faad14" }} />}
              onClick={() => navigate(`/learners/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this learner?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const FilterContent = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "block" }}>Grade</label>
        <Select
          placeholder="All Grades"
          value={selectedGrade}
          onChange={(v) => { setSelectedGrade(v); setSearchQuery(""); }}
          allowClear
          style={{ width: "100%" }}
        >
          {filters.grades?.map((g) => (
            <Option key={g} value={g}>Grade {g}</Option>
          ))}
        </Select>
      </div>
      <Button onClick={clearFilters} icon={<ReloadOutlined />} block>
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="page-wrapper" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="page-header">
        <h2>
          <TeamOutlined style={{ marginRight: 8 }} />
          Learners
        </h2>
        <p>Manage and view all registered learners</p>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <div className="stat-mini">
          <div className="stat-mini-label">Total Learners</div>
          <div className="stat-mini-value" style={{ color: "#1890ff" }}>
            {stats.totalLearners?.toLocaleString() || 0}
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">Grades Available</div>
          <div className="stat-mini-value" style={{ color: "#722ed1" }}>
            {stats.grades?.length || filters.grades?.length || 0}
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="page-card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <Input
            placeholder="Search by name..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedGrade(null);
            }}
            style={{ flex: 1, minWidth: 200, borderRadius: 8 }}
            allowClear
          />
          {isMobile ? (
            <Button icon={<FilterOutlined />} onClick={() => setFilterDrawerOpen(true)}>
              Filters
            </Button>
          ) : (
            <Select
              placeholder="Grade"
              value={selectedGrade}
              onChange={(v) => { setSelectedGrade(v); setSearchQuery(""); }}
              allowClear
              style={{ width: 140 }}
            >
              {filters.grades?.map((g) => (
                <Option key={g} value={g}>Grade {g}</Option>
              ))}
            </Select>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/learners/add")}
            style={{ borderRadius: 8 }}
          >
            {isMobile ? "" : "Add Learner"}
          </Button>
        </div>

        {/* Active filters */}
        {(selectedGrade || searchQuery) && (
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#888" }}>Active:</span>
            {searchQuery && (
              <Tag closable onClose={() => setSearchQuery("")} color="blue">
                Search: {searchQuery}
              </Tag>
            )}
            {selectedGrade && (
              <Tag closable onClose={() => setSelectedGrade(null)} color="purple">
                Grade {selectedGrade}
              </Tag>
            )}
            <Button type="link" size="small" onClick={clearFilters}>Clear all</Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="page-card modern-table" style={{ padding: 0, overflow: "hidden" }}>
        <Table
          dataSource={learners}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            size: "small",
          }}
          onChange={handleTableChange}
          size={isMobile ? "small" : "middle"}
          scroll={{ x: isMobile ? 400 : undefined }}
          locale={{
            emptyText: (
              <Empty
                description="No learners found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Filter Learners"
        placement="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        height="auto"
        styles={{ body: { paddingBottom: 40 } }}
      >
        <FilterContent />
      </Drawer>
    </div>
  );
};

export default LearnerList;
