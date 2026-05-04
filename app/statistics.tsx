import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const waterHistoryStorageKey = 'waterHistory';
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
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    allTime: 0,
  });

  const loadWaterData = useCallback(async () => {
    const savedWaterHistory = await AsyncStorage.getItem(
      waterHistoryStorageKey
    );
    const savedAllTimeWaterAmount = await AsyncStorage.getItem(
      allTimeWaterAmountStorageKey
    );
    const waterHistory: Record<string, number> =
      savedWaterHistory !== null ? JSON.parse(savedWaterHistory) : {};
    const today = getDateKey(new Date());
    const weekDates = getCurrentWeekDateKeys();
    const currentMonth = today.slice(0, 7);
    const currentYear = today.slice(0, 4);
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Statistics</Text>

      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Today</Text>
        <Text style={styles.statValue}>{formatLiters(stats.today)}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>This week</Text>
        <Text style={styles.statValue}>{formatLiters(stats.week)}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>This month</Text>
        <Text style={styles.statValue}>{formatLiters(stats.month)}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>This year</Text>
        <Text style={styles.statValue}>{formatLiters(stats.year)}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>All time</Text>
        <Text style={styles.statValue}>{formatLiters(stats.allTime)}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F7FF',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
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
