import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApexOptions } from 'apexcharts';
import { ChartData, DataType } from '@/store/hes/types/prepare-chart-data';
import { jwtDecode } from 'jwt-decode';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function enableMocking() {
  const { worker } = await import('../mocks/browser');
  return worker.start();
}

export function serializeFormData<T>(formData: FormData) {
  const formPayload: { [key: string]: string | string[] } = {};
  for (const [key, value] of formData.entries()) {
    const keyExists = key in formPayload;
    if (!keyExists) {
      formPayload[key] = value as string;
    } else {
      const prevValue = formPayload[key];
      if (typeof prevValue === 'object') {
        const prevValue = formPayload[key];
        formPayload[key] = [...prevValue, value as string];
      } else {
        formPayload[key] = [prevValue, value as string];
      }
    }
  }
  return formPayload as T;
}

export function convertToDateTime(input: string, postFix: string) {
  if (!input || !input.length) return '';
  const dateTime = input.split('T');
  if (dateTime.length < 2) return '';
  let time = dateTime[1];
  if (time.length === 5) {
    time = time + postFix;
  }
  return dateTime[0] + ' ' + time;
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export const onMouseSidebarEnter = (val: number) => {
  const items = document.querySelectorAll(`.sidebar-item-${val}`);
  Array.from(items).forEach((item) => {
    const sidebarIcon = item.querySelector('.sidebar-icon') as HTMLElement;
    if (sidebarIcon) {
      sidebarIcon.classList.remove('custom-sidebar-icon');
    }
    const newItem = item as HTMLElement;
    newItem.style.backgroundColor = '#48b1f1';
  });
};

export const onMouseSidebarLeave = (val: number) => {
  const items = document.querySelectorAll(`.sidebar-item-${val}`);
  Array.from(items).forEach((item) => {
    const sidebarIcon = item.querySelector('.sidebar-icon') as HTMLElement;
    if (sidebarIcon) {
      sidebarIcon.classList.add('custom-sidebar-icon');
    }
    const newItem = item as HTMLElement;
    newItem.style.backgroundColor = 'transparent';
  });
};

function createUniqueColorGenerator() {
  let counter = 0; // Initialize counter

  function getRandomChannelValue(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getUniqueColor() {
    let red, green, blue;

    // Ensure colors are not too dark or too light
    do {
      // Generate random values for the RGB channels
      red = getRandomChannelValue(50, 205); // Avoid too dark (min=50) and too light (max=205)
      green = getRandomChannelValue(50, 205);
      blue = getRandomChannelValue(50, 205);

      // Adjust based on counter to ensure uniqueness
      red = (red + counter * 1234567) & 0xff;
      green = (green + counter * 2345678) & 0xff;
      blue = (blue + counter * 3456789) & 0xff;

      // Increment counter
      counter++;

      // Ensure the color is not too dark or too light
    } while (red + green + blue < 150 || red + green + blue > 600);

    // Convert RGB to hex color
    const color = `#${red.toString(16).padStart(2, '0')}${green
      .toString(16)
      .padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
    return color;
  }

  return getUniqueColor;
}

// Example usage
export const getUniqueColor = createUniqueColorGenerator();

function getRandomCoordinate(max: number) {
  return Math.floor(Math.random() * max);
}

export function generateRandomShape() {
  return `M ${getRandomCoordinate(50)} ${getRandomCoordinate(
    50
  )} C ${getRandomCoordinate(200)} ${getRandomCoordinate(
    100
  )}, ${getRandomCoordinate(200)} ${getRandomCoordinate(
    100
  )}, ${getRandomCoordinate(200)} ${getRandomCoordinate(
    100
  )} S ${getRandomCoordinate(200)} ${getRandomCoordinate(
    100
  )}, ${getRandomCoordinate(200)} ${getRandomCoordinate(
    100
  )} C ${getRandomCoordinate(200)} ${getRandomCoordinate(
    100
  )}, ${getRandomCoordinate(200)} ${getRandomCoordinate(
    100
  )}, ${getRandomCoordinate(200)} ${getRandomCoordinate(
    100
  )} S ${getRandomCoordinate(200)} ${getRandomCoordinate(
    100
  )}, ${getRandomCoordinate(200)} ${getRandomCoordinate(100)} Z`;
}

export const formatDate = (
  date: string | Date | number,
  format: string
): string => {
  const options: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case 'MMM YYYY':
      options.year = 'numeric';
      options.month = 'short';
      break;
    case 'D MMM':
      options.day = 'numeric';
      options.month = 'short';
      break;
    case 'h:mm A':
      options.hour = 'numeric';
      options.minute = 'numeric';
      options.hour12 = true;
      break;
    case 'DD-MM-YYYY':
      options.day = '2-digit';
      options.month = '2-digit';
      options.year = 'numeric';
      break;
    case 'HH:mm':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false;
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
};

// Define the function with fixed parameters and dynamic keys
export const prepareChartData = (
  data: ChartData,
  chartType: 'bar' | 'line',
  dateType: 'days' | 'time' | 'month'
) => {
  const transformDataForChart = (data: DataType[]) => {
    const sortedData = [...data].sort(
      (a, b) =>
        new Date(a.data_timestamp).getTime() -
        new Date(b.data_timestamp).getTime()
    );

    const dateFormat =
      dateType === 'month'
        ? 'MMM YYYY'
        : dateType === 'days'
        ? 'D MMM'
        : 'h:mm A';

    return {
      dates: sortedData.map((item) =>
        formatDate(item.data_timestamp, dateFormat)
      ),
      values: sortedData.map((item) => item.value)
    };
  };

  const collectedDataTransformed = transformDataForChart(data['data1'] || []);
  const missedDataTransformed = transformDataForChart(data['data2'] || []);

  const getLimitedData = (
    data: { dates: string[]; values: number[] },
    limit: number
  ) => {
    const slicedDates = data.dates.slice(-limit);
    const slicedValues = data.values.slice(-limit);
    return { dates: slicedDates, values: slicedValues };
  };

  const isMobile = window.innerWidth < 768;
  const limit = isMobile ? 4 : collectedDataTransformed.dates.length; // Limit to 4 on mobile or show all

  const collectedDataLimited = getLimitedData(collectedDataTransformed, limit);
  const missedDataLimited = getLimitedData(missedDataTransformed, limit);

  const series = [
    {
      name: '% Reads Fetched',
      data: collectedDataLimited.values
    },
    {
      name: '% Missed Fetched',
      data: missedDataLimited.values
    }
  ];

  const commonOptions: ApexOptions = {
    chart: {
      zoom: { enabled: false },
      type: chartType,
      height: 350,
      toolbar: {
        show: false
      }
    },
    yaxis: {
      tooltip: {
        enabled: false
      },
      labels: {
        formatter: (val) => `${val}%`,
        style: {
          fontSize: '12px',
          colors: ['#A3B2CF']
        }
      }
    },
    xaxis: {
      tooltip: {
        enabled: false
      },
      categories: collectedDataLimited.dates,
      labels: {
        style: {
          fontSize: '12px',
          colors: collectedDataLimited.dates.map(() => '#A3B2CF')
        },
        format:
          dateType === 'month'
            ? 'MMM yyyy'
            : dateType === 'days'
            ? 'd MMM'
            : 'h:mm TT'
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    },
    tooltip: {
      followCursor: true,
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        return (
          '<div class="arrow_box">' +
          '<span>' +
          `${series[seriesIndex][dataPointIndex]}%` +
          '</span>' +
          '</div>'
        );
      }
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 250
          },
          xaxis: {
            categories: collectedDataLimited.dates, // Show only the last 4 entries
            labels: {
              style: {
                fontSize: '8px'
              }
            }
          },
          yaxis: {
            labels: {
              style: {
                fontSize: '8px'
              }
            }
          }
        }
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 200
          },
          xaxis: {
            categories: collectedDataLimited.dates, // Show only the last 4 entries
            labels: {
              style: {
                fontSize: '6px'
              }
            }
          },
          yaxis: {
            labels: {
              style: {
                fontSize: '6px'
              }
            }
          }
        }
      }
    ]
  };

  const barSpecificOptions: ApexOptions = {
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%'
      }
    },
    stroke: {
      colors: ['transparent'],
      width: 5
    },
    colors: ['#0A3690', '#B9CDF4'],
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
    }
  };

  const lineSpecificOptions: ApexOptions = {
    markers: {
      shape: 'circle',
      size: 5
    },
    colors: ['#0A3690', '#02C9A8'],
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

export const fetchToken = async () => {
  let token: string | null = localStorage.getItem('token');

  if (token) {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      console.log('Token is expired, fetching a new one...');
      token = await getNewToken();
    }
  } else {
    token = await getNewToken();
  }

  if (token) {
    console.log('Token is valid or newly fetched');
  }
};

export const getNewToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_HES_BASE_URL}/v1/auth/token`,
      {
        method: 'POST',
        body: JSON.stringify({
          authID: 'bdf234d4-e1bb-4df3-a27e-433d596b808c'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      }
    );

    const data = await response.json();

    if (data) {
      const newToken = data?.data?.records[0]?.token;
      localStorage.setItem('token', newToken);
      return newToken;
    } else {
      console.error('Failed to get the new token');
      return null;
    }
  } catch (error) {
    console.error('Error fetching new token:', error);
    return null;
  }
};

export const formatDateTimeForSearchParams = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = (num: number) => (num < 10 ? '0' : '') + num;

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const getLast7DaysMinMax = (): { minDate: string; maxDate: string } => {
  const currentDate = new Date();
  const maxDate = new Date(currentDate);

  // Calculate the minimum date by subtracting 7 days
  const minDate = new Date(currentDate);
  minDate.setDate(currentDate.getDate() - 7);

  // Helper function to format date as YYYY-MM-DDTHH:mm:ss
  const formatDateTime = (date: Date): string => {
    const pad = (num: number) => (num < 10 ? '0' : '') + num;

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T23:59:59`;
  };

  return {
    minDate: formatDateTime(minDate),
    maxDate: formatDateTime(maxDate)
  };
};
