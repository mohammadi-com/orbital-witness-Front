import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import './App.css'; // for styling

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const App = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);  // Store original data
  const [sortByReport, setSortByReport] = useState(null);
  const [sortByCredits, setSortByCredits] = useState(null);

  useEffect(() => {
    // Fetch usage data
    axios.get('http://localhost:8000/usage').then((response) => {
      console.log(response.data); // Log the response data
      setData(response.data.usage);
      setOriginalData(response.data.usage); // Save the original data for resetting
    });
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  const sortAscending = (key, isNumeric = false) => {
    const sortedData = [...data].sort((a, b) => {
      if (isNumeric) return a[key] - b[key];
      if (!a[key]) return 1;
      if (!b[key]) return -1;
      return a[key].localeCompare(b[key]);
    });
    setData(sortedData);
  };

  const sortDescending = (key, isNumeric = false) => {
    const sortedData = [...data].sort((a, b) => {
      if (isNumeric) return b[key] - a[key];
      if (!a[key]) return 1;
      if (!b[key]) return -1;
      return b[key].localeCompare(a[key]);
    });
    setData(sortedData);
  };

  const resetSort = () => {
    setData(originalData);
  };

  const handleSortReport = () => {
    if (sortByCredits === 'asc') {
      sortAscending('credits_used', true);
    } else if (sortByCredits === 'desc') {
      sortDescending('credits_used', true);
    }

    if (sortByReport === null) {
      sortAscending('report_name');
      setSortByReport('asc');
    } else if (sortByReport === 'asc') {
      sortDescending('report_name');
      setSortByReport('desc');
    } else {
      if (sortByCredits === null) resetSort();
      setSortByReport(null);
    }
  };

  const handleSortCredits = () => {
    if (sortByCredits === null) {
      sortAscending('credits_used', true);
      setSortByCredits('asc');
    } else if (sortByCredits === 'asc') {
      sortDescending('credits_used', true);
      setSortByCredits('desc');
    } else {
      if (sortByReport === null) resetSort();
      setSortByCredits(null);
    }
  };

  // Group data by date for the bar chart
  const creditsByDate = originalData.reduce((acc, item) => {
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
            <th onClick={handleSortReport} style={{ cursor: 'pointer' }}>
              Report Name {sortByReport === 'asc' ? '▲' : sortByReport === 'desc' ? '▼' : ''}
            </th>
            <th onClick={handleSortCredits} style={{ cursor: 'pointer' }}>
              Credits Used {sortByCredits === 'asc' ? '▲' : sortByCredits === 'desc' ? '▼' : ''}
            </th>
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