import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, TextInput, Image, TouchableOpacity, Pressable, SafeAreaView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Import AsyncStorage

export default function Login({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state for the API request

    const handleBtn = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Error', 'Username or Password cannot be empty');
            return;
        }

        setLoading(true); // Start loading indicator

        try {
            const response = await fetch('https://api.example.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save tokens to AsyncStorage
                await AsyncStorage.setItem('accessToken', data.accessToken);
                await AsyncStorage.setItem('refreshToken', data.refreshToken);

                Alert.alert('Success', 'Logged in successfully');
                navigation.navigate('Home');
            } else {
                Alert.alert('Error', data.message || 'Login failed');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while logging in.');
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible); // Toggle password visibility
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image
                source={require('../assets/rewardhup-high-resolution-logo-transparent.png')}
                style={styles.image}
            />
            <View>
                <TextInput
                    style={styles.input}
                    placeholder="User Name"
                    value={username}
                    onChangeText={setUsername} // Updates username state
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry={!passwordVisible} // Toggle password visibility
                        value={password}
                        onChangeText={setPassword} // Updates password state
                    />
                    <Pressable onPress={togglePasswordVisibility} style={styles.icon}>
                        <Icon name={passwordVisible ? 'visibility' : 'visibility-off'} size={24} color="gray" />
                    </Pressable>
                </View>

                <TouchableOpacity onPress={handleBtn} disabled={loading}>
                    <Text style={styles.button}>
                        {loading ? <ActivityIndicator size="small" color="#fff" /> : 'Login'}
                    </Text>
                </TouchableOpacity>

                <StatusBar style="auto" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16b91a',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 80,
    },
    heading: {
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 20,
    },
    para: {
        fontSize: 18,
        color: 'red',
        margin: 10,
    },
    button: {
        backgroundColor: '#81c784',
        color: '#fff',
        padding: 10,
        borderRadius: 10,
        textAlign: 'center',
        marginTop: 10,
    },
    input: {
        backgroundColor: '#fff',
        width: 250,
        fontSize: 14,
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    image: {
        width: 350,
        height: 105,
    },
    passwordContainer: {
        position: 'relative', // To position the icon inside the input
    },
    icon: {
        position: 'absolute', // Position the icon inside the password input field
        right: 10,
        top: 15,
    },
});
