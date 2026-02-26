import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { PowerDataPoint } from "../../types/chartstypes";
import { formatChartLabel } from "../../utils/chartUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface PowerChartProps {
  data: PowerDataPoint[];
  height?: number;
  showLegend?: boolean;
}

const PowerChart: React.FC<PowerChartProps> = ({
  data,
  height = 300,
  showLegend = true,
}) => {
  const chartData = {
    labels: data.map((d) => formatChartLabel(d.timestamp)),
    datasets: [
      {
        label: "Available Power",
        data: data.map((d) => d.availablePower),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 2,
      },
      {
        label: "Required Power",
        data: data.map((d) => d.requiredPower),
        backgroundColor: data.map((d) =>
          d.hasCapacity ? "rgba(59, 130, 246, 0.7)" : "rgba(239, 68, 68, 0.7)",
        ),
        borderColor: data.map((d) =>
          d.hasCapacity ? "rgb(59, 130, 246)" : "rgb(239, 68, 68)",
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
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const index = context[0].dataIndex;
            const dataPoint = data[index];
            const timestamp = new Date(dataPoint.timestamp);
            const formattedDate = timestamp.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const buildingName = dataPoint.buildingName || "Unknown Building";
            return `🏢 ${buildingName}\n${formattedDate}`;
          },
          afterTitle: function (context: any) {
            const index = context[0].dataIndex;
            const dataPoint = data[index];

            if (!dataPoint.hasCapacity) {
              const deficit = (
                dataPoint.requiredPower - dataPoint.availablePower
              ).toFixed(2);
              return `⚠️ INSUFFICIENT CAPACITY!\nDeficit: ${deficit} kW`;
            }

            const surplus = (
              dataPoint.availablePower - dataPoint.requiredPower
            ).toFixed(2);
            return `✅ Sufficient capacity\nSurplus: ${surplus} kW`;
          },
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.y.toFixed(2);
            return `${label}: ${value} kW`;
          },
          footer: function (context: any) {
            const index = context[0].dataIndex;
            const dataPoint = data[index];
            const utilizationPercent = (
              (dataPoint.requiredPower / dataPoint.availablePower) *
              100
            ).toFixed(1);
            return `\nCapacity Usage: ${utilizationPercent}%`;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        footerColor: "#10b981",
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: "bold" as const,
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
          text: "Power (kW)",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
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
