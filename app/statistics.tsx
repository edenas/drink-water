import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const waterHistoryStorageKey = 'waterHistory';
const hourlyWaterHistoryStorageKey = 'hourlyWaterHistory';
const allTimeWaterAmountStorageKey = 'allTimeWaterAmount';

const getDateKey = (date: Date) => date.toISOString().split('T')[0];

const getCurrentWeekDateKeys = () => {
  const dates = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  for (let index = daysSinceMonday; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    dates.push(getDateKey(date));
  }

  return dates;
};

const getLastSevenDateKeys = () => {
  const dates = [];
  const today = new Date();

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    dates.push(getDateKey(date));
  }

  return dates;
};

const getChartLabel = (dateKey: string) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
  });

const getHourLabels = () =>
  Array.from({ length: 24 }, (_, hour) =>
    `${String(hour).padStart(2, '0')}:00`
  );

const getMonthLabels = () => [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const getCurrentYearMonthKeys = (year: string) =>
  Array.from(
    { length: 12 },
    (_, month) => `${year}-${String(month + 1).padStart(2, '0')}`
  );

const getCurrentMonthDateKeys = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthKey = String(month + 1).padStart(2, '0');

  return Array.from(
    { length: daysInMonth },
    (_, day) => `${year}-${monthKey}-${String(day + 1).padStart(2, '0')}`
  );
};

const getLatestYearChartData = (waterHistory: Record<string, number>) => {
  const totalsByYear = Object.entries(waterHistory).reduce<
    Record<string, number>
  >((totals, [date, amount]) => {
    if (amount <= 0) {
      return totals;
    }

    const year = date.slice(0, 4);

    return {
      ...totals,
      [year]: (totals[year] || 0) + amount,
    };
  }, {});
  const years = Object.keys(totalsByYear).sort().slice(-5);

  return {
    labels: years,
    values: years.map((year) =>
      Number((totalsByYear[year] / 1000).toFixed(2))
    ),
  };
};

const ChartSwipeHint = () => (
  <Text style={styles.chartSwipeHint}>Swipe sideways →</Text>
);

const sumDates = (waterHistory: Record<string, number>, dates: string[]) =>
  dates.reduce((total, date) => total + (waterHistory[date] || 0), 0);

const sumMatchingDates = (
  waterHistory: Record<string, number>,
  dateStart: string
) =>
  Object.entries(waterHistory).reduce(
    (total, [date, amount]) =>
      date.startsWith(dateStart) ? total + amount : total,
    0
  );

