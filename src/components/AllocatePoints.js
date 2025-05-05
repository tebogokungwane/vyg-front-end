import React, { useState } from "react";
import { Form, Select, Input, Button, Card } from "antd";

const { Option } = Select;

const activities = [
  { points: 50, id: 1, name: "Sunday Service" },
  { points: 50, id: 2, name: "Sunday (T-shirt)" },
  { points: 100, id: 3, name: "New Youth for Hangout" },
  { points: 50, id: 4, name: "Returning Youth for Hangout" },
  { points: 50, id: 5, name: "Hangout per person" },
  { points: 50, id: 6, name: "Disciples Meeting" },
  { points: 50, id: 7, name: "Saturday Workout" },
  { points: 50, id: 8, name: "Saturday (Projects)" },
  { points: 1000, id: 9, name: "Double your Nation" },
  { points: 80, id: 10, name: "Wednesday (Service)" },
  { points: 80, id: 11, name: "Friday (Service)" },
  { points: 50, id: 12, name: "Thursday (TOL)" },
  { points: 100, id: 13, name: "Stand Event" },
  { points: 50, id: 14, name: "Monday (Service)" },
];

const AllocatePoints = () => {
  const [form] = Form.useForm();
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Handle activity selection
  const handleActivityChange = (value) => {
    const activity = activities.find((act) => act.id === value);
    setSelectedActivity(activity);
    form.setFieldsValue({ points: activity.points }); // Auto-fill points
  };

  const onFinish = (values) => {
    console.log("Allocated Points:", values);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px", backgroundColor: "#f5f5f5", minHeight: "70vh" }}>
      <Card style={{ width: "500px", padding: "20px", borderRadius: "10px", backgroundColor: "#ffffff", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontWeight: "bold" }}>Allocate Points</h2>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="activity" label="Select Activity" rules={[{ required: true, message: "Please select an activity!" }]}>
            <Select placeholder="Choose an activity" onChange={handleActivityChange}>
              {activities.map((activity) => (
                <Option key={activity.id} value={activity.id}>
                  {activity.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="points" label="Points">
            <Input readOnly value={selectedActivity ? selectedActivity.points : ""} />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <Input placeholder="Additional notes (optional)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AllocatePoints;
