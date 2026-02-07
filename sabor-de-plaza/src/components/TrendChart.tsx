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
import type { ChartOptions } from 'chart.js';
import type { ProductAlert } from '../types/productAlert';

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

const LABELS_7D = ['Hace 6 días', 'Hace 5 días', 'Hace 4 días', 'Hace 3 días', 'Hace 2 días', 'Ayer', 'Hoy'];

interface TrendChartProps {
  product: ProductAlert;
}

export function TrendChart({ product }: TrendChartProps) {
  const data = {
    labels: LABELS_7D,
    datasets: [
      {
        label: `${product.name} (COP)`,
        data: product.history7d,
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#059669',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(ctx.raw)),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (_tickValue, index, ticks) => {
            const value = ticks[index]?.value;
            if (typeof value === 'number' && value >= 1000) {
              return `${(value / 1000).toFixed(0)}k`;
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 sm:h-72 md:h-80 w-full">
      <Line data={data} options={options} />
    </div>
  );
}
