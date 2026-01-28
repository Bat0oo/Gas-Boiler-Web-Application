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
import { PowerDataPoint } from '../../types/chartstypes';
import { formatChartLabel } from '../../utils/chartUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PowerChartProps {
  data: PowerDataPoint[];
  height?: number;
  showLegend?: boolean;
}

const PowerChart: React.FC<PowerChartProps> = ({ data, height = 300, showLegend = true }) => {
  const chartData = {
    labels: data.map((d) => formatChartLabel(d.timestamp)),
    datasets: [
      {
        label: 'Available Power',
        data: data.map((d) => d.availablePower),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
      {
        label: 'Required Power',
        data: data.map((d) => d.requiredPower),
        backgroundColor: data.map((d) =>
          d.hasCapacity ? 'rgba(59, 130, 246, 0.7)' : 'rgba(239, 68, 68, 0.7)'
        ),
        borderColor: data.map((d) =>
          d.hasCapacity ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'
        ),
        borderWidth: 2,
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toFixed(2) + ' kW';
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Power (kW)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
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

export default PowerChart;