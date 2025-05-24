import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { NormalizedRatio } from '../../types/financialReport';
import { useEffect, useState } from 'react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RatiosByCategoryProps {
  ratios: NormalizedRatio[];
  category: string;
}

const RatiosByCategory = ({ ratios, category }: RatiosByCategoryProps) => {
  const [chartData, setChartData] = useState<any>(null);
  const [options, setOptions] = useState<ChartOptions<'bar'> | null>(null);
  
  useEffect(() => {
    if (!ratios || ratios.length === 0 || !category) {
      console.log('Missing data for category chart');
      return;
    }
    
    try {
      // Filter ratios by selected category
      const filteredRatios = ratios.filter(ratio => ratio.category === category);
      
      if (filteredRatios.length === 0) {
        console.log(`No ratios found for category: ${category}`);
        return;
      }
      
      // Sort ratios by value in descending order
      filteredRatios.sort((a, b) => b.value - a.value);
      
      // Prepare chart data
      const labels = filteredRatios.map(r => r.name);
      const data = filteredRatios.map(r => r.value);
      
      console.log(`Preparing chart for ${category}:`, { labels, data });
      
      // Get color based on category
      const getCategoryColor = (category: string) => {
        switch (category) {
          case 'Liquidity Ratios': return 'rgba(37, 99, 235, 1)';
          case 'Profitability Ratios': return 'rgba(16, 185, 129, 1)';
          case 'Solvency Ratios': return 'rgba(139, 92, 246, 1)';
          case 'Efficiency Ratios': return 'rgba(245, 158, 11, 1)';
          case 'Market Value Ratios': return 'rgba(239, 68, 68, 1)';
          default: return 'rgba(37, 99, 235, 1)';
        }
      };
      
      const backgroundColor = getCategoryColor(category);
      
      const chartData = {
        labels,
        datasets: [
          {
            label: category,
            data,
            backgroundColor,
            borderRadius: 4,
          }
        ]
      };
      
      setChartData(chartData);
      
      const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: category,
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
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#1e293b',
            bodyColor: '#1e293b',
            borderColor: 'rgba(226, 232, 240, 1)',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Value',
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
            grid: {
              display: false,
            },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45,
              color: '#64748b',
              font: {
                size: 11,
              },
            }
          }
        }
      };
      
      setOptions(options);
    } catch (error) {
      console.error('Error setting up category chart:', error);
    }
  }, [ratios, category]);
  
  if (!chartData || !options) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-slate-500">
          {ratios.length === 0 
            ? 'No ratio data available' 
            : `Preparing ${category} chart data...`}
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-80 chart-container">
      <Bar data={chartData} options={options} className="chartjs-render-monitor" />
    </div>
  );
};

export default RatiosByCategory;
