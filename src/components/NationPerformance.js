import { useState, useEffect, useContext } from "react";
import { Table, Select, Avatar, DatePicker, message, Tag } from "antd";
import { TrophyTwoTone, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from "@ant-design/icons";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";
import defaultImage from "../images/vyg.jpg";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

const { Option } = Select;

const NationPerformance = () => {
  const [nationsInfo, setNationsInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("yearly");
  const [dateFilter, setDateFilter] = useState(dayjs());
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStandings = async () => {
      if (!user?.address?.id) return;

      setLoading(true);
      try {
        const year = dateFilter.year();
        const week = dateFilter.isoWeek();
        const month = dateFilter.month() + 1;

        // Use the working summary endpoint (same one charts use)
        const res = await axios.get(`/api/points/summary/address/${user.address.id}`);
        console.log("📊 Summary API response:", res.data);

        // Get nations info for logos
        const nationsRes = await axios.get(`/api/nations`);

        // Transform and filter data based on viewMode and date
        const transformed = res.data.map((item) => {
          const date = dayjs(item.dateCaptured);
          return {
            ...item,
            weekNumber: date.isoWeek(),
            month: date.month() + 1,
            year: date.year(),
            calculatedPoints: item.points * item.numberOfPeople || item.totalPoints || item.points || 0,
          };
        });

        // Filter by selected time period
        let filtered = transformed;
        if (viewMode === "weekly") {
          filtered = transformed.filter(
            (item) => item.weekNumber === week && item.year === year
          );
        } else if (viewMode === "monthly") {
          filtered = transformed.filter(
            (item) => item.month === month && item.year === year
          );
        } else if (viewMode === "yearly") {
          filtered = transformed.filter((item) => item.year === year);
        }

        // Aggregate points per nation
        const nationMap = {};
        filtered.forEach((item) => {
          const nationName = item.nation?.nation || "Unknown";
          if (!nationMap[nationName]) {
            nationMap[nationName] = {
              nation: nationName,
              totalPoints: 0,
              eventsPlayed: 0,
              totalMembers: 0,
              nationId: item.nation?.id,
            };
          }
          nationMap[nationName].totalPoints += item.calculatedPoints;
          nationMap[nationName].eventsPlayed += 1;
          nationMap[nationName].totalMembers += item.numberOfPeople || 0;
        });

        // Enrich with logos and sort by total points (league style)
        const enriched = Object.values(nationMap).map((stat) => {
          const match = nationsRes.data.find((n) => n.nation === stat.nation);
          return {
            ...stat,
            logo: match?.imageName
              ? `${axios.defaults.baseURL}/api/nations/${match.id}/image`
              : defaultImage,
          };
        });

        const sorted = enriched
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((row, index) => ({
            ...row,
            key: row.nation,
            position: index + 1,
          }));

        setNationsInfo(sorted);
      } catch (err) {
        console.error("Failed to fetch standings", err);
        message.error("Failed to load nation performance.");
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [user, viewMode, dateFilter]);

  // Determine form/trend indicator
  const getPositionStyle = (position) => {
    if (position === 1) return { background: "#f6ffed", borderLeft: "4px solid #52c41a" };
    if (position === 2) return { background: "#e6f7ff", borderLeft: "4px solid #1890ff" };
    if (position === 3) return { background: "#fff7e6", borderLeft: "4px solid #faad14" };
    return {};
  };

  const columns = [
    {
      title: "Pos",
      dataIndex: "position",
      key: "position",
      width: 60,
      align: "center",
      render: (pos) => {
        if (pos === 1) {
          return (
            <span style={{ fontWeight: "bold", fontSize: 16 }}>
              <TrophyTwoTone twoToneColor="#FFD700" style={{ fontSize: 18, marginRight: 4 }} />
              {pos}
            </span>
          );
        }
        if (pos === 2) {
          return <span style={{ fontWeight: "bold", color: "#1890ff" }}>{pos}</span>;
        }
        if (pos === 3) {
          return <span style={{ fontWeight: "bold", color: "#faad14" }}>{pos}</span>;
        }
        return <span>{pos}</span>;
      },
    },
    {
      title: "Nation",
      dataIndex: "nation",
      key: "nation",
      render: (text, record) => (
        <span style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={record.logo}
            size={32}
            onError={() => {
              const updated = nationsInfo.map((n) =>
                n.nation === record.nation ? { ...n, logo: defaultImage } : n
              );
              setNationsInfo(updated);
            }}
            style={{ marginRight: 8 }}
          />
          <span style={{ fontWeight: record.position <= 3 ? "bold" : "normal" }}>
            {text}
          </span>
        </span>
      ),
    },
    {
      title: "P",
      dataIndex: "eventsPlayed",
      key: "eventsPlayed",
      align: "center",
      width: 60,
      responsive: ["sm"],
    },
    {
      title: "Members",
      dataIndex: "totalMembers",
      key: "totalMembers",
      align: "center",
      width: 90,
      responsive: ["md"],
    },
    {
      title: "Pts",
      dataIndex: "totalPoints",
      key: "totalPoints",
      align: "center",
      width: 80,
      render: (pts, record) => (
        <Tag
          color={record.position === 1 ? "green" : record.position === 2 ? "blue" : record.position === 3 ? "orange" : "default"}
          style={{ fontWeight: "bold", fontSize: 14, padding: "2px 10px" }}
        >
          {pts.toLocaleString()}
        </Tag>
      ),
    },
  ];

  const getPickerType = () => {
    if (viewMode === "weekly") return "week";
    if (viewMode === "monthly") return "month";
    if (viewMode === "yearly") return "year";
    return "date";
  };

  const getFormat = () => {
    if (viewMode === "weekly") return "YYYY-[W]WW";
    if (viewMode === "monthly") return "MMMM YYYY";
    if (viewMode === "yearly") return "YYYY";
    return "YYYY-MM-DD";
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h2>🏆 Nation League Standings</h2>
        <p>Track nation performance rankings</p>
      </div>

      <div className="page-card">
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <Select
            style={{ width: 140 }}
            value={viewMode}
            onChange={setViewMode}
          >
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
            <Option value="yearly">Yearly</Option>
          </Select>

          <DatePicker
            picker={getPickerType()}
            format={getFormat()}
            value={dateFilter}
            allowClear={false}
            onChange={(value) => {
              if (value) setDateFilter(value);
            }}
            onPanelChange={(value) => {
              if (value && viewMode !== "weekly") {
                setDateFilter(value);
              }
            }}
          />
        </div>
      </div>

      {/* League Table */}
      <div className="page-card modern-table">
        <Table
          dataSource={nationsInfo}
          columns={columns}
          pagination={false}
          bordered={false}
          size={isMobile ? "small" : "middle"}
          rowClassName={(record) =>
            record.position === 1
              ? "league-first"
              : record.position === 2
              ? "league-second"
              : record.position === 3
              ? "league-third"
              : ""
          }
          scroll={{ x: true }}
          loading={loading}
          locale={{
            emptyText: loading ? "Loading standings..." : "No standings data available for this period",
          }}
          style={{ borderRadius: 8 }}
        />
      </div>



      <style>{`
        .league-first td { background: #f6ffed !important; }
        .league-second td { background: #e6f7ff !important; }
        .league-third td { background: #fff7e6 !important; }
        .ant-table-row:hover td { background: #fafafa !important; }
        .league-first:hover td { background: #d9f7be !important; }
        .league-second:hover td { background: #bae7ff !important; }
        .league-third:hover td { background: #ffe7ba !important; }
      `}</style>
    </div>
  );
};

export default NationPerformance;
