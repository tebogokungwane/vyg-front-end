import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Modal,
  Button,
  Divider,
  message,
  Spin,
  Alert,
  Typography
} from "antd";
import axios from "../utils/axios";
import defaultImage from "../images/vyg.jpg";
import UserContext from "../context/UserContext";
import "../styles/NationPerformanceOverview.css";
const baseURL = axios.defaults.baseURL;
const { Option } = Select;
const { Text } = Typography;

const NationPerformanceOverview = () => {
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleNation, setVisibleNation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [nationSummaries, setNationSummaries] = useState({});
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const addressId = user?.address?.id || 37;

        const [nationsRes, performanceRes, memberStatsRes] = await Promise.all([
          axios.get(`/api/nations`),
          axios.get(`/api/points/summary/address/${addressId}`),
          axios.get(`/api/nation-stats/member-stats/${addressId}`)
          
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

        const enrichedNations = nationsRes.data.map((nation) => {
          const memberStat = memberStatsRes.data.find(stat => stat.nationId === nation.id) || {
            totalMembers: 0,
            totalMentors: 0,
            totalSecretaries: 0
          };

          return {
            ...nation,
            imageUrl: nation.imageName
              ? `${baseURL}/api/nations/${nation.id}/image`
              : defaultImage,
            performanceByDate: grouped[nation.id]?.performanceByDate || {},
            fallbackImage: defaultImage,
            ...memberStat
          };
        });

        setNations(enrichedNations);
        setNationSummaries(grouped);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load nation data");
        message.error("Error loading nation performance");
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

  if (error) {
    return (
      <Alert
        message="Error Loading Nation Performance"
        description={
          <>
            <Text>{error}</Text>
            <br />
            <Text type="secondary">
              Address ID used: {user?.address?.id || '37 (fallback)'}
            </Text>
          </>
        }
        type="error"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!nations.length) {
    return (
      <Alert
        message="No Nation Data Available"
        description="The server returned no nation performance data."
        type="info"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  return (
    <div className="overview-container">
      <Row gutter={[16, 16]}>
        {nations.map((nation) => {
          const totalPoints = Object.values(nation.performanceByDate)
            .flat()
            .reduce((sum, e) => sum + (e.points || 0), 0);
          const dateOptions = getDateOptions(nation);

          return (
            <Col key={nation.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  <img
                    alt={nation.nation}
                    src={nation.imageUrl}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = nation.fallbackImage;
                    }}
                    style={{ height: 160, objectFit: 'cover' }}
                  />
                }
                actions={[
                  <Button
                    type="link"
                    onClick={() => {
                      setVisibleNation(nation);
                      setSelectedDate(dateOptions[0] || null);
                    }}
                    disabled={!dateOptions.length}
                  >
                    {dateOptions.length ? 'View Details' : 'No Data'}
                  </Button>
                ]}
              >
                <Card.Meta
                  title={nation.nation}
                  description={
                    <>
                      <Text strong>Total Points:</Text> {totalPoints.toLocaleString()}
                      <br />
                      <Text strong>Members:</Text> {nation.totalMembers}
                      {" | "}
                      <Text strong>Mentors:</Text> {nation.totalMentors}
                      {" | "}
                      <Text strong>Secretaries:</Text> {nation.totalSecretaries}
                      <br />
                      <Text strong>Records:</Text> {dateOptions.length}
                    </>
                  }
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal
        title={visibleNation?.nation || 'Nation Performance'}
        open={!!visibleNation}
        onCancel={() => setVisibleNation(null)}
        footer={null}
        width={700}
      >
        {visibleNation && getDateOptions(visibleNation).length > 0 ? (
          <>
            <Select
              style={{ width: '100%', marginBottom: 20 }}
              value={selectedDate}
              onChange={setSelectedDate}
              options={getDateOptions(visibleNation).map(date => ({
                value: date,
                label: new Date(date).toLocaleDateString()
              }))}
            />

            <Divider orientation="left">Event Breakdown</Divider>
            {getPerformanceByDate(visibleNation, selectedDate).events.map((event, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <Text strong>{event.eventName}:</Text> {event.people} people, {event.points} points
              </div>
            ))}

            <Divider />
            <Text strong>Total Points: </Text>
            {getPerformanceByDate(visibleNation, selectedDate).totalPoints.toLocaleString()}
          </>
        ) : (
          <Alert
            message="No Detailed Data"
            description="No performance records available for this nation."
            type="info"
            showIcon
          />
        )}
      </Modal>
    </div>
  );
};

export default NationPerformanceOverview;
