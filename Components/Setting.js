import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import axiosInstance from './TokenMangement';

const Settings = ({ isVisible, onClose }) => {
    const [username, setUsername] = useState('ab');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [department, setDepartment] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (isVisible) {
            fetchUserData();
        }
    }, [isVisible]);

    const fetchUserData = async () => {
        try {
            const data = await axiosInstance.get('/employee');
            setUsername(data.data[0].username);
            setFirstName(data.data[0].firstname);
            setLastName(data.data[0].lastname);
            setDepartment(data.data[0].department);
            setPhoneNumber(data.data[0].phoneNumber);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch user data.');
        }
    };

    const handleSaveSettings = async () => {
        try {
            const response = await axiosInstance.put('/employee/settings', {
                username,
                firstName,
                lastName,
                department,
                phoneNumber,
                oldPassword,
                newPassword,
            });
            if (response.status === 200) {
                Alert.alert('Success', 'Your settings have been updated.');
                setOldPassword('');
                setNewPassword('');
                onClose();  // Close the settings section after saving
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update settings.');
        }
    };

    return isVisible ? (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Department</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Department"
                    value={department}
                    onChangeText={setDepartment}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Old Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Old Password"
                    secureTextEntry
                    value={oldPassword}
                    onChangeText={setOldPassword}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSaveSettings}>
                <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
        </ScrollView>
    ) : null;
};

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

export default Settings;
