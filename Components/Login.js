import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, TextInput, Image, TouchableOpacity, Pressable, SafeAreaView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Import AsyncStorage
import axios from 'axios';
import axiosInstance from './TokenMangement';
import { useNavigation } from '@react-navigation/native';

export default function Login({ navigation }) {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state for the API request
    // console.log('Navigation Prop:', navigation);

    
    const handleBtn = async (e) => {
        
        e.preventDefault();
        if (!userName.trim() || !password.trim()) {
            Alert.alert('Error', 'Username or Password cannot be empty');
            return;
        }

        setLoading(true); // Start loading indicator

        try {
            console.log('Logging in...');
            if (userName) 
                console.log('Username:', userName);
            if (password)
                console.log('password:', password);

            const response = await axios.post('http://192.168.1.4:3000/admin/login', {
                username: userName,
                password: password,
                role: 'emp'
            });
            // console.log('Response', response);
            console.log('Navigating to Home:', navigation.navigate);

            console.log(response.data);
            const { accessToken, refreshToken } = response.data;
            console.log('Navigating to Home:', navigation.navigate);

            // Save tokens to AsyncStorage
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);

            Alert.alert('Success', 'Logged in successfully');
            navigation.navigate('Home');
            } catch (error) {
                console.log('Error details:', error.toJSON ? error.toJSON() : error);
                const errorMessage = error.response?.data?.error || error.message || 'An error occurred while logging in.';
                Alert.alert('Error', errorMessage);
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
                    value={userName}
                    onChangeText={setUserName} // Updates username state
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
