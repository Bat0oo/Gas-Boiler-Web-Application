import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HeatLossDataPoint } from '../../types/chartstypes';
import { formatChartLabel } from '../../utils/chartUtils';

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

interface HeatLossChartProps {
  data: HeatLossDataPoint[];
  height?: number;
  showLegend?: boolean;
}

const HeatLossChart: React.FC<HeatLossChartProps> = ({
  data,
  height = 300,
  showLegend = false,
}) => {
  const chartData = {
    labels: data.map((d) => formatChartLabel(d.timestamp)),
    datasets: [
      {
        label: 'Heat Loss',
        data: data.map((d) => d.heatLossKw),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.3)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return 'Heat Loss: ' + context.parsed.y.toFixed(2) + ' kW';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Heat Loss (kW)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default HeatLossChart;