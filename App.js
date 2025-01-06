import React from 'react';
import { useEffect } from 'react';
import { StyleSheet,Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PushNotification from 'react-native-push-notification';

import Login from './Components/Login';
import Home from './Components/Home';


const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Configure push notifications
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('Notification:', notification);
        // You can handle the notification here
        // For example, showing an alert on notification
        Alert.alert('New Notification', notification.message);
      },
      popInitialNotification: true, // Pop the initial notification if app was opened via a notification
      requestPermissions: Platform.OS === 'ios',
    });

    // Check if the app was launched from a notification
    PushNotification.getInitialNotification()
      .then(notification => {
        if (notification) {
          console.log('Initial Notification:', notification);
          // Handle initial notification (e.g., navigate to a specific screen)
        }
      })
      .catch(err => console.error('Error getting initial notification:', err));

    // Request permissions on iOS if necessary
    PushNotification.requestPermissions()
      .then(response => {
        console.log('Permission response:', response);
      })
      .catch(err => {
        console.error('Permission request error:', err);
      });
  }, []);
  return (
    <NavigationContainer style={styles.container}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{headerShown:false}}/>
        <Stack.Screen name="Home" component={Home} options={{headerShown:false}}/>
      </Stack.Navigator>
    </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
