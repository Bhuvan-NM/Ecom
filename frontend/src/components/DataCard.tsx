// src/components/DataCard.tsx
import React from "react";

interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
  trend?: number;
  trendLabel?: string;
  actions?: React.ReactNode;
  loading?: boolean;
}

type TrendDirection = "up" | "down" | "flat";

const TrendArrow = ({ direction }: { direction: TrendDirection }) => {
  if (direction === "flat") {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        role="presentation"
        aria-hidden="true"
      >
        <path
          d="M2 6h8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      role="presentation"
      aria-hidden="true"
    >
      <path
        d="M6 1.5l4.5 4.5H7.5V10.5H4.5V6H1.5L6 1.5z"
        fill="currentColor"
        transform={direction === "down" ? "rotate(180 6 6)" : undefined}
      />
    </svg>
  );
};

const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  description,
  trend,
  trendLabel,
  icon,
  color = "bg-white",
  className = "",
  actions,
  loading = false,
}) => {
  const rootClassName = [
    "relative flex items-center justify-between p-4 rounded-2xl shadow-md",
    color,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const trendColor =
    trend === undefined
      ? "text-gray-400"
      : trend > 0
      ? "text-emerald-600"
      : trend < 0
      ? "text-rose-600"
      : "text-gray-500";

  const formattedTrend =
    trend === undefined
      ? null
      : `${trend > 0 ? "+" : ""}${Math.abs(trend).toFixed(1)}%`;

  const trendDirection: TrendDirection =
    trend === undefined
      ? "flat"
      : trend > 0
      ? "up"
      : trend < 0
      ? "down"
      : "flat";

  return (
    <div className={rootClassName}>
      {actions && <div className="dataCard__actions absolute top-3 right-3">{actions}</div>}
      <div className="flex flex-col gap-1 pr-6">
        <h3 className="text-sm text-gray-500 font-medium uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-900">
          {loading ? "--" : value}
        </p>
        {(description || formattedTrend) && (
          <p className="text-xs text-gray-500 flex items-center gap-2 leading-5">
            {formattedTrend && (
              <span
                className={`inline-flex items-center gap-1 font-semibold ${trendColor}`}
              >
                <TrendArrow direction={trendDirection} />
                {formattedTrend}
              </span>
            )}
            {description && <span>{description}</span>}
            {trendLabel && (
              <span className="text-gray-400">{trendLabel}</span>
            )}
          </p>
        )}
      </div>
      {icon && <div className="text-gray-400 text-3xl ml-auto">{icon}</div>}
    </div>
  );
};

export default DataCard;
