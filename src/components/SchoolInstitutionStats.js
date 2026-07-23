import { useState, useEffect } from "react";
import {
  Spin,
  Alert,
  Row,
  Col,
  Card,
  Tag,
  Input,
  Button,
  Slider,
  Empty,
  message,
} from "antd";
import {
  BookOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  BankOutlined,
  SearchOutlined,
  AimOutlined,
  PieChartOutlined,
  BarChartOutlined,
  GlobalOutlined,
  RadarChartOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const SchoolInstitutionStats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSchools: 0, publicSchools: 0, independentSchools: 0 });
  const [filters, setFilters] = useState({ provinces: [], districts: [], phases: [], sectors: [], quintiles: [] });
  const [nearbySchools, setNearbySchools] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [statsRes, filtersRes] = await Promise.all([
          axios.get("/api/school-institutions/stats", { headers }),
          axios.get("/api/school-institutions/filters", { headers }),
        ]);

        setStats(statsRes.data);
        setFilters(filtersRes.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
        message.error("Failed to load school statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFindNearby = async () => {
    if (!lat || !lng) {
      message.warning("Please enter both latitude and longitude.");
      return;
    }
    setNearbyLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("/api/school-institutions/nearby", {
        headers,
        params: { lat: parseFloat(lat), lng: parseFloat(lng), radiusKm },
      });
      setNearbySchools(res.data || []);
      if (res.data?.length === 0) {
        message.info("No schools found within that radius.");
      }
    } catch (err) {
      console.error("Nearby search failed:", err);
      message.error("Failed to search for nearby schools.");
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        message.success("Location detected!");
      },
      () => {
        message.error("Unable to get your location. Please enter it manually.");
      }
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const publicPct = stats.totalSchools > 0
    ? Math.round((stats.publicSchools / stats.totalSchools) * 100)
    : 0;
  const independentPct = stats.totalSchools > 0
    ? Math.round((stats.independentSchools / stats.totalSchools) * 100)
    : 0;

  return (
    <div className="page-wrapper" style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div className="page-header">
        <h2>
          <PieChartOutlined style={{ marginRight: 8 }} />
          School Statistics & Insights
        </h2>
        <p>Overview of school institutions data and nearby search</p>
      </div>

      {/* Overview Stats */}
      <div className="stat-row">
        <div className="stat-mini">
          <div className="stat-mini-label">Total Schools</div>
          <div className="stat-mini-value" style={{ color: "#1890ff" }}>
            {stats.totalSchools?.toLocaleString() || 0}
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">Public Schools</div>
          <div className="stat-mini-value" style={{ color: "#52c41a" }}>
            {stats.publicSchools?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{publicPct}%</div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">Independent</div>
          <div className="stat-mini-value" style={{ color: "#faad14" }}>
            {stats.independentSchools?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{independentPct}%</div>
        </div>
      </div>

      {/* Sector Distribution Visual */}
      <div className="page-card">
        <h3><BarChartOutlined style={{ marginRight: 6 }} /> Sector Distribution</h3>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 90, fontSize: 12, color: "#666" }}>Public</span>
            <div style={{ flex: 1, background: "#f0f0f0", borderRadius: 6, height: 24, overflow: "hidden" }}>
              <div
                style={{
                  width: `${publicPct}%`,
                  background: "linear-gradient(90deg, #52c41a, #73d13d)",
                  height: "100%",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 8,
                  fontSize: 11,
                  color: "#fff",
                  fontWeight: 600,
                  transition: "width 0.6s ease",
                }}
              >
                {publicPct > 10 ? `${publicPct}%` : ""}
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, minWidth: 40 }}>{stats.publicSchools?.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 90, fontSize: 12, color: "#666" }}>Independent</span>
            <div style={{ flex: 1, background: "#f0f0f0", borderRadius: 6, height: 24, overflow: "hidden" }}>
              <div
                style={{
                  width: `${independentPct}%`,
                  background: "linear-gradient(90deg, #faad14, #ffc53d)",
                  height: "100%",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 8,
                  fontSize: 11,
                  color: "#fff",
                  fontWeight: 600,
                  transition: "width 0.6s ease",
                }}
              >
                {independentPct > 10 ? `${independentPct}%` : ""}
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, minWidth: 40 }}>{stats.independentSchools?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter Breakdown */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12}>
          <div className="page-card" style={{ height: "100%" }}>
            <h3><GlobalOutlined style={{ marginRight: 6 }} /> Provinces ({filters.provinces?.length || 0})</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {filters.provinces?.map((p) => (
                <Tag
                  key={p}
                  color="blue"
                  style={{ cursor: "pointer", marginBottom: 4, fontSize: 11 }}
                  onClick={() => navigate("/school-institutions")}
                >
                  {p}
                </Tag>
              ))}
              {(!filters.provinces || filters.provinces.length === 0) && (
                <span style={{ fontSize: 12, color: "#999" }}>No data</span>
              )}
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div className="page-card" style={{ height: "100%" }}>
            <h3><BookOutlined style={{ marginRight: 6 }} /> Phases ({filters.phases?.length || 0})</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {filters.phases?.map((p) => (
                <Tag
                  key={p}
                  color="purple"
                  style={{ cursor: "pointer", marginBottom: 4, fontSize: 11 }}
                  onClick={() => navigate("/school-institutions")}
                >
                  {p}
                </Tag>
              ))}
              {(!filters.phases || filters.phases.length === 0) && (
                <span style={{ fontSize: 12, color: "#999" }}>No data</span>
              )}
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div className="page-card" style={{ height: "100%" }}>
            <h3><BankOutlined style={{ marginRight: 6 }} /> Sectors ({filters.sectors?.length || 0})</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {filters.sectors?.map((s) => (
                <Tag key={s} color="green" style={{ marginBottom: 4, fontSize: 11 }}>{s}</Tag>
              ))}
              {(!filters.sectors || filters.sectors.length === 0) && (
                <span style={{ fontSize: 12, color: "#999" }}>No data</span>
              )}
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div className="page-card" style={{ height: "100%" }}>
            <h3><TeamOutlined style={{ marginRight: 6 }} /> Quintiles ({filters.quintiles?.length || 0})</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {filters.quintiles?.map((q) => (
                <Tag key={q} color="orange" style={{ marginBottom: 4, fontSize: 11 }}>Quintile {q}</Tag>
              ))}
              {(!filters.quintiles || filters.quintiles.length === 0) && (
                <span style={{ fontSize: 12, color: "#999" }}>No data</span>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Nearby Schools Finder */}
      <div className="page-card" style={{ marginTop: 12 }}>
        <h3><RadarChartOutlined style={{ marginRight: 6 }} /> Find Nearby Schools</h3>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
          Enter GPS coordinates or use your current location to find schools in the area.
        </p>

        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Latitude (e.g. -26.2041)"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              prefix={<AimOutlined style={{ color: "#1890ff" }} />}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Longitude (e.g. 28.0473)"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              prefix={<EnvironmentOutlined style={{ color: "#52c41a" }} />}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={handleUseMyLocation} icon={<AimOutlined />} style={{ borderRadius: 8 }}>
                {isMobile ? "GPS" : "Use My Location"}
              </Button>
              <Button
                type="primary"
                onClick={handleFindNearby}
                loading={nearbyLoading}
                icon={<SearchOutlined />}
                style={{ borderRadius: 8 }}
              >
                Search
              </Button>
            </div>
          </Col>
        </Row>

        <div style={{ marginTop: 12 }}>
          <span style={{ fontSize: 12, color: "#888" }}>Radius: {radiusKm} km</span>
          <Slider
            min={1}
            max={50}
            value={radiusKm}
            onChange={setRadiusKm}
            marks={{ 1: "1km", 10: "10km", 25: "25km", 50: "50km" }}
            tooltip={{ formatter: (val) => `${val} km` }}
          />
        </div>
      </div>

      {/* Nearby Results */}
      {nearbySchools.length > 0 && (
        <div className="page-card">
          <h3><EnvironmentOutlined style={{ marginRight: 6 }} /> Schools Found ({nearbySchools.length})</h3>
          <Row gutter={[12, 12]}>
            {nearbySchools.slice(0, 12).map((school) => (
              <Col xs={24} sm={12} md={8} key={school.id}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    cursor: "pointer",
                    height: "100%",
                  }}
                  styles={{ body: { padding: 12 } }}
                  onClick={() => navigate(`/school-institutions/${school.id}`)}
                  hoverable
                >
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, lineHeight: 1.3 }}>
                    {school.officialInstitutionName}
                  </div>
                  <div style={{ fontSize: 11, color: "#888" }}>
                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                    {school.townCity || school.province || "—"}
                  </div>
                  <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {school.phase && <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>{school.phase}</Tag>}
                    {school.sector && <Tag color="green" style={{ fontSize: 10, margin: 0 }}>{school.sector}</Tag>}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          {nearbySchools.length > 12 && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <Tag color="blue">{nearbySchools.length - 12} more schools not shown</Tag>
            </div>
          )}
        </div>
      )}

      {/* Quick Navigation */}
      <div className="page-card" style={{ textAlign: "center" }}>
        <Button
          type="primary"
          icon={<BookOutlined />}
          onClick={() => navigate("/school-institutions")}
          style={{ borderRadius: 8, marginRight: 12 }}
        >
          Browse All Schools
        </Button>
        <Button
          icon={<BankOutlined />}
          onClick={() => navigate("/school-institutions/add")}
          style={{ borderRadius: 8 }}
        >
          Add New School
        </Button>
      </div>
    </div>
  );
};

export default SchoolInstitutionStats;
