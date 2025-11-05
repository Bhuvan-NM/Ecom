import { useEffect, useState } from "react";
import api from "../../lib/api";
import DataCard from "../../components/DataCard";

type UserMetrics = {
  totalUsers: number;
  adminUsers: number;
  recentSignups: number;
};

const Users = () => {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setError(null);
        const response = await api.get("/api/reports/user-statistics");
        console.log("User metrics payload:", response.data);
        const payload = response.data;

        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
          throw new Error("Unexpected response when loading user metrics.");
        }

        const toNumber = (value: unknown) => {
          const numericValue =
            typeof value === "number" ? value : Number(value ?? 0);
          return Number.isFinite(numericValue) ? numericValue : 0;
        };

        setMetrics({
          totalUsers: toNumber(payload.totalUsers),
          adminUsers: toNumber(payload.adminUsers),
          recentSignups: toNumber(payload.recentSignups),
        });
      } catch (fetchError) {
        console.error("Error fetching user metrics:", fetchError);
        setError("Unable to load user metrics.");
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const valueOrLoading = (value?: number) => {
    if (loading) return "Loading...";
    if (error) return "—";
    return (value ?? 0).toLocaleString();
  };

  return (
    <div className="users-DataCardContainer">
      <DataCard
        title="Total Users"
        value={valueOrLoading(metrics?.totalUsers)}
        description={error ?? "Registered accounts in the system"}
        className="users-DataCard"
      />
      <DataCard
        title="Admin Accounts"
        value={valueOrLoading(metrics?.adminUsers)}
        description={error ?? "Accounts with administrative access"}
        className="users-DataCard"
      />
      <DataCard
        title="New Signups (30d)"
        value={valueOrLoading(metrics?.recentSignups)}
        description={error ?? "Users created in the last 30 days"}
        className="users-DataCard"
      />
    </div>
  );
};

export default Users;
