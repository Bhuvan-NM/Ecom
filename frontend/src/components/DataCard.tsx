// src/components/DataCard.tsx
import React from "react";

interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode; // optional icon
  color?: string; // e.g. "bg-blue-100"
  className?: string;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  description,
  icon,
  color = "bg-white",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-2xl shadow-md ${color}`}
    >
      <div className={`flex flex-col ${className}`}>
        <h3 className="text-sm text-gray-500 font-medium dashboard-dataCard-Title">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-900 dashboard-dataCard-Value">
          {value}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-1 dashboard-dataCard-Description">
            {description}
          </p>
        )}
      </div>
      {icon && <div className="text-gray-400 text-3xl">{icon}</div>}
    </div>
  );
};

export default DataCard;
