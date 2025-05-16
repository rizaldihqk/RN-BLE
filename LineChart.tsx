// components/LineChartBLE.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, Dimensions, StyleSheet} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const placeholderRSSIData = [-70, -65, -68, -72, -66, -63, -67, -69];

const LineChartBLE = () => {
  const [rssiData, setRssiData] = useState<number[]>(placeholderRSSIData);

  useEffect(() => {
    const interval = setInterval(() => {
      const newRssi = -60 + Math.floor(Math.random() * 10) * -1; // Simulated RSSI
      setRssiData(prev => {
        const updated = [...prev.slice(-9), newRssi]; // Keep last 10
        return updated.filter(val => typeof val === 'number' && isFinite(val));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RSSI History</Text>
      <LineChart
        data={{
          labels: rssiData.map((_, idx) => `${idx + 1}s`),
          datasets: [{data: rssiData}],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix=" dBm"
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: () => '#888',
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
  },
  chart: {
    borderRadius: 8,
  },
});

export default LineChartBLE;