export default function StatisticsScreen() {
  const { width } = useWindowDimensions();
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    allTime: 0,
  });
  const [weeklyChart, setWeeklyChart] = useState({
    labels: getLastSevenDateKeys().map(getChartLabel),
    values: Array(7).fill(0),
  });
  const [todayChart, setTodayChart] = useState({
    labels: getHourLabels(),
    values: Array(24).fill(0),
  });
  const [yearlyChart, setYearlyChart] = useState({
    labels: getMonthLabels(),
    values: Array(12).fill(0),
  });
  const [monthlyChart, setMonthlyChart] = useState({
    labels: getCurrentMonthDateKeys().map((date) => String(Number(date.slice(8, 10)))),
    values: Array(getCurrentMonthDateKeys().length).fill(0),
  });
  const [allTimeChart, setAllTimeChart] = useState({
    labels: [] as string[],
    values: [] as number[],
  });

  const loadWaterData = useCallback(async () => {
    const savedWaterHistory = await AsyncStorage.getItem(
      waterHistoryStorageKey
    );
    const savedHourlyWaterHistory = await AsyncStorage.getItem(
      hourlyWaterHistoryStorageKey
    );
    const savedAllTimeWaterAmount = await AsyncStorage.getItem(
      allTimeWaterAmountStorageKey
    );
    const waterHistory: Record<string, number> =
      savedWaterHistory !== null ? JSON.parse(savedWaterHistory) : {};
    const hourlyWaterHistory: Record<string, Record<string, number>> =
      savedHourlyWaterHistory !== null
        ? JSON.parse(savedHourlyWaterHistory)
        : {};
    const today = getDateKey(new Date());
    const todayHourlyHistory = hourlyWaterHistory[today] || {};
    const weekDates = getCurrentWeekDateKeys();
    const chartDates = getLastSevenDateKeys();
    const monthDates = getCurrentMonthDateKeys();
    const currentMonth = today.slice(0, 7);
    const currentYear = today.slice(0, 4);
    const yearlyChartMonths = getCurrentYearMonthKeys(currentYear);
    const historyValues = Object.values(waterHistory);
    const allTimeFromHistory = historyValues.reduce(
      (total, amount) => total + amount,
      0
    );

    setStats({
      today: waterHistory[today] || 0,
      week: sumDates(waterHistory, weekDates),
      month: sumMatchingDates(waterHistory, currentMonth),
      year: sumMatchingDates(waterHistory, currentYear),
      allTime:
        allTimeFromHistory ||
        (savedAllTimeWaterAmount !== null
          ? Number(savedAllTimeWaterAmount)
          : 0),
    });
    setWeeklyChart({
      labels: chartDates.map(getChartLabel),
      values: chartDates.map((date) =>
        Number(((waterHistory[date] || 0) / 1000).toFixed(2))
      ),
    });
    setTodayChart({
      labels: getHourLabels(),
      values: Array.from({ length: 24 }, (_, hour) =>
        Number(((todayHourlyHistory[String(hour)] || 0) / 1000).toFixed(2))
      ),
    });
    setYearlyChart({
      labels: getMonthLabels(),
      values: yearlyChartMonths.map((month) =>
        Number((sumMatchingDates(waterHistory, month) / 1000).toFixed(2))
      ),
    });
    setMonthlyChart({
      labels: monthDates.map((date) => String(Number(date.slice(8, 10)))),
      values: monthDates.map((date) =>
        Number(((waterHistory[date] || 0) / 1000).toFixed(2))
      ),
    });
    setAllTimeChart(getLatestYearChartData(waterHistory));
  }, []);

  useEffect(() => {
    loadWaterData();
  }, [loadWaterData]);

  useFocusEffect(
    useCallback(() => {
      loadWaterData();
    }, [loadWaterData])
  );

  const formatLiters = (amount: number) => `${(amount / 1000).toFixed(2)} L`;
  const chartVisibleWidth = width - 48;
  const chartWidth = Math.max(chartVisibleWidth, 420);
  const hourlyChartWidth = Math.max(chartVisibleWidth, 1800);
  const monthlyChartWidth = Math.max(chartVisibleWidth, 960);
  const yearlyChartWidth = Math.max(chartVisibleWidth, 520);
  const allTimeChartWidth =
    allTimeChart.labels.length > 5
      ? Math.max(chartVisibleWidth, allTimeChart.labels.length * 72)
      : chartVisibleWidth;
  const isWeeklyChartScrollable = chartWidth > chartVisibleWidth;
  const isHourlyChartScrollable = hourlyChartWidth > chartVisibleWidth;
  const isMonthlyChartScrollable = monthlyChartWidth > chartVisibleWidth;
  const isYearlyChartScrollable = yearlyChartWidth > chartVisibleWidth;
  const isAllTimeChartScrollable =
    allTimeChart.labels.length > 5 && allTimeChartWidth > chartVisibleWidth;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Statistics</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>{formatLiters(stats.today)}</Text>
        </View>

        <View style={styles.chartCard}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.chartScrollContent}
            showsHorizontalScrollIndicator
          >
            <BarChart
              data={{
                labels: todayChart.labels,
                datasets: [{ data: todayChart.values }],
              }}
              width={hourlyChartWidth}
              height={190}
              yAxisLabel=""
              yAxisSuffix=" L"
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 174, 239, ${opacity})`,
                decimalPlaces: 1,
                labelColor: (opacity = 1) => `rgba(30, 45, 54, ${opacity})`,
                propsForBackgroundLines: {
                  stroke: '#D7EEF7',
                },
              }}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </ScrollView>
          {isHourlyChartScrollable && <ChartSwipeHint />}
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>This week</Text>
          <Text style={styles.statValue}>{formatLiters(stats.week)}</Text>
        </View>

        <View style={styles.chartCard}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.chartScrollContent}
            showsHorizontalScrollIndicator
          >
            <BarChart
              data={{
                labels: weeklyChart.labels,
                datasets: [{ data: weeklyChart.values }],
              }}
              width={chartWidth}
              height={190}
              yAxisLabel=""
              yAxisSuffix=" L"
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 174, 239, ${opacity})`,
                decimalPlaces: 1,
                labelColor: (opacity = 1) => `rgba(30, 45, 54, ${opacity})`,
                propsForBackgroundLines: {
                  stroke: '#D7EEF7',
                },
              }}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </ScrollView>
          {isWeeklyChartScrollable && <ChartSwipeHint />}
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>This month</Text>
          <Text style={styles.statValue}>{formatLiters(stats.month)}</Text>
        </View>

        <View style={styles.chartCard}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.chartScrollContent}
            showsHorizontalScrollIndicator
          >
            <BarChart
              data={{
                labels: monthlyChart.labels,
                datasets: [{ data: monthlyChart.values }],
              }}
              width={monthlyChartWidth}
              height={190}
              yAxisLabel=""
              yAxisSuffix=" L"
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 174, 239, ${opacity})`,
                decimalPlaces: 1,
                labelColor: (opacity = 1) => `rgba(30, 45, 54, ${opacity})`,
                propsForBackgroundLines: {
                  stroke: '#D7EEF7',
                },
              }}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </ScrollView>
          {isMonthlyChartScrollable && <ChartSwipeHint />}
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>This year</Text>
          <Text style={styles.statValue}>{formatLiters(stats.year)}</Text>
        </View>

        <View style={styles.chartCard}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.chartScrollContent}
            showsHorizontalScrollIndicator
          >
            <BarChart
              data={{
                labels: yearlyChart.labels,
                datasets: [{ data: yearlyChart.values }],
              }}
              width={yearlyChartWidth}
              height={190}
              yAxisLabel=""
              yAxisSuffix=" L"
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 174, 239, ${opacity})`,
                decimalPlaces: 1,
                labelColor: (opacity = 1) => `rgba(30, 45, 54, ${opacity})`,
                propsForBackgroundLines: {
                  stroke: '#D7EEF7',
                },
              }}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </ScrollView>
          {isYearlyChartScrollable && <ChartSwipeHint />}
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>All time</Text>
          <Text style={styles.statValue}>{formatLiters(stats.allTime)}</Text>
        </View>

        {allTimeChart.labels.length > 0 && (
          <View style={styles.chartCard}>
            {isAllTimeChartScrollable ? (
              <ScrollView
                horizontal
                contentContainerStyle={styles.chartScrollContent}
                showsHorizontalScrollIndicator
              >
                <BarChart
                  data={{
                    labels: allTimeChart.labels,
                    datasets: [{ data: allTimeChart.values }],
                  }}
                  width={allTimeChartWidth}
                  height={190}
                  yAxisLabel=""
                  yAxisSuffix=" L"
                  chartConfig={{
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    color: (opacity = 1) => `rgba(0, 174, 239, ${opacity})`,
                    decimalPlaces: 1,
                    labelColor: (opacity = 1) =>
                      `rgba(30, 45, 54, ${opacity})`,
                    propsForBackgroundLines: {
                      stroke: '#D7EEF7',
                    },
                  }}
                  fromZero
                  showValuesOnTopOfBars
                  style={styles.chart}
                />
              </ScrollView>
            ) : (
              <BarChart
                data={{
                  labels: allTimeChart.labels,
                  datasets: [{ data: allTimeChart.values }],
                }}
                width={allTimeChartWidth}
                height={190}
                yAxisLabel=""
                yAxisSuffix=" L"
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => `rgba(0, 174, 239, ${opacity})`,
                  decimalPlaces: 1,
                  labelColor: (opacity = 1) => `rgba(30, 45, 54, ${opacity})`,
                  propsForBackgroundLines: {
                    stroke: '#D7EEF7',
                  },
                }}
                fromZero
                showValuesOnTopOfBars
                style={styles.chart}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F7FF',
  },
  content: {
    padding: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chart: {
    borderRadius: 10,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 24,
    overflow: 'hidden',
  },
  chartScrollContent: {
    paddingRight: 40,
  },
  chartSwipeHint: {
    color: '#6F8A99',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00AEEF',
  },
});
