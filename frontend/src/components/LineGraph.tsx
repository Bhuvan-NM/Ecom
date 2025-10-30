import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineGraphProps {
  data: ChartData<"line">;
  options?: ChartOptions<"line">;
  className?: string;
}

const LineGraph: React.FC<LineGraphProps> = ({ data, options, className }) => {
  const containerClassName = ["lineGraph__container", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassName}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineGraph;
