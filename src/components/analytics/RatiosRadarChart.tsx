import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { NormalizedRatio } from '../../types/financialReport';
import { useEffect, useState } from 'react';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RatiosRadarChartProps {
  ratios: NormalizedRatio[];
}

const RatiosRadarChart = ({ ratios }: RatiosRadarChartProps) => {
  const [chartData, setChartData] = useState<ChartData<'radar'> | null>(null);
  const [options, setOptions] = useState<ChartOptions<'radar'> | null>(null);
  
  useEffect(() => {
    if (!ratios || ratios.length === 0) {
      console.log('No ratios provided for radar chart');
      return;
    }
    
    try {
      // Group ratios by category
      const categorizedRatios: Record<string, NormalizedRatio[]> = {};
      
      ratios.forEach(ratio => {
        if (!categorizedRatios[ratio.category]) {
          categorizedRatios[ratio.category] = [];
        }
        categorizedRatios[ratio.category].push(ratio);
      });
      
      if (Object.keys(categorizedRatios).length === 0) {
        console.log('No categories found after grouping ratios');
        return;
      }
      
      console.log('Categorized ratios:', categorizedRatios);
      
      // Chart colors
      const chartColors = {
        'Liquidity Ratios': {
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderColor: 'rgba(37, 99, 235, 1)',
        },
        'Profitability Ratios': {
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
        },
        'Solvency Ratios': {
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          borderColor: 'rgba(139, 92, 246, 1)',
        },
        'Efficiency Ratios': {
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          borderColor: 'rgba(245, 158, 11, 1)',
        },
        'Market Value Ratios': {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 1)',
        }
      };
      
      // Normalize data for radar chart (all values between 0-100)
      const categoryAverages: Record<string, number> = {};
      const maxValues: Record<string, number> = {};
      
      // Find max value for each category and calculate averages
      Object.entries(categorizedRatios).forEach(([category, categoryRatios]) => {
        if (categoryRatios.length === 0) return;
        
        const values = categoryRatios.map(r => r.value);
        maxValues[category] = Math.max(...values);
        // Calculate average for this category
        categoryAverages[category] = values.reduce((sum, val) => sum + val, 0) / values.length;
      });
      
      if (Object.keys(maxValues).length === 0) {
        console.log('No max values calculated');
        return;
      }
      
      // Max value across all categories for scaling (ensure it's not 0 to avoid division by zero)
      const maxValueArray = Object.values(maxValues);
      const maxValueOverall = maxValueArray.length > 0 ? Math.max(...maxValueArray) : 1;
      
      if (maxValueOverall <= 0) {
        console.log('Invalid max value for scaling:', maxValueOverall);
        return;
      }
      
      // Scale all values to 0-100 for radar chart
      const normalizedCategoryAverages: Record<string, number> = {};
      Object.entries(categoryAverages).forEach(([category, value]) => {
        // Scale to 0-100 range, ensure not NaN or Infinity
        normalizedCategoryAverages[category] = Number.isFinite(value) ? 
          (value / maxValueOverall) * 100 : 0;
      });
      
      console.log('Normalized category averages:', normalizedCategoryAverages);
      
      // Prepare data for radar chart
      const labels = Object.keys(normalizedCategoryAverages);
      const data = Object.values(normalizedCategoryAverages);
      
      if (labels.length === 0 || data.length === 0) {
        console.log('No labels or data for radar chart');
        return;
      }
      
      const chartData: ChartData<'radar'> = {
        labels,
        datasets: [
          {
            label: 'Financial Ratio Categories',
            data,
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(37, 99, 235, 1)',
            pointRadius: 4,
          },
        ],
      };
      
      setChartData(chartData);
      
      const options: ChartOptions<'radar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
            },
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              backdropColor: 'transparent',
              color: '#64748b',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            pointLabels: {
              color: '#1e293b',
              font: {
                size: 12,
              },
            },
          },
        },
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
                // Display original value in tooltip
                const categoryName = context.label as string;
                const originalValue = categoryAverages[categoryName]?.toFixed(2) || '0';
                return `${context.dataset.label}: ${originalValue}`;
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0.2
          }
        }
      };
      
      setOptions(options);
      
    } catch (error) {
      console.error('Error preparing radar chart data:', error);
    }
  }, [ratios]);
  
  if (!chartData || !options) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-slate-500">Preparing chart data...</p>
      </div>
    );
  }
  
  return (
    <div className="h-96 chart-container">
      <Radar data={chartData} options={options} className="chartjs-render-monitor" />
    </div>
  );
};

export default RatiosRadarChart;
