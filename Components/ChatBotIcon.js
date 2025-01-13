// ChatbotIcon.js
import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';

const ChatbotIcon = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.iconContainer} onPress={onPress}>
      <Text style={styles.iconText}>💬</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    bottom: 75,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#16b91a',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
},
iconText: {
    color: '#fff',
    fontSize: 24,
},
});

export default ChatbotIcon;
