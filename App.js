
import { StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WebViewScreen from './Components/WebViewScreen';  // import your WebViewScreen component
import React, { useEffect } from 'react';
import Login from './Components/Login';
import Home from './Components/Home';
import ChangePass from './Components/ChangePass';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer style={styles.container}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{headerShown:false}}/>
        <Stack.Screen name="Home" component={Home} options={{headerShown:false}}/>
        <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
        <Stack.Screen name="change-password" component={ChangePass} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
