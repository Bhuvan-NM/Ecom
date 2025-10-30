import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TooltipItem } from "chart.js";
import LineGraph from "../../components/LineGraph";
import DataCard from "../../components/DataCard";
import api from "../../lib/api";
import AtomLoading from "../../assets/loading/AtomLodingIndicator";

const RANGE_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "ytd", label: "Year to Date" },
  { value: "all", label: "All Time" },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

const RANGE_TITLES: Record<string, string> = {
  day: "Last 24 Hours",
  week: "Last 7 Days",
  month: "Last 30 Days",
  ytd: "Year to Date",
  all: "All Time",
};

const RANGE_SUMMARY_TEXT: Record<RangeValue, string> = {
  day: "in the last 24 hours",
  week: "in the last 7 days",
  month: "in the last month",
  ytd: "so far this year",
  all: "across all time",
};

const RANGE_COMPARISON_TEXT: Partial<Record<RangeValue, string>> = {
  day: "vs previous day",
  week: "vs previous week",
  month: "vs previous month",
  ytd: "vs previous year",
};

type SalesMetricSeries = {
  label: string;
  revenue: number;
  orders: number;
};

type SalesMetrics = {
  range: RangeValue;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueChangePct: number | null;
  ordersChangePct: number | null;
  averageOrderValueChangePct: number | null;
  series: SalesMetricSeries[];
};

type CardKey = "revenue" | "orders" | "aov";

const createRangeState = <T,>(value: T): Record<RangeValue, T> => ({
  day: value,
  week: value,
  month: value,
  ytd: value,
  all: value,
});

