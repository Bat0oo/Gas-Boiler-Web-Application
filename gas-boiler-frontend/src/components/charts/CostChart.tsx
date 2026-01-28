import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CostDataPoint } from '../../types/chartstypes';
import { formatDateLabel } from '../../utils/chartUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CostChartProps {
  data: CostDataPoint[];
  height?: number;
  showLegend?: boolean;
}

const CostChart: React.FC<CostChartProps> = ({ data, height = 300, showLegend = false }) => {
  const chartData = {
    labels: data.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        label: 'Daily Cost',
        data: data.map((d) => d.cost),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 6,
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
            return 'Cost: €' + context.parsed.y.toFixed(2);
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
          text: 'Cost (EUR)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function (value: any) {
            return '€' + value;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CostChart;