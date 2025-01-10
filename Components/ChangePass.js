import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import axiosInstance from './TokenMangement';
import { useNavigation } from '@react-navigation/native';
const ChangePass = ({}) => {
    const navigate = useNavigation();
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const handlechangepass = async () => {
        try {
            const response = await axiosInstance.post('/employee-app/change-password', {
                password: password,
                confirmPassword: password2,
            });
            if (response.status === 200) {
                Alert.alert('Success', 'Your settings have been updated.');
                setPassword('');
                setPassword2('');
                navigate.navigate('Home');
                onClose();  // Close the settings section after saving
            }
        } catch (error) {
            if (error.response && error.response.data) {
              Alert.alert('Error', error.response.data.message || 'Failed to update password.');
            } else {
              Alert.alert('Error', 'Failed to update password.');
            }
          }
        };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Change Password</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={styles.input}
                    value={password2}
                    onChangeText={setPassword2}
                    secureTextEntry
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handlechangepass}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
    },
    inputContainer: {
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#4caf50',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#4caf50',
        fontSize: 16,
    },
});

export default ChangePass;