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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineGraphProps {
  data: ChartData<"line">;
  options?: ChartOptions<"line">;
}

const LineGraph: React.FC<LineGraphProps> = ({ data, options }) => {
  return (
    <Line
      data={data}
      options={options}
    />
  );
};

export default LineGraph;
