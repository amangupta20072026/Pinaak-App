import React from 'react';
import { StatusBar, StyleSheet, Text } from 'react-native';
import { ENV } from './src/config/env';

function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Hello Pinaak 👋</Text>

      <Text>{ENV.appName}</Text>
      <Text>{ENV.apiUrl}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
});

export default App;
