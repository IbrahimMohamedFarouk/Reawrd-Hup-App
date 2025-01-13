    // ChatWindow.js
    import React, { useState } from 'react';
    import axios from './TokenMangement.js';
    
    import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    } from 'react-native';

    const ChatWindow = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const suggestions = [
        'How do I use this app?',
        'Show me the main features.',
        'I need help with navigation.',
    ];
    const sendMessage = async (userInput) => {
            const messageText = userInput || input.trim();
            if (messageText === '') return;
        
            // Add the user's message to the chat
            const userMessage = { sender: 'user', text: messageText };
            setMessages((prev) => [...prev, userMessage]);
            setInput('');
        
            try {
            // Post the message to your API
            // const response = await axios.post('http://localhost:3000/ai/chat', {
            //     headers: {
            //     'Content-Type': 'application/json',
            //     },
            //     input: messageText,
            // });
        
            if (!response.ok) {
                throw new Error('Failed to fetch bot response');
            }
        
            const data = await response.message.json();
        
            // Assuming the API response contains a `reply` field with the bot's message
            const botResponse = { sender: 'bot', text: data.reply || 'No response from bot.' };
            setMessages((prev) => [...prev, botResponse]);
            } catch (error) {
            // Handle errors (e.g., network issues, server errors)
            const errorMessage = { sender: 'bot', text: 'Sorry, something went wrong. Please try again later.' };
            setMessages((prev) => [...prev, errorMessage]);
            }
        };
        

    const renderMessage = ({ item }) => (
        <View
        style={[
            styles.message,
            item.sender === 'user' ? styles.userMessage : styles.botMessage,
        ]}
        >
        <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );
    const renderSuggestion = (suggestion) => (
        <>
        <TouchableOpacity
        key={suggestion}
        onPress={() => sendMessage(suggestion)}
        style={styles.suggestionButton}
        >
        <Text style={styles.suggestionText}>{suggestion}</Text>
        </TouchableOpacity>
        </>
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
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.messagesList}
            />

            <View style={styles.suggestionsContainer}>
                {suggestions.map(renderSuggestion)}
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                value={input}
                onChangeText={setInput}
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
        backgroundColor: '#f1f1f1',
    },
    messageText: {
        color: '#fff',
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

    export default ChatWindow;
