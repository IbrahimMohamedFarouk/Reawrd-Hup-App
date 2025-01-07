// WebViewScreen.js
import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';  // Updated import

const WebViewScreen = ({ route }) => {
  const { url } = route.params;  // Getting the URL passed from the previous screen

    return (
        <View style={{ flex: 1 }}>
        <WebView source={{ uri: url }} />
        </View>
    );
};

export default WebViewScreen;
