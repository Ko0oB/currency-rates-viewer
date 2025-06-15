document.addEventListener('DOMContentLoaded', () => {
  const {
    labels,
    dataRates,
    minRate,
    maxRate,
    meanRate,
    medianRate,
    currency
  } = window.appData;

  const ctx = document.getElementById('rateChart').getContext('2d');

  // Utility to find index of min/max for point highlight
  const minIndex = dataRates.indexOf(minRate);
  const maxIndex = dataRates.indexOf(maxRate);

  // Plugin to draw horizontal lines for min and max rates (red and blue)
  const horizontalLinePlugin = {
    id: 'horizontalLine',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea: { left, right }, scales: { y } } = chart;

      ctx.save();

      // Draw min line (red)
      ctx.strokeStyle = 'rgba(244, 67, 54, 0.8)';
      ctx.lineWidth = 1.5;
      const yMin = y.getPixelForValue(minRate);
      ctx.beginPath();
      ctx.moveTo(left, yMin);
      ctx.lineTo(right, yMin);
      ctx.stroke();

      // Draw max line (blue)
      ctx.strokeStyle = 'rgba(30, 136, 229, 0.8)';
      const yMax = y.getPixelForValue(maxRate);
      ctx.beginPath();
      ctx.moveTo(left, yMax);
      ctx.lineTo(right, yMax);
      ctx.stroke();

      ctx.restore();
    }
  };

  // Chart config
  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `Exchange Rate (${currency})`,
          data: dataRates,
          borderColor: '#1565c0',
          backgroundColor: 'rgba(21, 101, 192, 0.2)',
          fill: true,
          tension: 0.25,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 3,
          // Highlight min/max points with bigger colored dots
          pointBackgroundColor: context => {
            const index = context.dataIndex;
            if (index === minIndex) return 'rgba(244, 67, 54, 1)';
            if (index === maxIndex) return 'rgba(30, 136, 229, 1)';
            return '#1565c0';
          },
          pointBorderWidth: context => {
            const index = context.dataIndex;
            if (index === minIndex || index === maxIndex) return 3;
            return 1;
          }
        },
        {
          label: 'Mean',
          data: Array(dataRates.length).fill(meanRate),
          borderColor: '#fb8c00',
          borderDash: [8, 6],
          fill: false,
          hidden: false,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'Median',
          data: Array(dataRates.length).fill(medianRate),
          borderColor: '#4caf50',
          borderDash: [6, 4],
          fill: false,
          hidden: false,
          pointRadius: 0,
          borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              size: 14,
              weight: '600'
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + ctx.formattedValue
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            maxTicksLimit: 15,
            font: { size: 12 }
          },
          grid: { display: false }
        },
        y: {
          beginAtZero: false,
          ticks: {
            font: { size: 13 }
          },
          grid: { borderDash: [4, 5] }
        }
      }
    },
    plugins: [horizontalLinePlugin]
  };

  const rateChart = new Chart(ctx, config);

  // Checkbox toggles
  const showMeanCheckbox = document.getElementById('showMean');
  const showMedianCheckbox = document.getElementById('showMedian');

  if (showMeanCheckbox) {
    showMeanCheckbox.addEventListener('change', () => {
      rateChart.data.datasets[1].hidden = !showMeanCheckbox.checked;
      rateChart.update();
    });
  }

  if (showMedianCheckbox) {
    showMedianCheckbox.addEventListener('change', () => {
      rateChart.data.datasets[2].hidden = !showMedianCheckbox.checked;
      rateChart.update();
    });
  }
});
