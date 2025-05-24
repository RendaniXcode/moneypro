import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { NormalizedPerformanceTrend } from '../../types/financialReport';
import { useEffect, useState } from 'react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceTrendsChartProps {
  trends: NormalizedPerformanceTrend[];
}

const PerformanceTrendsChart = ({ trends }: PerformanceTrendsChartProps) => {
  const [chartData, setChartData] = useState<any>(null);
  const [options, setOptions] = useState<ChartOptions<'line'> | null>(null);
  
  useEffect(() => {
    if (!trends || trends.length === 0) {
      console.log('No trends data for chart');
      return;
    }
    
    try {
      // Sort trends by year
      const sortedTrends = [...trends].sort((a, b) => a.year - b.year);
      console.log('Sorted trends data:', sortedTrends);
      
      // Prepare chart data
      const labels = sortedTrends.map(t => `Year ${t.year}`);
      
      const chartData = {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: sortedTrends.map(t => t.revenue),
            borderColor: 'rgba(37, 99, 235, 1)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            tension: 0.3,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Profit',
            data: sortedTrends.map(t => t.profit),
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Debt',
            data: sortedTrends.map(t => t.debt),
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.3,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
          }
        ]
      };
      
      setChartData(chartData);
      
      const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#1e293b',
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: true,
            text: 'Performance Trends Over Time',
            font: {
              size: 16,
              weight: 'bold',
            },
            color: '#1e293b',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#1e293b',
            bodyColor: '#1e293b',
            borderColor: 'rgba(226, 232, 240, 1)',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Value (in millions)',
              color: '#64748b',
              font: {
                size: 12,
              },
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.6)',
            },
            ticks: {
              color: '#64748b',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Year',
              color: '#64748b',
              font: {
                size: 12,
              },
            },
            grid: {
              display: false,
            },
            ticks: {
              color: '#64748b',
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      };
      
      setOptions(options);
    } catch (error) {
      console.error('Error setting up trends chart:', error);
    }
  }, [trends]);
  
  if (!chartData || !options) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-slate-500">Preparing chart data...</p>
      </div>
    );
  }
  
  return (
    <div className="h-96 chart-container">
      <Line data={chartData} options={options} className="chartjs-render-monitor" />
    </div>
  );
};

export default PerformanceTrendsChart;
