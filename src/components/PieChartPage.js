import React, { useEffect, useState, useContext } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Select, Card, Row, Col, message, Radio, Tabs, Space } from "antd";
import axios from "../utils/axios";
import UserContext from "../context/UserContext";

ChartJS.register(ArcElement, Tooltip, Legend);
const { Option } = Select;
const { TabPane } = Tabs;

const NationPerformancePieChart = () => {
  const [data, setData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState("points");
  const [activeTab, setActiveTab] = useState("weekly");

  useEffect(() => {
    const fetchNationPoints = async () => {
      if (!user?.address?.id) {
        message.error("User address ID not found.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/points/summary/address/${user.address.id}`);
        setData(res.data);
        setLoading(false);

        if (res.data.length > 0) {
          setSelectedWeek(Math.max(...new Set(res.data.map(item => item.weekNumber))));
          setSelectedMonth(Math.max(...new Set(res.data.map(item => item.month))));
          setSelectedYear(Math.max(...new Set(res.data.map(item => item.year))));
        }
      } catch (err) {
        console.error("Error fetching nation points:", err);
        message.error("Failed to load nation points");
        setLoading(false);
      }
    };

    fetchNationPoints();
  }, [user]);

  const uniqueWeeks = [...new Set(data.map((item) => item.weekNumber))].sort((a, b) => b - a);
  const uniqueMonths = [...new Set(data.map((item) => item.month))].sort((a, b) => b - a);
  const uniqueYears = [...new Set(data.map((item) => item.year))].sort((a, b) => b - a);

  const prepareChartData = (timePeriod) => {
    let filtered = [...data];
    let title = "";
    
    if (timePeriod === "weekly") {
      filtered = filtered.filter(item => item.weekNumber === selectedWeek);
      title = `Week ${selectedWeek}`;
    } else if (timePeriod === "monthly") {
      filtered = filtered.filter(item => item.month === selectedMonth);
      title = `Month ${selectedMonth}`;
    } else {
      filtered = filtered.filter(item => item.year === selectedYear);
      title = `Year ${selectedYear}`;
    }

    const nationData = {};
    
    filtered.forEach((item) => {
      const nation = item.nation.nation;
      if (!nationData[nation]) {
        nationData[nation] = { points: 0, people: 0 };
      }
      nationData[nation].points += item.totalPointsEarnedPerWeek;
      nationData[nation].people += item.numberOfPeople;
    });

    const labels = Object.keys(nationData);
    const values = labels.map((nation) => nationData[nation][displayMode]);

    // Generate vibrant distinct colors
    const step = 360 / labels.length;
    const backgroundColors = labels.map((_, i) => 
      `hsl(${Math.round(i * step)}, 80%, 60%)`
    );

    return {
      title,
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        bodyFont: {
          size: 14
        },
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.formattedValue || '';
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      title: {
        display: true,
        text: '',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      }
    },
    cutout: '50%', // Makes a donut chart for better visibility
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const renderTimeSelector = () => {
    switch (activeTab) {
      case "weekly":
        return (
          <Select
            value={selectedWeek}
            onChange={setSelectedWeek}
            style={{ width: 150 }}
            size="large"
          >
            {uniqueWeeks.map((week) => (
              <Option key={week} value={week}>
                Week {week}
              </Option>
            ))}
          </Select>
        );
      case "monthly":
        return (
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: 150 }}
            size="large"
          >
            {uniqueMonths.map((month) => (
              <Option key={month} value={month}>
                Month {month}
              </Option>
            ))}
          </Select>
        );
      case "yearly":
        return (
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 150 }}
            size="large"
          >
            {uniqueYears.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  return (
<div style={{ padding: "60px 20px 24px", maxWidth: "100vw" }}>
{/* <h2 style={{ 
        textAlign: "center", 
        marginBottom: "24px",
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a'
      }}>
        🏆 Nation Performance Distribution
      </h2> */}

      <Row justify="center" style={{ marginBottom: '24px' }}>
        <Space size="large">
          <Radio.Group 
            value={displayMode} 
            onChange={(e) => setDisplayMode(e.target.value)}
            buttonStyle="solid"
            size="large"
          >
            <Radio.Button value="points">Points Distribution</Radio.Button>
            <Radio.Button value="people">Members Participation</Radio.Button>
          </Radio.Group>
        </Space>
      </Row>

      <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        size="large"
        style={{ 
          marginBottom: '24px',
          fontSize: '16px'
        }}
        tabBarStyle={{ fontWeight: '500' }}
      >
        <TabPane tab="Weekly View" key="weekly" />
        <TabPane tab="Monthly View" key="monthly" />
        <TabPane tab="Yearly View" key="yearly" />
      </Tabs>

      <Row justify="center" style={{ marginBottom: '24px' }}>
        {renderTimeSelector()}
      </Row>

      <Card 
        bordered={false}
        style={{ 
          height: '70vh',
          minHeight: '600px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
        bodyStyle={{ 
          padding: '24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {data.length > 0 ? (
          <div style={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              maxWidth: '900px',
              position: 'relative'
            }}>
              <Pie 
                data={prepareChartData(activeTab)} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: `${prepareChartData(activeTab).title} - ${displayMode === 'points' ? 'Points Distribution' : 'Members Participation'}`,
                    }
                  }
                }} 
              />
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: 'gray',
            fontSize: '16px'
          }}>
            {loading ? 'Loading performance data...' : 'No data available for selected filters'}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NationPerformancePieChart;