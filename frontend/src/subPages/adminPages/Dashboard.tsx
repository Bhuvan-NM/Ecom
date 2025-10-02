import LineGraph from "../../components/LineGraph";

const Dashboard = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Revenue Over Time" },
    },
  };

  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Gross Sales",
        data: labels.map(() => Math.random() * 100),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
      {
        label: "Net Sales",
        data: labels.map(() => Math.random() * 100),
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.2)",
      },
    ],
  };

  return (
    <div className="dashboard-graphContainer">
      <LineGraph
        data={data}
        options={options}
      />
    </div>
  );
};

export default Dashboard;
