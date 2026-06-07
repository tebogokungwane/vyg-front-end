import { useEffect, useState, useContext } from "react";
import {
  Select,
  Modal,
  Button,
  message,
  Spin,
  Alert,
  Typography,
  Avatar,
  Tag,
  Progress,
} from "antd";
import axios from "../utils/axios";
import defaultImage from "../images/vyg.jpg";
import UserContext from "../context/UserContext";

const baseURL = axios.defaults.baseURL;
const { Text } = Typography;

const NationPerformanceOverview = () => {
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleNation, setVisibleNation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [nationSummaries, setNationSummaries] = useState({});
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const addressId = user?.address?.id;
        if (!addressId) return;

        const [nationsRes, performanceRes, memberStatsRes] = await Promise.all([
          axios.get(`/api/nations`),
          axios.get(`/api/points/summary/address/${addressId}`),
          axios.get(`/api/nation-stats/member-stats/${addressId}`),
        ]);

        const grouped = {};
        if (Array.isArray(performanceRes.data)) {
          performanceRes.data.forEach((entry) => {
            if (!entry?.nation?.id) return;
            const nationId = entry.nation.id;
            const date = entry.dateCaptured;
            if (!grouped[nationId]) {
              grouped[nationId] = { nation: entry.nation, performanceByDate: {} };
            }
            if (!grouped[nationId].performanceByDate[date]) {
              grouped[nationId].performanceByDate[date] = [];
            }
            grouped[nationId].performanceByDate[date].push(entry);
          });
        }

        // Calculate max points for progress bars
        let maxPoints = 0;

        const enrichedNations = nationsRes.data.map((nation) => {
          const memberStat = memberStatsRes.data.find((stat) => stat.nationId === nation.id) || {
            totalMembers: 0,
            totalMentors: 0,
            totalSecretaries: 0,
          };

          const totalPoints = Object.values(grouped[nation.id]?.performanceByDate || {})
            .flat()
            .reduce((sum, e) => sum + (e.points || 0), 0);

          if (totalPoints > maxPoints) maxPoints = totalPoints;

          return {
            ...nation,
            imageUrl: nation.imageName
              ? `${baseURL}/api/nations/${nation.id}/image`
              : defaultImage,
            performanceByDate: grouped[nation.id]?.performanceByDate || {},
            fallbackImage: defaultImage,
            totalPoints,
            ...memberStat,
          };
        });

        // Sort by total points descending
        enrichedNations.sort((a, b) => b.totalPoints - a.totalPoints);
        // Attach maxPoints for progress calculation
        enrichedNations.forEach((n) => (n.maxPoints = maxPoints));

        setNations(enrichedNations);
        setNationSummaries(grouped);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load nation data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getDateOptions = (nation) => {
    if (!nation?.id) return [];
    const summary = nationSummaries[nation.id];
    return summary ? Object.keys(summary.performanceByDate).sort().reverse() : [];
  };

  const getPerformanceByDate = (nation, date) => {
    if (!nation?.id || !date) return { totalPoints: 0, events: [] };
    const summary = nationSummaries[nation.id];
    const entries = summary?.performanceByDate?.[date] || [];

    const breakdown = entries.reduce((acc, entry) => {
      if (!entry?.baseEvent?.name) return acc;
      const event = entry.baseEvent.name;
      if (!acc[event]) acc[event] = { people: 0, points: 0 };
      acc[event].people += entry.numberOfPeople || 0;
      acc[event].points += entry.points || 0;
      return acc;
    }, {});

    return {
      totalPoints: entries.reduce((sum, e) => sum + (e.points || 0), 0),
      events: Object.entries(breakdown).map(([eventName, stats]) => ({
        eventName,
        ...stats,
      })),
    };
  };

  const getRankColor = (index) => {
    if (index === 0) return "#faad14";
    if (index === 1) return "#8c8c8c";
    if (index === 2) return "#d48806";
    return "#1890ff";
  };

  const getRankEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  if (error) {
    return <Alert message="Error loading performance data" type="error" showIcon style={{ margin: 16 }} />;
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!nations.length) {
    return <Alert message="No nation data available" type="info" showIcon style={{ margin: 16 }} />;
  }

  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>🏆 Nation Performance</h3>
        <Tag color="blue">{nations.length} Nations</Tag>
      </div>

      {/* Nation cards - horizontal scroll on mobile, grid on desktop */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {nations.map((nation, index) => {
          const dateOptions = getDateOptions(nation);
          const progressPercent = nation.maxPoints > 0 ? (nation.totalPoints / nation.maxPoints) * 100 : 0;

          return (
            <div
              key={nation.id}
              onClick={() => {
                setVisibleNation(nation);
                setSelectedDate(dateOptions[0] || null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 10 : 16,
                padding: isMobile ? "12px 10px" : "14px 16px",
                borderRadius: 14,
                background: index === 0 ? "linear-gradient(135deg, #fff9e6, #fffbe6)" : "#fafafa",
                border: index === 0 ? "1px solid #ffe58f" : "1px solid #f0f0f0",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: index === 0 ? "0 2px 8px rgba(250, 173, 20, 0.15)" : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(4px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.boxShadow = index === 0 ? "0 2px 8px rgba(250, 173, 20, 0.15)" : "none";
              }}
            >
              {/* Rank */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: index < 3 ? 16 : 12,
                  fontWeight: 700,
                  color: getRankColor(index),
                  background: index < 3 ? "rgba(250,173,20,0.1)" : "rgba(24,144,255,0.06)",
                  flexShrink: 0,
                }}
              >
                {getRankEmoji(index)}
              </div>

              {/* Nation logo */}
              <Avatar
                src={nation.imageUrl}
                size={isMobile ? 36 : 42}
                shape="square"
                style={{ borderRadius: 10, flexShrink: 0 }}
                onError={() => true}
              />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {nation.nation}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: getRankColor(index), flexShrink: 0, marginLeft: 8 }}>
                    {nation.totalPoints.toLocaleString()} pts
                  </span>
                </div>
                <Progress
                  percent={progressPercent}
                  showInfo={false}
                  size="small"
                  strokeColor={getRankColor(index)}
                  style={{ marginBottom: 4 }}
                />
                <div style={{ fontSize: 11, color: "#888" }}>
                  {nation.totalMembers} members • {nation.totalMentors} mentors • {dateOptions.length} records
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              src={visibleNation?.imageUrl}
              size={36}
              shape="square"
              style={{ borderRadius: 10 }}
            />
            <span>{visibleNation?.nation || "Nation Performance"}</span>
          </div>
        }
        open={!!visibleNation}
        onCancel={() => setVisibleNation(null)}
        footer={null}
        width={isMobile ? "95%" : 600}
      >
        {visibleNation && getDateOptions(visibleNation).length > 0 ? (
          <>
            <Select
              style={{ width: "100%", marginBottom: 20 }}
              value={selectedDate}
              onChange={setSelectedDate}
              options={getDateOptions(visibleNation).map((date) => ({
                value: date,
                label: new Date(date).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              }))}
            />

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 13, color: "#888" }}>EVENT BREAKDOWN</Text>
            </div>

            {getPerformanceByDate(visibleNation, selectedDate).events.length > 0 ? (
              getPerformanceByDate(visibleNation, selectedDate).events.map((event, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    marginBottom: 8,
                    borderRadius: 10,
                    background: "#f9f9f9",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{event.eventName}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{event.people} people</div>
                  </div>
                  <Tag color="blue" style={{ fontWeight: 600 }}>{event.points} pts</Tag>
                </div>
              ))
            ) : (
              <Text type="secondary">No events for this date</Text>
            )}

            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #e6f7ff, #f0f5ff)",
                textAlign: "center",
              }}
            >
              <Text strong style={{ fontSize: 16 }}>
                Total: {getPerformanceByDate(visibleNation, selectedDate).totalPoints.toLocaleString()} points
              </Text>
            </div>
          </>
        ) : (
          <Alert message="No detailed data available for this nation." type="info" showIcon />
        )}
      </Modal>
    </div>
  );
};

export default NationPerformanceOverview;
