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
} from "antd";
import axios from "axios";
import defaultImage from "../images/vyg.jpg";
import UserContext from "../context/UserContext";
import "../styles/NationPerformanceOverview.css";

const { Option } = Select;

const NationPerformanceOverview = () => {
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleNation, setVisibleNation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [nationSummaries, setNationSummaries] = useState({});
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user && user.address?.id) {
      fetchData(user.address.id);
    }
  }, [user]);

  const fetchData = async (addressId) => {
    setLoading(true);
    try {
      const [nationsRes, performanceRes] = await Promise.all([
        axios.get("http://localhost:2025/api/nations"),
        axios.get(`http://localhost:2025/api/points/summary/address/${addressId}`),
      ]);

      const grouped = {};
      performanceRes.data.forEach((entry) => {
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

      const enrichedNations = nationsRes.data.map((nation) => {
        const data = grouped[nation.id] || { nation, performanceByDate: {} };
        return {
          ...nation,
          imageUrl: `http://localhost:2025/api/nations/${nation.id}/image`,
          performanceByDate: data.performanceByDate,
        };
      });

      setNations(enrichedNations);
      setNationSummaries(grouped);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      message.error("Error fetching nation data");
    } finally {
      setLoading(false);
    }
  };

  const getDateOptions = (nation) => {
    const summary = nationSummaries[nation.id];
    return summary ? Object.keys(summary.performanceByDate) : [];
  };

  const getPerformanceByDate = (nation, date) => {
    const summary = nationSummaries[nation.id];
    const entries = summary?.performanceByDate?.[date] || [];

    const breakdown = {};

    entries.forEach((entry) => {
      const event = entry.baseEvent.name;
      if (!breakdown[event]) {
        breakdown[event] = { people: 0, points: 0 };
      }
      breakdown[event].people += entry.numberOfPeople;
      breakdown[event].points += entry.points;
    });

    return {
      totalPoints: entries.reduce((sum, e) => sum + e.points, 0),
      events: Object.entries(breakdown).map(([eventName, stats]) => ({
        eventName,
        ...stats,
      })),
    };
  };

  return (
    <div className="overview-container">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {nations.map((nation) => (
            <Col
              key={nation.id}
              xs={24}
              sm={24}
              md={12}
              lg={8}
              className="full-width-col"
            >
              <Card
                hoverable
                className="full-width-card"
                bodyStyle={{ padding: 16 }}
                cover={
                  <img
                    alt={nation.nation}
                    src={nation.imageUrl}
                    style={{ width: "100%", height: 200, objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultImage;
                    }}
                  />
                }
                title={<strong>{nation.nation}</strong>}
                actions={[
                  <Button
                    type="link"
                    onClick={() => {
                      setVisibleNation(nation);
                      const dates = getDateOptions(nation);
                      setSelectedDate(dates.length > 0 ? dates[0] : null);
                    }}
                  >
                    View Performance
                  </Button>,
                ]}
              >
                <p>
                  <strong>Current Points:</strong>{" "}
                  {Object.values(nation.performanceByDate)
                    .flat()
                    .reduce((sum, e) => sum + e.points, 0)}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {visibleNation && (
        <Modal
          title={`Performance of ${visibleNation.nation}`}
          open={true}
          onCancel={() => setVisibleNation(null)}
          footer={null}
          width={650}
        >
          {getDateOptions(visibleNation).length > 0 ? (
            <>
              <Select
                style={{ width: "100%", marginBottom: 20 }}
                value={selectedDate}
                onChange={setSelectedDate}
              >
                {getDateOptions(visibleNation).map((date) => (
                  <Option key={date} value={date}>
                    {new Date(date).toLocaleDateString("en-ZA", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </Option>
                ))}
              </Select>

              <Divider orientation="left">Event Breakdown</Divider>
              {getPerformanceByDate(visibleNation, selectedDate).events.map((event, idx) => (
                <p key={idx}>
                  <strong>{event.eventName}:</strong> {event.people} people, {event.points} points
                </p>
              ))}

              <Divider />
              <p>
                <strong>Total Points on selected date:</strong>{" "}
                {getPerformanceByDate(visibleNation, selectedDate).totalPoints}
              </p>
            </>
          ) : (
            <p>No performance data available.</p>
          )}
        </Modal>
      )}
    </div>
  );
};

export default NationPerformanceOverview;
