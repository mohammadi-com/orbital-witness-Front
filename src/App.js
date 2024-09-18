import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import './App.css'; // for styling

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const App = () => {
  const [data, setData] = useState([]);
  const [sortByReport, setSortByReport] = useState(null);
  const [sortByCredits, setSortByCredits] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/usage').then((response) => {
      console.log(response.data); // Log the response data
      setData(response.data.usage);
    }).catch(error => {
      console.error("Error fetching usage data:", error);
    });
  }, []);

  useEffect(() => {
    // Fetch usage data
    axios.get('http://localhost:8000/usage').then((response) => {
      setData(response.data.usage);
    });
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  const handleSortReport = () => {
    const sortedData = [...data].sort((a, b) => {
      if (!a.report_name) return 1;
      if (!b.report_name) return -1;
      return sortByReport === 'asc'
        ? a.report_name.localeCompare(b.report_name)
        : b.report_name.localeCompare(a.report_name);
    });
    setData(sortedData);
    setSortByReport(sortByReport === 'asc' ? 'desc' : 'asc');
  };

  const handleSortCredits = () => {
    const sortedData = [...data].sort((a, b) => {
      return sortByCredits === 'asc'
        ? a.credits_used - b.credits_used
        : b.credits_used - a.credits_used;
    });
    setData(sortedData);
    setSortByCredits(sortByCredits === 'asc' ? 'desc' : 'asc');
  };

  // Group data by date for the bar chart
  const creditsByDate = data.reduce((acc, item) => {
    const date = new Date(item.timestamp).toDateString();
    acc[date] = (acc[date] || 0) + item.credits_used;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(creditsByDate),
    datasets: [
      {
        label: 'Credits Used',
        data: Object.values(creditsByDate),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="App">
      <h1>Credit Usage Dashboard</h1>

      <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />

      <table>
        <thead>
          <tr>
            <th>Message ID</th>
            <th>Timestamp</th>
            <th onClick={handleSortReport} style={{ cursor: 'pointer' }}>Report Name {sortByReport}</th>
            <th onClick={handleSortCredits} style={{ cursor: 'pointer' }}>Credits Used {sortByCredits}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.message_id}>
              <td>{item.message_id}</td>
              <td>{formatTimestamp(item.timestamp)}</td>
              <td>{item.report_name || ''}</td>
              <td>{item.credits_used.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;