import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const placeholderData = [
  [0, 0, 0, 1, 1, 2, 2, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 3, 3, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 4, 4, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 3, 3, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
];

const getColor = (value: number) => {
  const colors = ['#ffe5e5', '#ff9999', '#ff4d4d', '#e60000', '#990000'];
  return colors[Math.min(value, colors.length - 1)];
};

const Heatmap = () => {
  return (
    <View style={styles.container}>
      {placeholderData.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((val, j) => (
            <View
              key={j}
              style={[styles.cell, {backgroundColor: getColor(val)}]}
            />
          ))}
        </View>
      ))}
      <Text style={styles.caption}>Placeholder Heatmap</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 30,
    height: 30,
    margin: 2,
    borderRadius: 4,
  },
  caption: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default Heatmap;
