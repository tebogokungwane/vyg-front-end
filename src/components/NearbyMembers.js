import { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Alert,
  Input,
  Tag,
  Avatar,
  Empty,
  Typography,
  Badge,
  Tooltip,
  Select,
  Slider,
  Button,
  message,
} from "antd";
import {
  EnvironmentOutlined,
  SearchOutlined,
  TeamOutlined,
  RadarChartOutlined,
  UserOutlined,
  PhoneOutlined,
  AimOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";
import LocationPicker from "./LocationPicker";

const { Text } = Typography;
const { Option } = Select;

/**
 * Returns a color and label based on distance in km
 */
const getDistanceCategory = (distanceKm) => {
  if (distanceKm <= 2) return { label: "Very Close", color: "#52c41a" };
  if (distanceKm <= 5) return { label: "Nearby", color: "#faad14" };
  if (distanceKm <= 10) return { label: "In the Area", color: "#1890ff" };
  if (distanceKm <= 20) return { label: "Reachable", color: "#722ed1" };
  return { label: "Far", color: "#8c8c8c" };
};

const NearbyMembers = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [settingBranchLocation, setSettingBranchLocation] = useState(false);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [branchAddress, setBranchAddress] = useState("");
  const [branchLat, setBranchLat] = useState(null);
  const [branchLng, setBranchLng] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [stats, setStats] = useState({ veryClose: 0, nearby: 0, inArea: 0, total: 0 });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchNearbyMembers = async (radius = radiusKm) => {
    const addressId = user?.address?.id;
    if (!addressId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Call backend endpoint that uses Haversine formula
      const response = await axios.get(
        `/api/member/nearby?addressId=${addressId}&radiusKm=${radius}`,
        { headers }
      );

      const data = response.data;

      // The backend returns: { branchAddress, branchLat, branchLng, members: [...] }
      setBranchAddress(data.branchAddress || "");
      setBranchLat(data.branchLat || null);
      setBranchLng(data.branchLng || null);

      const membersWithCategory = (data.members || []).map((m) => ({
        ...m,
        distanceCategory: getDistanceCategory(m.distanceKm),
      }));

      setMembers(membersWithCategory);
      setFilteredMembers(membersWithCategory);

      // Calculate stats
      setStats({
        veryClose: membersWithCategory.filter((m) => m.distanceKm <= 2).length,
        nearby: membersWithCategory.filter((m) => m.distanceKm > 2 && m.distanceKm <= 5).length,
        inArea: membersWithCategory.filter((m) => m.distanceKm > 5 && m.distanceKm <= 10).length,
        total: membersWithCategory.length,
      });
    } catch (err) {
      console.error("Error fetching nearby members:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || "";
      const isNoCoordinates =
        err.response?.status === 400 ||
        (typeof errorMsg === "string" && errorMsg.toLowerCase().includes("no coordinates"));

      if (err.response?.status === 404) {
        setError("Nearby members endpoint not available. Please ensure the backend is updated.");
      } else if (isNoCoordinates) {
        setNeedsSetup(true);
      } else {
        setError("Failed to load nearby members. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyMembers();
  }, [user?.address?.id]);

  // Filter logic
  useEffect(() => {
    let filtered = members;

    if (searchText) {
      filtered = filtered.filter((m) =>
        `${m.name} ${m.surname} ${m.residentialAddress}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(
        (m) => m.distanceCategory.label === categoryFilter
      );
    }

    setFilteredMembers(filtered);
  }, [searchText, categoryFilter, members]);

  const handleRadiusChange = (value) => {
    setRadiusKm(value);
  };

  const handleRadiusSearch = () => {
    fetchNearbyMembers(radiusKm);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon style={{ margin: 20 }} />;
  }

  // Branch needs GPS coordinates set up first
  if (needsSetup) {
    const handleBranchLocationSelect = async (lat, lng, displayAddress) => {
      setSettingBranchLocation(true);
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `/api/addresses/${user?.address?.id}/coordinates`,
          { latitude: lat, longitude: lng },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Branch location set! Loading nearby members...");
        setNeedsSetup(false);
        fetchNearbyMembers();
      } catch (err) {
        console.error("Failed to set branch coordinates:", err);
        message.error("Failed to save branch location. Please try again.");
      } finally {
        setSettingBranchLocation(false);
      }
    };

    return (
      <div className="page-wrapper">
        <div className="page-header">
          <h2>
            <RadarChartOutlined style={{ marginRight: 8 }} />
            Set Up Nearby Members
          </h2>
          <p>Your branch needs a location set before we can find nearby members</p>
        </div>

        <div className="info-banner orange">
          <EnvironmentOutlined style={{ fontSize: 18 }} />
          <div>
            Your branch does not have GPS coordinates yet. Search for your church/branch address below to set it up.
          </div>
        </div>

        <div className="page-card">
          <h3>Search Your Branch Address</h3>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
            Type your church or branch address (e.g. "VYG CBC Roodepoort" or "Church Street, Soweto")
          </p>
          <LocationPicker
            onLocationSelect={handleBranchLocationSelect}
            style={{ border: "none", padding: 0, background: "transparent" }}
          />
          {settingBranchLocation && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Spin /> <span style={{ marginLeft: 8 }}>Saving branch location...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h2>
          <RadarChartOutlined style={{ marginRight: 8 }} />
          Nearby Members
        </h2>
        <p>Members who live close to your branch (based on GPS distance)</p>
      </div>

      {/* Branch Location Banner */}
      <div className="info-banner blue">
        <EnvironmentOutlined style={{ fontSize: 18 }} />
        <div>
          <strong>Your Branch:</strong> {branchAddress || "Not set"}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stat-row">
        <div className="stat-mini">
          <div className="stat-mini-label">Within 2km</div>
          <div className="stat-mini-value" style={{ color: "#52c41a" }}>
            {stats.veryClose}
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">2-5km</div>
          <div className="stat-mini-value" style={{ color: "#faad14" }}>
            {stats.nearby}
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">5-10km</div>
          <div className="stat-mini-value" style={{ color: "#1890ff" }}>
            {stats.inArea}
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">Total Found</div>
          <div className="stat-mini-value">{stats.total}</div>
        </div>
      </div>

      {/* Map Preview */}
      {branchLat && branchLng && (
        <div className="page-card" style={{ padding: 0, overflow: "hidden" }}>
          <iframe
            title="Branch Area Map"
            width="100%"
            height={isMobile ? 200 : 280}
            frameBorder="0"
            style={{ border: 0, display: "block" }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${branchLng - 0.05},${branchLat - 0.03},${branchLng + 0.05},${branchLat + 0.03}&layer=mapnik&marker=${branchLat},${branchLng}`}
            allowFullScreen
          />
        </div>
      )}

      {/* Radius Control */}
      <div className="page-card">
        <h3>Search Radius</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <Slider
              min={1}
              max={50}
              value={radiusKm}
              onChange={handleRadiusChange}
              marks={{ 1: "1km", 10: "10km", 25: "25km", 50: "50km" }}
              tooltip={{ formatter: (val) => `${val} km` }}
            />
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRadiusSearch}
            style={{ borderRadius: 8 }}
          >
            Search {radiusKm}km
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="page-card">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Input
            placeholder="Search by name or address..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? "100%" : 250, borderRadius: 8 }}
            allowClear
          />
          <Select
            placeholder="Filter by distance"
            value={categoryFilter}
            onChange={setCategoryFilter}
            allowClear
            style={{ width: 160, borderRadius: 8 }}
          >
            <Option value="Very Close">Very Close (0-2km)</Option>
            <Option value="Nearby">Nearby (2-5km)</Option>
            <Option value="In the Area">In the Area (5-10km)</Option>
            <Option value="Reachable">Reachable (10-20km)</Option>
          </Select>
          <Tag color="blue" style={{ marginLeft: "auto" }}>
            <TeamOutlined /> {filteredMembers.length} found
          </Tag>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="page-card">
          <Empty
            description="No members found within this radius"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
          {filteredMembers.map((member) => (
            <Col xs={24} sm={12} md={8} key={member.id}>
              <Card
                style={{
                  borderRadius: 16,
                  border: "none",
                  overflow: "hidden",
                  height: "100%",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
                styles={{ body: { padding: isMobile ? 14 : 18 } }}
              >
                {/* Distance Badge */}
                <div style={{ position: "absolute", top: 12, right: 12 }}>
                  <Tooltip title={`${member.distanceKm.toFixed(1)} km from your branch`}>
                    <Badge
                      count={
                        <span
                          style={{
                            background: member.distanceCategory.color,
                            color: "#fff",
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 10,
                            fontWeight: 600,
                          }}
                        >
                          {member.distanceKm.toFixed(1)} km
                        </span>
                      }
                    />
                  </Tooltip>
                </div>

                {/* Member Info */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Avatar
                    size={44}
                    style={{
                      background: `linear-gradient(135deg, ${member.distanceCategory.color}, ${member.distanceCategory.color}88)`,
                      flexShrink: 0,
                    }}
                    icon={<UserOutlined />}
                  >
                    {member.name?.charAt(0)}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 14, display: "block" }}>
                      {member.name} {member.surname}
                    </Text>
                    <Tag
                      color={member.distanceCategory.color}
                      style={{ marginTop: 4, fontSize: 11, border: "none" }}
                    >
                      {member.distanceCategory.label}
                    </Tag>
                    {member.nationName && (
                      <Tag color="purple" style={{ marginTop: 4, fontSize: 11 }}>
                        {member.nationName}
                      </Tag>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 10px",
                    background: "rgba(0,0,0,0.02)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#666",
                  }}
                >
                  <EnvironmentOutlined style={{ marginRight: 6, color: member.distanceCategory.color }} />
                  {member.residentialAddress || "No address recorded"}
                </div>

                {/* Contact */}
                {member.cellNumber && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#888",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <PhoneOutlined />
                    {member.cellNumber}
                  </div>
                )}

                {/* Branch info */}
                {member.branchName && (
                  <div style={{ marginTop: 8, fontSize: 11, color: "#aaa" }}>
                    <AimOutlined style={{ marginRight: 4 }} />
                    Currently at: <strong>{member.branchName}</strong>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default NearbyMembers;
