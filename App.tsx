import React from 'react';
import {Button, SafeAreaView, Text, View} from 'react-native';
import Heatmap from './Heatmap';
import Scan from './Scan';
import LineChartBLE from './LineChart';

export default function App() {
  const [currScreen, setCurrScreen] = React.useState('scan');
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{alignItems: 'center', marginTop: 40}}>
        <Text style={{fontSize: 16}}>Select a feature</Text>
        <View
          style={{
            paddingHorizontal: 20,
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Button title="Scan" onPress={() => setCurrScreen('scan')} />
          <Text style={{fontSize: 14}}>Or</Text>
          <Button title="Heatmap" onPress={() => setCurrScreen('heat')} />
        </View>

        <View style={{marginTop: 40}}>
          {currScreen === 'scan' ? (
            <Scan />
          ) : (
            <View>
              <LineChartBLE />
              <Heatmap />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
