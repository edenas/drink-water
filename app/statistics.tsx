import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';

const waterHistoryStorageKey = 'waterHistory';
const hourlyWaterHistoryStorageKey = 'hourlyWaterHistory';
const allTimeWaterAmountStorageKey = 'allTimeWaterAmount';

const getDateKey = (date: Date) => date.toISOString().split('T')[0];

const getCurrentWeekDateKeys = () => {
  const dates = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);

  monday.setDate(today.getDate() - daysSinceMonday);

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    dates.push(getDateKey(date));
  }

  return dates;
};

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

const getWeekLabels = () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getCurrentYearMonthKeys = (year: string) =>
  Array.from(
    { length: 12 },
    (_, month) => `${year}-${String(month + 1).padStart(2, '0')}`
  );

const getCurrentMonthDateKeys = (today = new Date()) => {
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthKey = String(month + 1).padStart(2, '0');

  return Array.from(
    { length: daysInMonth },
    (_, day) => `${year}-${monthKey}-${String(day + 1).padStart(2, '0')}`
  );
};

const getCurrentMonthChartData = (waterHistory: Record<string, number>) => {
  const monthDates = getCurrentMonthDateKeys();

  return {
    labels: monthDates.map((date) => String(Number(date.slice(8, 10)))),
    values: monthDates.map((date) =>
      Number(((waterHistory[date] || 0) / 1000).toFixed(2))
    ),
  };
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
  <Text style={styles.chartSwipeHint}>{'\u2190 Swipe sideways \u2192'}</Text>
);

const chartConfig = {
  backgroundGradientFrom: '#F8FDFF',
  backgroundGradientTo: '#F8FDFF',
  barPercentage: 0.52,
  color: (opacity = 1) => `rgba(0, 151, 211, ${opacity})`,
  decimalPlaces: 1,
  labelColor: (opacity = 1) => `rgba(36, 86, 106, ${opacity})`,
  propsForBackgroundLines: {
    stroke: '#DCEFF7',
    strokeDasharray: '4 6',
  },
};

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
  const chartCardsAnimation = useRef(new Animated.Value(0)).current;
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    allTime: 0,
  });
  const [weeklyChart, setWeeklyChart] = useState({
    labels: getWeekLabels(),
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
    labels: getCurrentMonthDateKeys().map((date) =>
      String(Number(date.slice(8, 10)))
    ),
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
      labels: getWeekLabels(),
      values: weekDates.map((date) =>
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
    setMonthlyChart(getCurrentMonthChartData(waterHistory));
    setAllTimeChart(getLatestYearChartData(waterHistory));
  }, []);

  useEffect(() => {
    loadWaterData();
  }, [loadWaterData]);

  useEffect(() => {
    chartCardsAnimation.setValue(0);
    Animated.timing(chartCardsAnimation, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [chartCardsAnimation, todayChart, weeklyChart, monthlyChart, yearlyChart, allTimeChart]);

  useFocusEffect(
    useCallback(() => {
      loadWaterData();
    }, [loadWaterData])
  );

  const formatLiters = (amount: number) => `${(amount / 1000).toFixed(2)} L`;
  const chartVisibleWidth = width - 48;
  const chartWidth = Math.max(chartVisibleWidth, 7 * 58);
  const hourlyChartWidth = Math.max(chartVisibleWidth, 24 * 64);
  const monthlyChartWidth = Math.max(
    chartVisibleWidth,
    monthlyChart.labels.length * 44
  );
  const yearlyChartWidth = Math.max(chartVisibleWidth, 12 * 52);
  const allTimeChartWidth =
    allTimeChart.labels.length > 5
      ? Math.max(chartVisibleWidth, allTimeChart.labels.length * 64)
      : chartVisibleWidth;
  const isWeeklyChartScrollable = chartWidth > chartVisibleWidth;
  const isHourlyChartScrollable = hourlyChartWidth > chartVisibleWidth;
  const isMonthlyChartScrollable = monthlyChartWidth > chartVisibleWidth;
  const isYearlyChartScrollable = yearlyChartWidth > chartVisibleWidth;
  const isAllTimeChartScrollable =
    allTimeChart.labels.length > 5 && allTimeChartWidth > chartVisibleWidth;
  const animatedChartCardStyle = {
    opacity: chartCardsAnimation,
    transform: [
      {
        translateY: chartCardsAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
      {
        scale: chartCardsAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Statistics</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>{formatLiters(stats.today)}</Text>
        </View>

        <Animated.View style={[styles.chartCard, animatedChartCardStyle]}>
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
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </ScrollView>
          {isHourlyChartScrollable && <ChartSwipeHint />}
        </Animated.View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>This week</Text>
          <Text style={styles.statValue}>{formatLiters(stats.week)}</Text>
        </View>

        <Animated.View style={[styles.chartCard, animatedChartCardStyle]}>
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
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </ScrollView>
          {isWeeklyChartScrollable && <ChartSwipeHint />}
        </Animated.View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>This month</Text>
          <Text style={styles.statValue}>{formatLiters(stats.month)}</Text>
        </View>

        <Animated.View style={[styles.chartCard, animatedChartCardStyle]}>
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
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </ScrollView>
          {isMonthlyChartScrollable && <ChartSwipeHint />}
        </Animated.View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>This year</Text>
          <Text style={styles.statValue}>{formatLiters(stats.year)}</Text>
        </View>

        <Animated.View style={[styles.chartCard, animatedChartCardStyle]}>
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
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </ScrollView>
          {isYearlyChartScrollable && <ChartSwipeHint />}
        </Animated.View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>All time</Text>
          <Text style={styles.statValue}>{formatLiters(stats.allTime)}</Text>
        </View>

        {allTimeChart.labels.length > 0 && (
          <Animated.View style={[styles.chartCard, animatedChartCardStyle]}>
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
                  chartConfig={chartConfig}
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
                chartConfig={chartConfig}
                fromZero
                showValuesOnTopOfBars
                style={styles.chart}
              />
            )}
          </Animated.View>
        )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    color: '#173B4A',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 22,
  },
  chart: {
    borderRadius: 18,
    marginVertical: 8,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    elevation: 4,
    marginBottom: 30,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 20,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  chartScrollContent: {
    paddingLeft: 10,
    paddingRight: 52,
  },
  chartSwipeHint: {
    alignSelf: 'center',
    backgroundColor: '#F4FBFF',
    borderColor: '#D4EEF8',
    borderRadius: 999,
    borderWidth: 1,
    color: '#6B7C85',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 22,
    elevation: 3,
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  statLabel: {
    color: '#24566A',
    fontSize: 17,
    fontWeight: '700',
  },
  statValue: {
    color: '#007FB1',
    fontSize: 22,
    fontWeight: '700',
  },
});

