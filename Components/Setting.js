import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import axiosInstance from './TokenMangement';

const Settings = ({ isVisible, onClose }) => {
  const [username, setUsername] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');

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
      setEmail(data.data[0].email);
      setPhonenumber(String(data.data[0].phonenumber));
      setId(data.data[0]._id);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      console.log('Saving settings...');
      console.log(id);

      const response = await axiosInstance.put(`/employee/update/${id}`, {
        username,
        firstname,
        lastname,
        department,
        phonenumber,
        email,
        oldPassword,
        password,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Your settings have been updated.');
        setOldPassword('');
        setNewPassword('');
        onClose();
      } else if (response.status === 400) {
        console.log('Error:', error.response.data.errors.phonenumber);

        Alert.alert('Error:', error.response.data.errors.phonenumber);
        
      }
    } catch (error) {
      console.log('Error:', error.response.data.errors.phonenumber);

    //   if (error.response && error.response.data) {
        Alert.alert('Error:', error.response.data.errors.phonenumber);
    //   } else {
    //     Alert.alert('Error', 'Failed to update settings.');
    //   }
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
          value={firstname}
          onChangeText={setFirstName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastname}
          onChangeText={setLastName}
        />
      </View>
      <View style={styles.inputContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
      </View>
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
          value={phonenumber}
          onChangeText={setPhonenumber}
          keyboardType="phone-pad"
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
          value={password}
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

  // Your styles here



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