const toMetricNumber = (value: unknown) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const toOptionalMetricNumber = (value: unknown) => {
  if (value == null) {
    return null;
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

interface RangeMenuProps {
  id: string;
  label: string;
  range: RangeValue;
  onChange: (value: RangeValue) => void;
  loading?: boolean;
  disabled?: boolean;
}

const RangeMenu = ({
  id,
  label,
  range,
  onChange,
  loading = false,
  disabled = false,
}: RangeMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleToggle = () => {
    if (!disabled) {
      setOpen((prev) => !prev);
    }
  };

  return (
    <div className="dashboard-rangeMenu" ref={menuRef}>
      <button
        type="button"
        className="dashboard-rangeButton"
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        onClick={handleToggle}
        disabled={disabled}
      >
        {label}: {RANGE_TITLES[range]}
        {loading ? " · loading..." : ""}
      </button>
      {open && (
        <div className="dashboard-rangeDropdown" role="listbox">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={`${id}-${option.value}`}
              type="button"
              className={`dashboard-rangeOption${
                option.value === range ? " dashboard-rangeOption--active" : ""
              }`}
              role="option"
              aria-selected={option.value === range ? "true" : "false"}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1000 ? 2 : 0,
  }).format(value);

const Dashboard = () => {
  const [cardRanges, setCardRanges] = useState<Record<CardKey, RangeValue>>({
    revenue: "month",
    orders: "month",
    aov: "month",
  });
  const [graphRange, setGraphRange] = useState<RangeValue>("month");
  const [metricsCache, setMetricsCache] = useState<
    Partial<Record<RangeValue, SalesMetrics>>
  >({});
  const [loadingByRange, setLoadingByRange] = useState<
    Record<RangeValue, boolean>
  >(createRangeState<boolean>(false));
  const [errorByRange, setErrorByRange] = useState<
    Record<RangeValue, string | null>
  >(createRangeState<string | null>(null));

  const fetchMetrics = useCallback(
    async (targetRange: RangeValue, options: { force?: boolean } = {}) => {
      const { force = false } = options;
      if (!force && metricsCache[targetRange]) {
        return;
      }
      setLoadingByRange((prev) => ({ ...prev, [targetRange]: true }));
      setErrorByRange((prev) => ({ ...prev, [targetRange]: null }));

      try {
        const response = await api.get("/api/reports/sales-metrics", {
          params: { range: targetRange },
        });
        const payload = response.data ?? {};
        const normalized: SalesMetrics = {
          range: targetRange,
          totalRevenue: toMetricNumber(payload.totalRevenue),
          totalOrders: Math.round(toMetricNumber(payload.totalOrders)),
          averageOrderValue: toMetricNumber(payload.averageOrderValue),
          revenueChangePct: toOptionalMetricNumber(payload.revenueChangePct),
          ordersChangePct: toOptionalMetricNumber(payload.ordersChangePct),
          averageOrderValueChangePct: toOptionalMetricNumber(
            payload.averageOrderValueChangePct
          ),
          series: Array.isArray(payload.series)
            ? payload.series.map((entry: Partial<SalesMetricSeries>) => ({
                label: typeof entry.label === "string" ? entry.label : "",
                revenue: toMetricNumber(entry.revenue),
                orders: toMetricNumber(entry.orders),
              }))
            : [],
        };
        setMetricsCache((prev) => ({
          ...prev,
          [targetRange]: normalized,
        }));
      } catch (fetchError) {
        console.error("Error fetching sales metrics:", fetchError);
        setErrorByRange((prev) => ({
          ...prev,
          [targetRange]: "Unable to load sales metrics. Please try again.",
        }));
      } finally {
        setLoadingByRange((prev) => ({ ...prev, [targetRange]: false }));
      }
    },
    [metricsCache]
  );

  useEffect(() => {
    fetchMetrics(graphRange);
  }, [graphRange, fetchMetrics]);

  const handleGraphRangeChange = useCallback(
    (nextRange: RangeValue) => {
      setGraphRange((prev) => {
        if (prev === nextRange) {
          fetchMetrics(nextRange, { force: true });
          return prev;
        }
        return nextRange;
      });
    },
    [fetchMetrics]
  );

  const handleCardRangeChange = useCallback(
    (card: CardKey, nextRange: RangeValue) => {
      setCardRanges((prev) => {
        if (prev[card] === nextRange) {
          fetchMetrics(nextRange, { force: true });
          return prev;
        }
        fetchMetrics(nextRange);
        return { ...prev, [card]: nextRange };
      });
    },
    [fetchMetrics]
  );

  const handleRetry = useCallback(() => {
    fetchMetrics(graphRange, { force: true });
  }, [fetchMetrics, graphRange]);

  const graphMetrics = metricsCache[graphRange];
  const graphLoading = loadingByRange[graphRange];
  const graphError = errorByRange[graphRange];

  const chartData = useMemo(() => {
    if (!graphMetrics) {
      return {
        labels: [],
        datasets: [
          {
            label: "Revenue",
            data: [],
            borderColor: "rgba(37, 99, 235, 1)",
            backgroundColor: "rgba(37, 99, 235, 0.12)",
            fill: true,
            tension: 0.35,
          },
        ],
      };
    }

    const formatLabelForRange = (label: string) => {
      if (graphRange === "ytd") {
        const [year, month] = label.split("-");
        const parsed = new Date(Number(year), Number(month) - 1);
        return parsed.toLocaleString("default", { month: "short" });
      }
      return label;
    };

    const series = Array.isArray(graphMetrics.series)
      ? graphMetrics.series
      : [];

    return {
      labels: series.map((point) => formatLabelForRange(point.label)),
      datasets: [
        {
          label: "Revenue",
          data: series.map((point) => point.revenue),
          borderColor: "rgba(37, 99, 235, 1)",
          backgroundColor: "rgba(37, 99, 235, 0.12)",
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }, [graphMetrics, graphRange]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Revenue Trend · ${RANGE_TITLES[graphRange] ?? "Recent"}`,
        },
        tooltip: {
          callbacks: {
            label(context: TooltipItem<"line">) {
              const value = context.parsed?.y ?? 0;
              const datasetLabel = context.dataset?.label ?? "Revenue";
              return `${datasetLabel}: ${formatCurrency(value)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            maxRotation: 0,
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: "rgba(37, 99, 235, 0.08)",
          },
          ticks: {
            callback: (value: string | number) =>
              typeof value === "number" ? `$${value.toLocaleString()}` : value,
          },
        },
      },
    }),
    [graphRange]
  );

  if (graphLoading && !graphMetrics) {
    return (
      <div className="dashboard-loading">
        <AtomLoading size="large" />
      </div>
    );
  }

  if (graphError && !graphMetrics) {
    return (
      <div className="dashboard-error">
        <p>{graphError}</p>
        <button type="button" onClick={handleRetry}>
          Retry
        </button>
      </div>
    );
  }

  if (!graphMetrics) {
    return (
      <div className="dashboard-empty">
        <p>No metrics available yet. Add sales data to populate the dashboard.</p>
        <button type="button" onClick={handleRetry}>
          Refresh
        </button>
      </div>
    );
  }

  const revenueRange = cardRanges.revenue;
  const revenueMetrics = metricsCache[revenueRange];
  const revenueLoading = loadingByRange[revenueRange];
  const revenueError = errorByRange[revenueRange];

  const ordersRange = cardRanges.orders;
  const ordersMetrics = metricsCache[ordersRange];
  const ordersLoading = loadingByRange[ordersRange];
  const ordersError = errorByRange[ordersRange];

  const aovRange = cardRanges.aov;
  const aovMetrics = metricsCache[aovRange];
  const aovLoading = loadingByRange[aovRange];
  const aovError = errorByRange[aovRange];

  const revenueDescription =
    revenueError ?? RANGE_SUMMARY_TEXT[revenueRange] ?? "recently";
  const ordersDescription =
    ordersError ?? RANGE_SUMMARY_TEXT[ordersRange] ?? "recently";
  const aovDescription =
    aovError ?? RANGE_SUMMARY_TEXT[aovRange] ?? "recently";

  const revenueTrendLabel =
    revenueError ? undefined : RANGE_COMPARISON_TEXT[revenueRange];
  const ordersTrendLabel =
    ordersError ? undefined : RANGE_COMPARISON_TEXT[ordersRange];
  const aovTrendLabel =
    aovError ? undefined : RANGE_COMPARISON_TEXT[aovRange];

  const isSeriesEmpty =
    !graphMetrics.series || graphMetrics.series.length === 0;

  return (
    <div className="dashboard-graphContainer">
      <div className="dashboard-dataCardContainer">
        <DataCard
          title="Total Revenue"
          value={
            revenueMetrics
              ? formatCurrency(revenueMetrics.totalRevenue)
              : "--"
          }
          description={revenueDescription}
          trendLabel={revenueTrendLabel}
          trend={revenueError ? undefined : revenueMetrics?.revenueChangePct}
          color="bg-green-100"
          className="dashboard-dataCard"
          actions={
            <RangeMenu
              id="revenue"
              label="Range"
              range={revenueRange}
              onChange={(value) => handleCardRangeChange("revenue", value)}
              loading={revenueLoading && !revenueMetrics}
            />
          }
          loading={!revenueMetrics && revenueLoading}
        />
        <DataCard
          title="Total Orders"
          value={
            ordersMetrics ? ordersMetrics.totalOrders.toLocaleString() : "--"
          }
          description={ordersDescription}
          trendLabel={ordersTrendLabel}
          trend={ordersError ? undefined : ordersMetrics?.ordersChangePct}
          color="bg-blue-100"
          className="dashboard-dataCard"
          actions={
            <RangeMenu
              id="orders"
              label="Range"
              range={ordersRange}
              onChange={(value) => handleCardRangeChange("orders", value)}
              loading={ordersLoading && !ordersMetrics}
            />
          }
          loading={!ordersMetrics && ordersLoading}
        />
        <DataCard
          title="Avg. Order Value"
          value={
            aovMetrics
              ? formatCurrency(aovMetrics.averageOrderValue)
              : "--"
          }
          description={aovDescription}
          trendLabel={aovTrendLabel}
          trend={
            aovError ? undefined : aovMetrics?.averageOrderValueChangePct
          }
          color="bg-yellow-100"
          className="dashboard-dataCard"
          actions={
            <RangeMenu
              id="aov"
              label="Range"
              range={aovRange}
              onChange={(value) => handleCardRangeChange("aov", value)}
              loading={aovLoading && !aovMetrics}
            />
          }
          loading={!aovMetrics && aovLoading}
        />
      </div>
      <div className="dashboard-chartCard">
        <div className="dashboard-chartCard__header">
          <h4>Revenue Trend</h4>
          <RangeMenu
            id="graph"
            label="Range"
            range={graphRange}
            onChange={handleGraphRangeChange}
            loading={graphLoading}
          />
        </div>
        {graphLoading ? (
          <div className="dashboard-chartCard__loading">
            <AtomLoading size="medium" />
          </div>
        ) : (
          <LineGraph
            data={chartData}
            options={chartOptions}
            className="dashboard-chartCard__graph"
          />
        )}
      </div>
      {isSeriesEmpty && (
        <p className="dashboard-emptyNotice">
          No sales recorded for this range yet. Try a broader range or add new orders.
        </p>
      )}
    </div>
  );
};

export default Dashboard;
