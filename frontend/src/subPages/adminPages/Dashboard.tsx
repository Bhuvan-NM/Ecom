import LineGraph from "../../components/LineGraph";
import DataCard from "../../components/DataCard";
import api from "../../lib/api";
import { useState, useEffect } from "react";

const Dashboard = () => {
  interface SalesSummary {
    day: number;
    week: number;
    month: number;
    year: number;
    yearToDate: number;
    totalOrders: number;
  }

  const [salesData, setSalesData] = useState<SalesSummary | null>(null);
  const [profitData, setProfitData] = useState<{
    revenue: number;
    cost: number;
    profit: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesResponse = await api.get("/api/reports/sales-summary");
        console.log("Sales Summary Response:", salesResponse.data);
        // Defensive check for sales summary data
        const data = salesResponse.data;
        if (data && typeof data.yearToDate === "number") {
          setSalesData(data);
        } else {
          console.warn("Invalid sales summary format:", data);
          setSalesData(null);
        }

        const profitResponse = await api.get("/api/reports/profit");
        console.log("Profit Response:", profitResponse.data);
        // Type guard for profit data
        const pData = profitResponse.data;
        if (
          pData &&
          typeof pData === "object" &&
          typeof pData.revenue === "number" &&
          typeof pData.cost === "number" &&
          typeof pData.profit === "number"
        ) {
          setProfitData(pData);
        } else {
          console.warn("Invalid profit data format:", pData);
          setProfitData(null);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();

    // Refresh every 5 minutes (300,000 ms)
    const interval = setInterval(fetchData, 300000);

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, []);

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

  if (!salesData || typeof salesData.yearToDate !== "number") {
    return <div>Error loading sales data.</div>;
  }
  if (!profitData) {
    return (
      <div>
        Loading dashboard data... Please wait while we fetch the latest
        information.
      </div>
    );
  }

  console.log("Sales Data:", salesData);
  console.log("Profit Data:", profitData);

  return (
    <div className="dashboard-graphContainer">
      <div className="dashboard-dataCardContainer">
        <DataCard
          title="Total Sales"
          value={`$${(salesData?.yearToDate ?? 0).toFixed(2)}`}
          description="Up 15% from last month"
          color="bg-green-100"
          className="dashboard-dataCard"
        />
        <DataCard
          title="Total Orders"
          value={salesData?.totalOrders?.toString() ?? "0"}
          description="Up 10% from last month"
          color="bg-blue-100"
          className="dashboard-dataCard"
        />
        <DataCard
          title="New Customers"
          value="300"
          description="Up 20% from last month"
          color="bg-yellow-100"
          className="dashboard-dataCard"
        />
      </div>
      <LineGraph
        data={data}
        options={options}
      />
    </div>
  );
};

export default Dashboard;
