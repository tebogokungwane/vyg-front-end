import { useState, useEffect } from "react";
import {
  Input,
  Select,
  Table,
  Tag,
  Button,
  Spin,
  Empty,
  Tooltip,
  Popconfirm,
  message,
  Row,
  Col,
  Drawer,
} from "antd";
import {
  SearchOutlined,
  BookOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const SchoolInstitutions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ provinces: [], districts: [], phases: [], sectors: [], quintiles: [] });
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [sortField, setSortField] = useState("officialInstitutionName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [stats, setStats] = useState({ totalSchools: 0, publicSchools: 0, independentSchools: 0 });

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
        const res = await axios.get("/api/school-institutions/filters", { headers });
        setFilters(res.data);
      } catch (err) {
        console.error("Failed to load filter options:", err);
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
        const res = await axios.get("/api/school-institutions/stats", { headers });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    fetchStats();
  }, []);

  // Fetch schools (paginated)
  const fetchSchools = async (page = 1, size = 20) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url;
      let params = {};

      if (searchQuery) {
        url = "/api/school-institutions/search/global";
        params = { query: searchQuery, page: page - 1, size };
      } else if (selectedProvince) {
        url = `/api/school-institutions/province/${encodeURIComponent(selectedProvince)}`;
        params = { page: page - 1, size };
      } else if (selectedDistrict) {
        url = `/api/school-institutions/district/${encodeURIComponent(selectedDistrict)}`;
        params = { page: page - 1, size };
      } else if (selectedPhase) {
        url = `/api/school-institutions/phase/${encodeURIComponent(selectedPhase)}`;
        params = { page: page - 1, size };
      } else {
        url = "/api/school-institutions";
        params = { page: page - 1, size, sortBy: sortField, direction: sortDirection };
      }

      const res = await axios.get(url, { headers, params });
      const data = res.data;

      setSchools(data.content || []);
      setPagination({
        current: (data.page || 0) + 1,
        pageSize: data.size || size,
        total: data.totalElements || 0,
      });
    } catch (err) {
      console.error("Failed to fetch schools:", err);
      message.error("Failed to load schools. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools(1, pagination.pageSize);
  }, [searchQuery, selectedProvince, selectedDistrict, selectedPhase, sortField, sortDirection]);

  const handleTableChange = (pag, _filters, sorter) => {
    if (sorter.field) {
      setSortField(sorter.field);
      setSortDirection(sorter.order === "descend" ? "desc" : "asc");
    }
    fetchSchools(pag.current, pag.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/school-institutions/${id}`, { headers });
      message.success("School deleted successfully");
      fetchSchools(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error("Delete failed:", err);
      message.error("Failed to delete school");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedPhase(null);
    setSortField("officialInstitutionName");
    setSortDirection("asc");
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

  const columns = [
    {
      title: "School Name",
      dataIndex: "officialInstitutionName",
      key: "officialInstitutionName",
      sorter: true,
      ellipsis: true,
      render: (text, record) => (
        <div>
          <strong style={{ fontSize: 13 }}>{text}</strong>
          {isMobile && (
            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {record.townCity || record.province || "—"}
            </div>
          )}
        </div>
      ),
    },
    ...(!isMobile
      ? [
          {
            title: "Province",
            dataIndex: "province",
            key: "province",
            width: 140,
            render: (v) => v || "—",
          },
          {
            title: "District",
            dataIndex: "district",
            key: "district",
            width: 160,
            ellipsis: true,
            render: (v) => v || "—",
          },
          {
            title: "Phase",
            dataIndex: "phase",
            key: "phase",
            width: 130,
            render: (v) => v ? <Tag color={getPhaseColor(v)}>{v}</Tag> : "—",
          },
          {
            title: "Sector",
            dataIndex: "sector",
            key: "sector",
            width: 110,
            render: (v) => v ? <Tag color={getSectorColor(v)}>{v}</Tag> : "—",
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
              onClick={() => navigate(`/school-institutions/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: "#faad14" }} />}
              onClick={() => navigate(`/school-institutions/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this school?"
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
        <label style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "block" }}>Province</label>
        <Select
          placeholder="All Provinces"
          value={selectedProvince}
          onChange={(v) => { setSelectedProvince(v); setSelectedDistrict(null); setSelectedPhase(null); }}
          allowClear
          style={{ width: "100%" }}
        >
          {filters.provinces?.map((p) => (
            <Option key={p} value={p}>{p}</Option>
          ))}
        </Select>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "block" }}>District</label>
        <Select
          placeholder="All Districts"
          value={selectedDistrict}
          onChange={(v) => { setSelectedDistrict(v); setSelectedProvince(null); setSelectedPhase(null); }}
          allowClear
          showSearch
          style={{ width: "100%" }}
        >
          {filters.districts?.map((d) => (
            <Option key={d} value={d}>{d}</Option>
          ))}
        </Select>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "block" }}>Phase</label>
        <Select
          placeholder="All Phases"
          value={selectedPhase}
          onChange={(v) => { setSelectedPhase(v); setSelectedProvince(null); setSelectedDistrict(null); }}
          allowClear
          style={{ width: "100%" }}
        >
          {filters.phases?.map((p) => (
            <Option key={p} value={p}>{p}</Option>
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
          <BookOutlined style={{ marginRight: 8 }} />
          School Institutions
        </h2>
        <p>Browse, search, and manage school institutions across South Africa</p>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <div className="stat-mini">
          <div className="stat-mini-label">Total Schools</div>
          <div className="stat-mini-value" style={{ color: "#1890ff" }}>
            {stats.totalSchools?.toLocaleString() || 0}
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">Public</div>
          <div className="stat-mini-value" style={{ color: "#52c41a" }}>
            {stats.publicSchools?.toLocaleString() || 0}
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">Independent</div>
          <div className="stat-mini-value" style={{ color: "#faad14" }}>
            {stats.independentSchools?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="page-card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <Input
            placeholder="Search schools by name, province, district, town..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedProvince(null);
              setSelectedDistrict(null);
              setSelectedPhase(null);
            }}
            style={{ flex: 1, minWidth: 200, borderRadius: 8 }}
            allowClear
          />
          {isMobile ? (
            <Button icon={<FilterOutlined />} onClick={() => setFilterDrawerOpen(true)}>
              Filters
            </Button>
          ) : (
            <>
              <Select
                placeholder="Province"
                value={selectedProvince}
                onChange={(v) => { setSelectedProvince(v); setSearchQuery(""); setSelectedDistrict(null); setSelectedPhase(null); }}
                allowClear
                style={{ width: 160 }}
              >
                {filters.provinces?.map((p) => (
                  <Option key={p} value={p}>{p}</Option>
                ))}
              </Select>
              <Select
                placeholder="Phase"
                value={selectedPhase}
                onChange={(v) => { setSelectedPhase(v); setSearchQuery(""); setSelectedProvince(null); setSelectedDistrict(null); }}
                allowClear
                style={{ width: 150 }}
              >
                {filters.phases?.map((p) => (
                  <Option key={p} value={p}>{p}</Option>
                ))}
              </Select>
            </>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/school-institutions/add")}
            style={{ borderRadius: 8 }}
          >
            {isMobile ? "" : "Add School"}
          </Button>
        </div>

        {/* Active filters display */}
        {(selectedProvince || selectedDistrict || selectedPhase || searchQuery) && (
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#888" }}>Active:</span>
            {searchQuery && <Tag closable onClose={() => setSearchQuery("")} color="blue">Search: {searchQuery}</Tag>}
            {selectedProvince && <Tag closable onClose={() => setSelectedProvince(null)} color="green">{selectedProvince}</Tag>}
            {selectedDistrict && <Tag closable onClose={() => setSelectedDistrict(null)} color="orange">{selectedDistrict}</Tag>}
            {selectedPhase && <Tag closable onClose={() => setSelectedPhase(null)} color="purple">{selectedPhase}</Tag>}
            <Button type="link" size="small" onClick={clearFilters}>Clear all</Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="page-card modern-table" style={{ padding: 0, overflow: "hidden" }}>
        <Table
          dataSource={schools}
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
                description="No schools found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Filter Schools"
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

export default SchoolInstitutions;
