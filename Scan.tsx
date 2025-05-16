import React, {useEffect, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  Text,
  View,
  Button,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import {
  BleManager,
  Device,
  Service,
  Characteristic,
} from 'react-native-ble-plx';
import {Buffer} from 'buffer';

const manager = new BleManager();

export default function Scan() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [selectedServiceUUID, setSelectedServiceUUID] = useState('');
  const [selectedCharacteristicUUID, setSelectedCharacteristicUUID] =
    useState('');
  const [input, setInput] = useState('');
  const [received, setReceived] = useState('');
  const [isLoadingScan, setIsLoadingScan] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      const allGranted = Object.values(granted).every(
        result => result === PermissionsAndroid.RESULTS.GRANTED,
      );
      if (!allGranted) console.warn('Not all permissions granted');
    }
  };

  useEffect(() => {
    requestPermissions();
    return () => {
      manager.destroy();
    };
  }, []);

  const scanDevices = () => {
    setIsLoadingScan(true);
    const seenDeviceIds = new Set<string>();
    setDevices([]);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn('Scan error:', error.message);
        return;
      }
      if (device && !seenDeviceIds.has(device.id)) {
        seenDeviceIds.add(device.id);
        setDevices(prev => [...prev, device]);
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      console.log('Scan stopped');
      setIsLoadingScan(false);
    }, 5000);
  };

  const connectAndDiscover = async (device: Device) => {
    try {
      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);

      const services = await connected.services();
      setServices(services);

      let allCharacteristics: Characteristic[] = [];
      let writeChar: Characteristic | null = null;
      let arrNotif = [];

      for (const service of services) {
        const chars = await service.characteristics();
        allCharacteristics = allCharacteristics.concat(chars);

        const writable = chars.find(c => c.isWritableWithResponse);
        if (writable && !writeChar) {
          writeChar = writable;
        }

        const notifiable = chars.find(c => c.isNotifiable || c.isNotifying);
        // filter serviceUUID because causes error
        if (
          notifiable &&
          notifiable.serviceUUID !== 'e49a25f8-f69a-11e8-8eb2-f2801f1b9fd1'
        ) {
          arrNotif.push(notifiable);
        }
      }

      setCharacteristics(allCharacteristics);

      if (writeChar) {
        setSelectedServiceUUID(writeChar.serviceUUID);
        setSelectedCharacteristicUUID(writeChar.uuid);
      }

      if (arrNotif.length > 0) {
        console.log(arrNotif, 'arrNotif');

        arrNotif.forEach(e => {
          connected.monitorCharacteristicForService(
            e.serviceUUID,
            e.uuid,
            (error, characteristic) => {
              if (error) {
                console.warn('Monitor error:', error.message);
                return;
              }
              if (characteristic?.value) {
                setReceived(characteristic.value);
              }
            },
          );
        });
      }

      console.log('Connected to:', connected.name);
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const sendData = async () => {
    if (!connectedDevice) {
      console.warn('No device connected');
      return;
    }
    if (!selectedServiceUUID || !selectedCharacteristicUUID) {
      console.warn('UUIDs not selected');
      return;
    }

    const base64Data = Buffer.from(input).toString('base64');

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        selectedServiceUUID,
        selectedCharacteristicUUID,
        base64Data,
      );
      console.log('Sent:', input);
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const disconnect = async () => {
    try {
      if (connectedDevice) {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setServices([]);
        setCharacteristics([]);
        setSelectedServiceUUID('');
        setSelectedCharacteristicUUID('');
      }
    } catch (e) {
      console.log(e, 'error disconnect');
    }
  };

  const renderItem = ({item}: {item: Device}) => {
    if (!item.name) return null;
    return (
      <View style={styles.deviceCard}>
        <Text>{item.name}</Text>
        <Text style={{fontSize: 12, color: 'grey'}}>{item.id}</Text>
        <Button title="Connect" onPress={() => connectAndDiscover(item)} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Scan for Devices" onPress={scanDevices} />
      <FlatList
        keyboardDismissMode="none"
        data={devices}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        renderItem={renderItem}
        ListFooterComponent={
          connectedDevice ? (
            <View style={{marginTop: 20, flex: 1}}>
              <Text style={styles.connected}>
                Connected to: {connectedDevice.name}
              </Text>

              <Text style={{fontWeight: 'bold'}}>Services:</Text>
              {services.map(s => (
                <Text key={s.uuid} style={styles.uuidText}>
                  {s.uuid}
                </Text>
              ))}

              <Text style={{fontWeight: 'bold', marginTop: 10}}>
                Characteristics:
              </Text>
              {characteristics.map(c => (
                <Text key={c.uuid} style={styles.uuidText}>
                  {c.uuid}{' '}
                  {c.isWritableWithResponse || c.isWritableWithoutResponse
                    ? '(Writable)'
                    : ''}
                </Text>
              ))}
              <TextInput
                style={styles.input}
                placeholder="Enter string to send"
                value={input}
                onChangeText={setInput}
              />
              <Button title="Send Data" onPress={sendData} />
              <Button title="Disconnect" onPress={disconnect} color="red" />
              <Text style={{marginTop: 12}}>Received: {received}</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, backgroundColor: 'white'},
  deviceCard: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  connected: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 16,
  },
  uuidText: {
    fontSize: 12,
    color: 'grey',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    marginVertical: 8,
    padding: 8,
    borderRadius: 6,
  },
});
