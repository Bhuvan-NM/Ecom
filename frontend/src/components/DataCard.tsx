// src/components/DataCard.tsx
import React from "react";

interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
  trend?: number | null;
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

  const formattedTrend =
    trend == null
      ? null
      : `${trend > 0 ? "+" : ""}${Math.abs(trend).toFixed(1)}%`;

  const trendDirection: TrendDirection =
    trend == null
      ? "flat"
      : trend > 0
      ? "up"
      : trend < 0
      ? "down"
      : "flat";

  const trendBadgeClass =
    trendDirection === "up"
      ? "bg-emerald-100 text-emerald-700"
      : trendDirection === "down"
      ? "bg-rose-100 text-rose-700"
      : "bg-gray-100 text-gray-500";

  return (
    <div className={rootClassName}>
      {actions && (
        <div className="dataCard__actions absolute top-3 right-3">
          {actions}
        </div>
      )}
      <div className="flex flex-col gap-1 pr-6">
        <h3 className="text-sm text-gray-500 font-medium uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-900">
          {loading ? "--" : value}
        </p>
        {(description || formattedTrend || trendLabel) && (
          <div className="flex items-center gap-3 text-xs leading-5 text-gray-500">
            {formattedTrend && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${trendBadgeClass}`}
              >
                <TrendArrow direction={trendDirection} />
                {formattedTrend}
              </span>
            )}
            {(trendLabel || description) && (
              <div className="flex flex-col leading-tight">
                {trendLabel && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {trendLabel}
                  </span>
                )}
                {description && (
                  <span className="text-xs font-medium text-gray-600">
                    {description}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {icon && <div className="text-gray-400 text-3xl ml-auto">{icon}</div>}
    </div>
  );
};

export default DataCard;
