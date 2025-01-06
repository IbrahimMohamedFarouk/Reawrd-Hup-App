import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    Image,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native'; // 
import axiosInstance from './TokenMangement';
import TransactionsList from './Transactions';
import QRCodeModal from './GenerateQRCode'



export default function Home() {
    const [username, setUsername] = useState(''); 
    const [points, setPoints] = useState(); 
    const [offers, setOffers] = useState([]);
    const [transactions, setTransactions] = useState([]); 
    const [activeTab, setActiveTab] = useState('home');
    const [loading, setLoading] = useState(false); // Loading state
    const [showSettings, setShowSettings] = useState(false); // Toggle settings view
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState(null); // State for QR Code
    const [showQRCodeModal, setShowQRCodeModal] = useState(false); // State for QR code modal

    useEffect(() => {
        fetchUserData();
        fetchOffers();
        fetchTransactions();
    }, []);
    const navigation=useNavigation()
    const fetchUserData = async () => {
        setLoading(true);
        try {
            console.log('fetching user data');
            const data = await axiosInstance.get('/employee');
            setUsername(data.data[0].firstname);
            setPoints(data.data[0].points);
            console.log(data.data[0].firstname);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch user Data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const data = await axiosInstance.get('/api/offers');
            setOffers(data.data);
            console.log(data.data[0]);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch Offers.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await makeAuthenticatedRequest('https://api.example.com/transactions');
            setTransactions(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch transactions.');
        } finally {
            setLoading(false);
        }
    };
    const handleSaveSettings = async () => {
        try {
            const response = await axiosInstance.put('/employee/settings', {
                username: newUsername || username,
                password: newPassword,
            });
            if (response.status === 200) {
                Alert.alert('Success', 'Your settings have been updated.');
                setUsername(newUsername || username); // Update username locally
                setNewUsername('');
                setNewPassword('');
                setShowSettings(false);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update settings.');
        }
    };
    const handleSignOut = () => {
        // Show a confirmation dialog before signing out
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Sign Out', 
                onPress: async () => {
                    try {
                        const refreshToken = await AsyncStorage.getItem('refreshToken');
                        console.log('Signing out...');
                        const response = await axiosInstance.delete('/admin/logout', {
                            data: { token: refreshToken },
                        });

                        if (response.status === 200) {
                            await AsyncStorage.removeItem('accessToken');
                            await AsyncStorage.removeItem('refreshToken');
                        }
                        // Remove the access token and refresh token from AsyncStorage

    
                        // Navigate the user to the login screen
                        navigation.navigate('Login');
                        Alert.alert('Signed Out', 'You have been logged out successfully');
                    } catch (error) {
                        // Handle any errors that may occur during logout
                        Alert.alert('Error', 'Failed to log out.');
                    }
                } 
            },
        ]);
    };
    const handleGenerateQRCode = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/qrcode', { params: { username } }); // Assuming backend expects username
            if (response.status === 200 && response.data.qrCodeUrl) {
                setQrCodeUrl(response.data.qrCodeUrl);
                setShowQRCodeModal(true); // Show QR code modal
            } else {
                Alert.alert('Error', 'Failed to generate QR code.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate QR code.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleOfferSelect = (offer) => {
        if (points >= offer.pointsRequired) {
            // Proceed with submitting the offer redemption
            submitOffer(offer);
        } else {
            Alert.alert('Insufficient Points', 'You don\'t have enough points for this offer.');
        }
    };

    const submitOffer = async (offer) => {
        setLoading(true);
        try {
            const response = await fetch('https://api.example.com/redeemOffer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    offerId: offer.id,
                    pointsRequired: offer.pointsRequired,
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Update the points state to reflect the deduction
                setPoints(points - offer.pointsRequired);
                Alert.alert('Success', `You have successfully redeemed the offer: ${offer.title}`);
            } else {
                Alert.alert('Error', 'Failed to redeem the offer.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to redeem the offer.');
        } finally {
            setLoading(false);
        }
    };
    const BASE_URL = "http://192.168.1.4:3000";
    const renderOffer = ({ item }) => {
        const url = item.imageUrl;
        const imageUrl = `${BASE_URL}${url}`;
        return (
            <TouchableOpacity onPress={() => handleOfferSelect(item)} style={styles.offerCard}>
                <Image source={{ uri: `${imageUrl}` }} style={styles.offerImage} />
                <View style={styles.offerDetails}>
                    <Text style={styles.offerTitle}>{item.title}</Text>
                    <Text style={styles.offerDescription}>{item.description}</Text>
                    <Text style={styles.offerPoints}>Points Required: {item.pointsRequired}</Text>
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Image source={require('../assets/rewardhup-logo-resized.png')} style={styles.logo} />
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
                        <Icon name="settings" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSignOut}>
                        <Icon name="logout" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
                {showSettings ? (
                // Settings Section
                <View style={styles.settingsSection}>
                    <Text style={styles.settingsTitle}>Settings</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new username"
                            value={newUsername}
                            onChangeText={setNewUsername}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            ) : ( <>
                 {/* Main Section */}
            { loading ? (
                <ActivityIndicator size="large" color="#4caf50" style={styles.loader} />
            ) : (
                <>
                    {activeTab === 'home' && (
                        <>
                            <View style={styles.pointsSection}>
                                <Text style={styles.helloText}>Hello , {username}!</Text>  
                                <Text style={styles.pointsText}>Points: {points}</Text>
                            </View>
                            <View style={styles.offersSection}>
                                <Text style={styles.offersHeading}>Offers</Text>
                                <FlatList
                                    data={offers}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderOffer}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.qrButton}
                                onPress={handleGenerateQRCode}
                                >
                                <Text style={styles.qrButtonText}>Generate QR Code</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {activeTab === 'transactions' && (
                        <View style={styles.transactionsSection}>
                            <Text style={styles.transactionsHeading}>Transactions</Text>
                            <TransactionsList transactions={transactions} />
                        </View>
                    )}
                </>
            )}
            </>)}
            {/* Footer Navigation */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={() => setActiveTab('home')} style={styles.footerButton}>
                    <Icon name="home" size={24} color={activeTab === 'home' ? '#4caf50' : '#999'} />
                    <Text style={[styles.footerText, activeTab === 'home' && styles.activeText]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('transactions')} style={styles.footerButton}>
                    <Icon
                        name="receipt"
                        size={24}
                        color={activeTab === 'transactions' ? '#4caf50' : '#999'}
                    />
                    <Text style={[styles.footerText, activeTab === 'transactions' && styles.activeText]}>
                        Transactions
                    </Text>
                </TouchableOpacity>
            </View>
            <QRCodeModal visible={showQRCodeModal}  qrCodeUrl={qrCodeUrl} onClose={() => setShowQRCodeModal(false)}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        paddingTop: 50,
    },
    header: {
        backgroundColor: '#4caf50',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 40,
        resizeMode: 'contain',
    },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pointsSection: {
        padding: 20,
        backgroundColor: '#81c784',
        alignItems: 'center',
    },
    helloText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    pointsText: {
        fontSize: 18,
        color: '#fff',
    },
    offersSection: {
        flex: 1,
        padding: 20,
    },
    offersHeading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    offerCard: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        flexDirection: 'row',
    },
    offerImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 15,
    },
    offerDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    offerDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    offerPoints: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4caf50',
    },
    transactionsSection: {
        flex: 1,
        padding: 20,
    },
    transactionsHeading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    settingsSection: { padding: 20, backgroundColor: '#f8f8f8', flex: 1 },
    settingsTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    inputContainer: { marginBottom: 15 },
    inputLabel: { fontSize: 16, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5 },
    saveButton: { backgroundColor: '#4caf50', padding: 15, borderRadius: 5, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    footerButton: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
    },
    activeText: {
        color: '#4caf50',
        fontWeight: 'bold',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    qrButton: {
        backgroundColor: '#4caf50',
        padding: 15,
        borderRadius: 5,
        margin: 20,
        alignItems: 'center',
    },
    qrButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    qrCodeContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
    },
    qrCodeImage: {
        width: 200,
        height: 200,
        marginVertical: 20,
    },
    closeButton: {
        backgroundColor: '#4caf50',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
