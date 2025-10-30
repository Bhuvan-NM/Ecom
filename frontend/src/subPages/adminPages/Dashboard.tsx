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
] as const;

const RANGE_DESCRIPTIONS: Record<string, string> = {
  day: "previous day",
  week: "previous week",
  month: "previous month",
  ytd: "previous year",
};

const RANGE_TITLES: Record<string, string> = {
  day: "Last 24 Hours",
  week: "Last 7 Days",
  month: "Last 30 Days",
  ytd: "Year to Date",
};

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

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
  revenueChangePct: number;
  ordersChangePct: number;
  averageOrderValueChangePct: number;
  series: SalesMetricSeries[];
};

type CardKey = "revenue" | "orders" | "aov";

const createRangeState = <T,>(value: T): Record<RangeValue, T> => ({
  day: value,
  week: value,
  month: value,
  ytd: value,
});

const toMetricNumber = (value: unknown) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getTrendDescription = (
  trend: number | undefined,
  comparisonLabel: string
) => {
  if (trend === undefined || Number.isNaN(trend)) {
    return `vs ${comparisonLabel}`;
  }
  if (trend > 0) {
    return `Higher than ${comparisonLabel}`;
  }
  if (trend < 0) {
    return `Lower than ${comparisonLabel}`;
  }
  return `No change vs ${comparisonLabel}`;
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
          revenueChangePct: toMetricNumber(payload.revenueChangePct),
          ordersChangePct: toMetricNumber(payload.ordersChangePct),
          averageOrderValueChangePct: toMetricNumber(
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

  const revenueComparison =
    RANGE_DESCRIPTIONS[revenueRange] ?? "previous period";
  const ordersComparison =
    RANGE_DESCRIPTIONS[ordersRange] ?? "previous period";
  const aovComparison = RANGE_DESCRIPTIONS[aovRange] ?? "previous period";

  const revenueDescription = revenueError
    ? revenueError
    : getTrendDescription(revenueMetrics?.revenueChangePct, revenueComparison);
  const ordersDescription = ordersError
    ? ordersError
    : getTrendDescription(ordersMetrics?.ordersChangePct, ordersComparison);
  const aovDescription = aovError
    ? aovError
    : getTrendDescription(
        aovMetrics?.averageOrderValueChangePct,
        aovComparison
      );

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
