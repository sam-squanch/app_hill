import React, { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./App.css";

// ✅ Point to your live backend on Render
const BACKEND_URL = "https://app-hill.onrender.com";

export default function App() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/activities`)
      .then((res) => setActivities(res.data))
      .catch(() => setActivities([]));
  }, []);

  // Group activities by type (Run, Ride, etc.)
  const activityTypes = [...new Set(activities.map((a) => a.type))];

  const series = activityTypes.map((type) => ({
    name: type,
    data: activities
      .filter((a) => a.type === type)
      .map((a) => ({
        name: a.name,
        y: +(a.distance / 1000).toFixed(2),
        duration: (a.elapsed_time / 60).toFixed(1),
      })),
  }));

  const chartOptions = {
    chart: {
      type: "column",
      backgroundColor: "#111",
    },
    title: {
      text: "Your Strava Activities",
      style: { color: "#fff" },
    },
    xAxis: {
      categories: activities.map((a) => a.name),
      labels: { style: { color: "#aaa", fontSize: "12px" } },
    },
    yAxis: {
      min: 0,
      title: { text: "Distance (km)", style: { color: "#aaa" } },
      labels: { style: { color: "#ccc" } },
    },
    tooltip: {
      useHTML: true,
      formatter: function () {
        return `
          <b>${this.point.name}</b><br/>
          Distance: ${this.y} km<br/>
          Time: ${this.point.duration} min
        `;
      },
    },
    legend: {
      itemStyle: { color: "#ccc" },
    },
    plotOptions: {
      column: {
        grouping: true,
        borderWidth: 0,
      },
    },
    series,
  };

  return (
    <div className="container">
      <h1>Strava Activity Dashboard</h1>

      <a href={`${BACKEND_URL}/api/auth`} className="button">
        Log in with Strava
      </a>

      {activities.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
