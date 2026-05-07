import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  InteractionManager,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedScreenContent from '@/components/AnimatedScreenContent';
import ScreenBackground from '@/components/ScreenBackground';
import ScreenLoading from '@/components/ScreenLoading';
import { useI18n } from '@/logic/i18n';

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

type Translate = ReturnType<typeof useI18n>['t'];

const getMonthLabels = (t: Translate) => [
  t('month.jan'),
  t('month.feb'),
  t('month.mar'),
  t('month.apr'),
  t('month.may'),
  t('month.jun'),
  t('month.jul'),
  t('month.aug'),
  t('month.sep'),
  t('month.oct'),
  t('month.nov'),
  t('month.dec'),
];

const getWeekLabels = (t: Translate) => [
  t('week.mon'),
  t('week.tue'),
  t('week.wed'),
  t('week.thu'),
  t('week.fri'),
  t('week.sat'),
  t('week.sun'),
];

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

const ChartSwipeHint = ({ label }: { label: string }) => (
  <Text style={styles.chartSwipeHint}>{label}</Text>
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
  const { isRtl, t } = useI18n();
  const { width } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const [chartRenderKey, setChartRenderKey] = useState(0);
  const [hasLoadedWaterData, setHasLoadedWaterData] = useState(false);
  const [isScreenReady, setIsScreenReady] = useState(false);
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    allTime: 0,
  });
  const [weeklyChart, setWeeklyChart] = useState({
    labels: getWeekLabels(t),
    values: Array(7).fill(0),
  });
  const [todayChart, setTodayChart] = useState({
    labels: getHourLabels(),
    values: Array(24).fill(0),
  });
  const [yearlyChart, setYearlyChart] = useState({
    labels: getMonthLabels(t),
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
    try {
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
        labels: getWeekLabels(t),
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
        labels: getMonthLabels(t),
        values: yearlyChartMonths.map((month) =>
          Number((sumMatchingDates(waterHistory, month) / 1000).toFixed(2))
        ),
      });
      setMonthlyChart(getCurrentMonthChartData(waterHistory));
      setAllTimeChart(getLatestYearChartData(waterHistory));
    } catch {
      setStats({
        today: 0,
        week: 0,
        month: 0,
        year: 0,
        allTime: 0,
      });
      setWeeklyChart({
        labels: getWeekLabels(t),
        values: Array(7).fill(0),
      });
      setTodayChart({
        labels: getHourLabels(),
        values: Array(24).fill(0),
      });
      setYearlyChart({
        labels: getMonthLabels(t),
        values: Array(12).fill(0),
      });
      setMonthlyChart({
        labels: getCurrentMonthDateKeys().map((date) =>
          String(Number(date.slice(8, 10)))
        ),
        values: Array(getCurrentMonthDateKeys().length).fill(0),
      });
      setAllTimeChart({
        labels: [],
        values: [],
      });
    } finally {
      setHasLoadedWaterData(true);
    }
  }, [t]);

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;

    if (nextWidth > 0) {
      setContainerWidth(nextWidth);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let animationFrame: ReturnType<typeof requestAnimationFrame> | undefined;
      const readyFallbackTimer = setTimeout(() => {
        if (isActive) {
          setHasLoadedWaterData(true);
          setIsScreenReady(true);
          setChartRenderKey((currentKey) => currentKey + 1);
        }
      }, 900);

      setHasLoadedWaterData(false);
      loadWaterData();
      setIsScreenReady(false);

      const interactionTask = InteractionManager.runAfterInteractions(() => {
        animationFrame = requestAnimationFrame(() => {
          if (isActive) {
            clearTimeout(readyFallbackTimer);
            setChartRenderKey((currentKey) => currentKey + 1);
            setIsScreenReady(true);
          }
        });
      });

      return () => {
        isActive = false;
        clearTimeout(readyFallbackTimer);
        interactionTask.cancel();

        if (animationFrame !== undefined) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [loadWaterData])
  );

  const literUnit = t('unit.liter');
  const chartYAxisSuffix = ` ${literUnit}`;
  const formatLiters = (amount: number) =>
    `${(amount / 1000).toFixed(2)} ${literUnit}`;
  const layoutWidth = containerWidth || width;
  const chartVisibleWidth = Math.max(layoutWidth - 48, 1);
  const canRenderCharts =
    hasLoadedWaterData && isScreenReady && chartVisibleWidth > 1;
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
  const statRowStyle = [
    styles.statRow,
    Platform.OS === 'android' && styles.androidOpaqueCard,
    isRtl && styles.rtlRow,
  ];
  const chartCardStyle = [
    styles.chartCard,
    Platform.OS === 'android' && styles.androidOpaqueCard,
  ];
  const statisticsContent = (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.title, isRtl && styles.rtlText]}>
        {t('statistics.title')}
      </Text>

      <View style={statRowStyle}>
        <Text style={[styles.statLabel, isRtl && styles.rtlText]}>
          {t('statistics.today')}
        </Text>
        <Text style={styles.statValue}>{formatLiters(stats.today)}</Text>
      </View>

      <View style={chartCardStyle}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.chartScrollContent}
          showsHorizontalScrollIndicator
        >
          <BarChart
            key={`today-${chartRenderKey}`}
            data={{
              labels: todayChart.labels,
              datasets: [{ data: todayChart.values }],
            }}
            width={hourlyChartWidth}
            height={190}
            yAxisLabel=""
            yAxisSuffix={chartYAxisSuffix}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={styles.chart}
          />
        </ScrollView>
        {isHourlyChartScrollable && (
          <ChartSwipeHint label={t('statistics.swipe')} />
        )}
      </View>

      <View style={statRowStyle}>
        <Text style={[styles.statLabel, isRtl && styles.rtlText]}>
          {t('statistics.thisWeek')}
        </Text>
        <Text style={styles.statValue}>{formatLiters(stats.week)}</Text>
      </View>

      <View style={chartCardStyle}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.chartScrollContent}
          showsHorizontalScrollIndicator
        >
          <BarChart
            key={`week-${chartRenderKey}`}
            data={{
              labels: weeklyChart.labels,
              datasets: [{ data: weeklyChart.values }],
            }}
            width={chartWidth}
            height={190}
            yAxisLabel=""
            yAxisSuffix={chartYAxisSuffix}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={styles.chart}
          />
        </ScrollView>
        {isWeeklyChartScrollable && (
          <ChartSwipeHint label={t('statistics.swipe')} />
        )}
      </View>

      <View style={statRowStyle}>
        <Text style={[styles.statLabel, isRtl && styles.rtlText]}>
          {t('statistics.thisMonth')}
        </Text>
        <Text style={styles.statValue}>{formatLiters(stats.month)}</Text>
      </View>

      <View style={chartCardStyle}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.chartScrollContent}
          showsHorizontalScrollIndicator
        >
          <BarChart
            key={`month-${chartRenderKey}`}
            data={{
              labels: monthlyChart.labels,
              datasets: [{ data: monthlyChart.values }],
            }}
            width={monthlyChartWidth}
            height={190}
            yAxisLabel=""
            yAxisSuffix={chartYAxisSuffix}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={styles.chart}
          />
        </ScrollView>
        {isMonthlyChartScrollable && (
          <ChartSwipeHint label={t('statistics.swipe')} />
        )}
      </View>

      <View style={statRowStyle}>
        <Text style={[styles.statLabel, isRtl && styles.rtlText]}>
          {t('statistics.thisYear')}
        </Text>
        <Text style={styles.statValue}>{formatLiters(stats.year)}</Text>
      </View>

      <View style={chartCardStyle}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.chartScrollContent}
          showsHorizontalScrollIndicator
        >
          <BarChart
            key={`year-${chartRenderKey}`}
            data={{
              labels: yearlyChart.labels,
              datasets: [{ data: yearlyChart.values }],
            }}
            width={yearlyChartWidth}
            height={190}
            yAxisLabel=""
            yAxisSuffix={chartYAxisSuffix}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={styles.chart}
          />
        </ScrollView>
        {isYearlyChartScrollable && (
          <ChartSwipeHint label={t('statistics.swipe')} />
        )}
      </View>

      <View style={statRowStyle}>
        <Text style={[styles.statLabel, isRtl && styles.rtlText]}>
          {t('statistics.allTime')}
        </Text>
        <Text style={styles.statValue}>{formatLiters(stats.allTime)}</Text>
      </View>

      {allTimeChart.labels.length > 0 && (
        <View style={chartCardStyle}>
          {isAllTimeChartScrollable ? (
            <ScrollView
              horizontal
              contentContainerStyle={styles.chartScrollContent}
              showsHorizontalScrollIndicator
            >
              <BarChart
                key={`all-time-scroll-${chartRenderKey}`}
                data={{
                  labels: allTimeChart.labels,
                  datasets: [{ data: allTimeChart.values }],
                }}
                width={allTimeChartWidth}
                height={190}
                yAxisLabel=""
                yAxisSuffix={chartYAxisSuffix}
                chartConfig={chartConfig}
                fromZero
                showValuesOnTopOfBars
                style={styles.chart}
              />
            </ScrollView>
          ) : (
            <BarChart
              key={`all-time-${chartRenderKey}`}
              data={{
                labels: allTimeChart.labels,
                datasets: [{ data: allTimeChart.values }],
              }}
              width={allTimeChartWidth}
              height={190}
              yAxisLabel=""
              yAxisSuffix={chartYAxisSuffix}
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          )}
        </View>
      )}
    </ScrollView>
  );

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} onLayout={handleContainerLayout}>
        {!canRenderCharts ? (
          <ScreenLoading />
        ) : Platform.OS === 'android' ? (
          statisticsContent
        ) : (
          <AnimatedScreenContent>
            {statisticsContent}
          </AnimatedScreenContent>
        )}
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
  androidOpaqueCard: {
    backgroundColor: '#FFFFFF',
    opacity: 1,
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
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

