// Web stub for react-native-chart-kit
import React from 'react';

const createChartComponent = (name) => {
  return React.forwardRef((props, ref) => {
    return React.createElement('div', {
      ...props,
      ref,
      style: { 
        width: props.width || 200,
        height: props.height || 200,
        ...props.style 
      },
      'data-chart-type': name,
    }, 'Chart placeholder for web');
  });
};

export const LineChart = createChartComponent('LineChart');
export const BarChart = createChartComponent('BarChart');
export const PieChart = createChartComponent('PieChart');
export const ProgressChart = createChartComponent('ProgressChart');
export const ContributionGraph = createChartComponent('ContributionGraph');
export const StackedBarChart = createChartComponent('StackedBarChart');

export default {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
};
