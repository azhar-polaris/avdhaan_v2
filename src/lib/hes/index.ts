import moment from "moment";
import { ApexOptions } from "apexcharts";

type ChartData = {
  collectedData: { value: number; count: number; data_timestamp: string }[];
  missedData: { value: number; count: number; data_timestamp: string }[];
};

export const prepareChartData = (data: ChartData, chartType: 'bar' | 'line') => {
  const transformDataForChart = (data: ChartData['collectedData']) => {
    // Sort the data array by the data_timestamp in ascending order
    const sortedData = [...data].sort((a, b) => new Date(a.data_timestamp).getTime() - new Date(b.data_timestamp).getTime());

    return {
      dates: sortedData.map(item => 
        chartType === 'bar' ? moment(item.data_timestamp).format('MMM YYYY') : moment(item.data_timestamp).format('h:mm A')
      ),
      values: sortedData.map(item => item.value)
    };
  };

  const collectedDataTransformed = transformDataForChart(data.collectedData);
  const missedDataTransformed = transformDataForChart(data.missedData);

  const series = [
    {
      name: "% Reads Fetched",
      data: collectedDataTransformed.values
    },
    {
      name: "% Missed Fetched",
      data: missedDataTransformed.values
    }
  ];

  const commonOptions: ApexOptions = {
    chart: {
      type: chartType,
      height: 350,
      toolbar: {
        show: false
      }
    },
    yaxis: {
      tooltip: {
        enabled: false
      }
    },
    xaxis: {
      tooltip: {
        enabled: false
      },
      categories: collectedDataTransformed.dates,
      labels: {
        style: {
          fontSize: '12px',
          colors: '#6c757d'
        }
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex }) {
        return '<div class="arrow_box">' +
          '<span>' + `${series[seriesIndex][dataPointIndex]}%` + '</span>' +
          '</div>';
      }
    },
  };

  const barSpecificOptions: ApexOptions = {
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
      }
    },
    stroke: {
      colors: ["transparent"],
      width: 5
    },
    grid: {
      show: true,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    dataLabels: {
      enabled: false
    },
  };

  const lineSpecificOptions: ApexOptions = {
    markers: {
      shape: 'circle',
      size: 5
    },
    grid: {
      show: true,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    }
  };

  const options = {
    ...commonOptions,
    ...(chartType === 'bar' ? barSpecificOptions : lineSpecificOptions)
  };

  return { series, options };
};


