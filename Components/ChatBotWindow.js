// ChatWindow.js
import React, { useState, useRef,useEffect } from 'react';
import {
  Keyboard,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import axios from './TokenMangement';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatWindow = ({ onClose }) => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = [
    'How do I use this app?',
    'Show me the main features.',
    'I need help with navigation.',
  ];


  const flatListRef = useRef();

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem('chatMessages');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages)); // Load the saved messages into state
        }
      } catch (error) {
        console.log("Error loading messages:", error);
      }
    };

    loadMessages();
  }, []);

  // Save messages to AsyncStorage whenever the messages state changes
  useEffect(() => {
    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem('chatMessages', JSON.stringify(messages));
      } catch (error) {
        console.log("Error saving messages:", error);
      }
    };

    saveMessages();
  }, [messages]);
  
  const handleInputChange = (e) => {
    const value = e.nativeEvent.text;
    setUserInput(value);

    // Show suggestions if there's input
    if (value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100); // Add delay to allow click
  };

  const handleFocus = () => {
    if (userInput.trim()) {
      setShowSuggestions(true);
    }
  };

  const sendMessage = async (userInput) => {
    const messageText = typeof userInput === 'string' ? userInput : userInput?.nativeEvent?.text || input.trim();

    // If messageText is empty, return early
    if (!messageText) return;

    const userMessage = { sender: 'user', text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput(''); // Clear input field

    setShowSuggestions(false);

    Keyboard.dismiss();
    try {
      const response = await axios.post('/ai/chat', { input: messageText });
      const botResponse = { sender: 'bot', text: response.data.message || 'No response from bot.' };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      const errorMessage = {
        sender: 'bot',
        text: error.response?.data?.message || 'Sorry, something went wrong. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

  };
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setShowSuggestions(false);
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  // Hide suggestions when the user scrolls


  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.message,
        item.sender === 'user' ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={[item.sender === 'user' ? styles.messageText : styles.messageTextBot]}>{item.text}</Text>
    </View>
  );

  const renderSuggestion = (suggestion) => (
    <TouchableOpacity
      key={suggestion}
      onPress={() => {
        Keyboard.dismiss();
        sendMessage(suggestion);
        setShowSuggestions(false); // Hide suggestions when a suggestion is clicked
      }}
      style={styles.suggestionButton}
    >
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ChatBot</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✖</Text>
        </TouchableOpacity>
      </View>

      <FlatList
      ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
      />

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map(renderSuggestion)}
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: '89%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    zIndex:55
},
header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#16b91a',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
},
headerTitle: {
    color: '#fff',
    fontSize: 18,
},
closeButton: {
    color: '#fff',
    fontSize: 18,
},
messagesList: {
    flexGrow: 1,
    padding: 10,
},
message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
},
userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#16b91a',
},
botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    color: '#333'
},
messageText: {
    color: '#fff',
},
messageTextBot: {
    color: '#333',
},
suggestionsContainer: {
    flexDirection: 'col',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f8f8f8',
  },
  suggestionButton: {
    margin: 5,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  suggestionText: {
    color: '#000',
    fontSize: 14,
  },
inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
},
input: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
},
sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#16b91a',
    borderRadius: 5,
},
sendButtonText: {
    color: '#fff',
},
});

export default ChatWindow;