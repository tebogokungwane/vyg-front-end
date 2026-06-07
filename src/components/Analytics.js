import { useEffect, useState, useContext } from "react";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Select, Spin, Tag, Segmented } from "antd";
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Tooltip, Legend, Filler
);

const { Option } = Select;

const COLORS = [
  "#667eea", "#f093fb", "#4facfe", "#43e97b", "#fa709a",
  "#a18cd1", "#fbc2eb", "#00f2fe", "#fee140", "#38f9d7",
  "#f5576c", "#764ba2",
];

const Analytics = () => {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.address?.id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/points/summary/address/${user.address.id}`);
      const transformed = (res.data || []).map((item) => {
        const date = dayjs(item.dateCaptured);
        return {
          ...item,
          weekNumber: date.isoWeek(),
          month: date.month() + 1,
          year: date.year(),
          totalCalc: (item.points * item.numberOfPeople) || item.totalPoints || item.points || 0,
          nationName: item.nation?.nation || "Unknown",
        };
      });
      setData(transformed);

      // Set defaults
      if (transformed.length > 0) {
        const years = [...new Set(transformed.map((i) => i.year))].sort((a, b) => b - a);
        const months = [...new Set(transformed.map((i) => i.month))].sort((a, b) => b - a);
        const weeks = [...new Set(transformed.map((i) => i.weekNumber))].sort((a, b) => b - a);
        if (years.length) setSelectedYear(years[0]);
        if (months.length) setSelectedMonth(months[0]);
        if (weeks.length) setSelectedWeek(weeks[0]);
      }
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on view mode
  const getFilteredData = () => {
    if (viewMode === "weekly") return data.filter((d) => d.weekNumber === selectedWeek && d.year === selectedYear);
    if (viewMode === "monthly") return data.filter((d) => d.month === selectedMonth && d.year === selectedYear);
    if (viewMode === "yearly") return data.filter((d) => d.year === selectedYear);
    return data;
  };

  // Aggregate by nation
  const getAggregated = () => {
    const filtered = getFilteredData();
    const nationMap = {};
    filtered.forEach((item) => {
      if (!nationMap[item.nationName]) {
        nationMap[item.nationName] = { points: 0, people: 0, events: 0 };
      }
      nationMap[item.nationName].points += item.totalCalc;
      nationMap[item.nationName].people += item.numberOfPeople || 0;
      nationMap[item.nationName].events += 1;
    });
    return Object.entries(nationMap)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.points - a.points);
  };

  // Weekly trend data for line chart
  const getTrendData = () => {
    const filtered = data.filter((d) => d.year === selectedYear);
    const nationNames = [...new Set(filtered.map((d) => d.nationName))];
    const weeks = [...new Set(filtered.map((d) => d.weekNumber))].sort((a, b) => a - b);

    const datasets = nationNames.map((nation, idx) => {
      const weeklyPoints = weeks.map((week) => {
        return filtered
          .filter((d) => d.nationName === nation && d.weekNumber === week)
          .reduce((sum, d) => sum + d.totalCalc, 0);
      });

      return {
        label: nation,
        data: weeklyPoints,
        borderColor: COLORS[idx % COLORS.length],
        backgroundColor: COLORS[idx % COLORS.length] + "33",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
      };
    });

    return {
      labels: weeks.map((w) => `W${w}`),
      datasets,
    };
  };

  const aggregated = getAggregated();
  const totalPoints = aggregated.reduce((sum, n) => sum + n.points, 0);
  const totalPeople = aggregated.reduce((sum, n) => sum + n.people, 0);

  // Chart data
  const barChartData = {
    labels: aggregated.map((n) => n.name),
    datasets: [
      {
        label: "Points",
        data: aggregated.map((n) => n.points),
        backgroundColor: aggregated.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const pieChartData = {
    labels: aggregated.map((n) => n.name),
    datasets: [
      {
        data: aggregated.map((n) => n.points),
        backgroundColor: aggregated.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: isMobile ? "bottom" : "top", labels: { padding: 16, font: { size: 12 } } },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: chartType === "bar" ? {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" } },
      x: { grid: { display: false } },
    } : undefined,
  };

  const uniqueWeeks = [...new Set(data.map((d) => d.weekNumber))].sort((a, b) => b - a);
  const uniqueMonths = [...new Set(data.map((d) => d.month))].sort((a, b) => b - a);
  const uniqueYears = [...new Set(data.map((d) => d.year))].sort((a, b) => b - a);

  if (loading) {
    return <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      {/* Summary Stats */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Total Points", value: totalPoints.toLocaleString(), color: "#667eea" },
          { label: "Total People", value: totalPeople.toLocaleString(), color: "#f093fb" },
          { label: "Nations", value: aggregated.length, color: "#43e97b" },
          { label: "Leader", value: aggregated[0]?.name || "—", color: "#fa709a", isText: true },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              flex: isMobile ? "1 1 calc(50% - 8px)" : "1 1 0",
              padding: "14px 16px",
              borderRadius: 14,
              background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}08)`,
              border: `1px solid ${stat.color}30`,
            }}
          >
            <div style={{ fontSize: 11, color: "#888" }}>{stat.label}</div>
            <div style={{ fontSize: stat.isText ? 14 : 20, fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <Segmented
          options={[
            { label: "All", value: "all" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
            { label: "Yearly", value: "yearly" },
          ]}
          value={viewMode}
          onChange={setViewMode}
          style={{ borderRadius: 8 }}
        />

        {viewMode === "weekly" && (
          <Select value={selectedWeek} onChange={setSelectedWeek} style={{ width: 100 }}>
            {uniqueWeeks.map((w) => <Option key={w} value={w}>Week {w}</Option>)}
          </Select>
        )}
        {viewMode === "monthly" && (
          <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 120 }}>
            {uniqueMonths.map((m) => <Option key={m} value={m}>{dayjs().month(m - 1).format("MMMM")}</Option>)}
          </Select>
        )}
        {(viewMode === "weekly" || viewMode === "monthly" || viewMode === "yearly") && (
          <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 90 }}>
            {uniqueYears.map((y) => <Option key={y} value={y}>{y}</Option>)}
          </Select>
        )}

        <div style={{ marginLeft: "auto" }}>
          <Segmented
            options={[
              { label: <BarChartOutlined />, value: "bar" },
              { label: <PieChartOutlined />, value: "doughnut" },
              { label: <LineChartOutlined />, value: "line" },
            ]}
            value={chartType}
            onChange={setChartType}
          />
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: isMobile ? 12 : 24,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          border: "1px solid #f0f0f0",
          marginBottom: 20,
        }}
      >
        <div style={{ height: isMobile ? 280 : 380 }}>
          {chartType === "bar" && <Bar data={barChartData} options={chartOptions} />}
          {chartType === "doughnut" && <Doughnut data={pieChartData} options={chartOptions} />}
          {chartType === "line" && <Line data={getTrendData()} options={chartOptions} />}
        </div>
      </div>

      {/* Nation Ranking */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: isMobile ? 12 : 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          border: "1px solid #f0f0f0",
        }}
      >
        <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#888" }}>
          <TrophyOutlined style={{ marginRight: 6 }} />
          RANKING
        </h4>
        {aggregated.map((nation, idx) => (
          <div
            key={nation.name}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 6,
              background: idx === 0 ? "#fffbe6" : idx % 2 === 0 ? "#fafafa" : "transparent",
              border: idx === 0 ? "1px solid #ffe58f" : "none",
              gap: 12,
            }}
          >
            <span style={{ fontWeight: 700, color: idx < 3 ? "#faad14" : "#888", width: 24 }}>
              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
            </span>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: COLORS[idx % COLORS.length],
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{nation.name}</span>
            <Tag color="blue">{nation.events} events</Tag>
            <span style={{ fontWeight: 700, fontSize: 14, color: COLORS[idx % COLORS.length] }}>
              {nation.points.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
