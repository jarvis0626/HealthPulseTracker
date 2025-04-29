import { ChartData, ChartOptions } from 'chart.js';

// Activity Chart Configuration
export const activityChartConfig = (data: number[] = [0, 0, 0, 0, 0, 0]) => {
  const labels = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
  
  const chartData: ChartData<'line'> = {
    labels,
    datasets: [{
      label: 'Steps',
      data,
      borderColor: 'hsl(var(--primary))',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
    }]
  };
  
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false }
      },
      x: {
        grid: { display: false }
      }
    }
  };
  
  return { data: chartData, options };
};

// HRV Chart Configuration
export const hrvChartConfig = (data: number[] = [42, 45, 44, 48, 52, 54, 56]) => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const chartData: ChartData<'line'> = {
    labels,
    datasets: [{
      label: 'HRV',
      data,
      borderColor: '#FF7D54',
      backgroundColor: 'rgba(255, 125, 84, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
    }]
  };
  
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { display: false }
      },
      x: {
        grid: { display: false }
      }
    }
  };
  
  return { data: chartData, options };
};

// Sleep Chart Configuration
export const sleepChartConfig = (data: number[] = [7.2, 6.8, 7.5, 6.5, 8.1, 8.4, 7.2]) => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [{
      label: 'Hours',
      data,
      backgroundColor: '#57D9A3',
      borderRadius: 4,
      barThickness: 12,
    }]
  };
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: { display: false }
      },
      x: {
        grid: { display: false }
      }
    }
  };
  
  return { data: chartData, options };
};

// Forecast Chart Configuration
export const forecastChartConfig = (
  actual: number[] = [6500, 2000, 7800, 3200, 9400, 8200, 4500],
  predicted: number[] = [7000, 2200, 8500, 3500, 10500, 9000, 5000]
) => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const chartData: ChartData<'line'> = {
    labels,
    datasets: [{
      label: 'Actual',
      data: actual,
      borderColor: 'hsl(var(--primary))',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 3,
    }, {
      label: 'Predicted',
      data: predicted,
      borderColor: '#FF7D54',
      borderDash: [5, 5],
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
    }]
  };
  
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false }
      },
      x: {
        grid: { display: false }
      }
    }
  };
  
  return { data: chartData, options };
};

// Activity Distribution Chart Configuration
export const activityDistributionChartConfig = (
  data: number[] = [45, 25, 20, 10]
) => {
  const labels = ['Walking', 'Running', 'Cycling', 'Other'];
  
  const chartData: ChartData<'doughnut'> = {
    labels,
    datasets: [{
      data,
      backgroundColor: [
        'hsl(var(--primary))', 
        '#57D9A3', 
        '#FF7D54', 
        'hsl(var(--muted))'
      ],
      borderWidth: 0,
    }]
  };
  
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 10,
          padding: 20,
        }
      }
    },
    cutout: '70%',
  };
  
  return { data: chartData, options };
};

// Heart Rate Zones Chart Configuration
export const heartRateZonesChartConfig = (
  data = {
    peak: [5, 2, 8, 3, 12, 15, 4],
    cardio: [18, 12, 24, 14, 28, 32, 15],
    fatBurn: [35, 28, 42, 32, 48, 52, 30],
    resting: [120, 125, 118, 128, 110, 112, 122]
  }
) => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [{
      label: 'Peak',
      data: data.peak,
      backgroundColor: '#F87171',
      barPercentage: 0.7,
    }, {
      label: 'Cardio',
      data: data.cardio,
      backgroundColor: '#FBBF24',
      barPercentage: 0.7,
    }, {
      label: 'Fat Burn',
      data: data.fatBurn,
      backgroundColor: '#34D399',
      barPercentage: 0.7,
    }, {
      label: 'Resting',
      data: data.resting,
      backgroundColor: '#60A5FA',
      barPercentage: 0.7,
    }]
  };
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false }
      },
      y: {
        stacked: true,
        grid: { display: false }
      }
    }
  };
  
  return { data: chartData, options };
};

// Sleep Analysis Chart Configuration
export const sleepAnalysisChartConfig = (
  data = {
    deep: [1.7, 1.5, 1.8, 1.4, 2.0, 2.1, 1.8],
    light: [4.2, 4.0, 4.3, 3.8, 4.8, 5.0, 4.2],
    rem: [1.3, 1.3, 1.4, 1.3, 1.3, 1.3, 1.2]
  }
) => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [{
      label: 'Deep Sleep',
      data: data.deep,
      backgroundColor: 'hsl(var(--primary))',
      barPercentage: 0.7,
    }, {
      label: 'Light Sleep',
      data: data.light,
      backgroundColor: '#57D9A3',
      barPercentage: 0.7,
    }, {
      label: 'REM',
      data: data.rem,
      backgroundColor: '#FF7D54',
      barPercentage: 0.7,
    }]
  };
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false }
      },
      y: {
        stacked: true,
        grid: { display: false },
        max: 10
      }
    }
  };
  
  return { data: chartData, options };
};
