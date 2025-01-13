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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

import axiosInstance from './TokenMangement';
import Vector from 'react-native-vector-icons/MaterialIcons';
import QRCodeModal from './GenerateQRCode'
import Settings from './Setting';



export default function Home() {
    const [username, setUsername] = useState(''); 
    const [points, setPoints] = useState(); 
    const [offers, setOffers] = useState([] );
    const [transactions, setTransactions] = useState([]); 
const [activeTab, setActiveTab] = useState('home');
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state
    const [showSettings, setShowSettings] = useState(false); // Toggle settings view
    const [qrCodeUrl, setQrCodeUrl] = useState(null); // State for QR Code
    const [showQRCodeModal, setShowQRCodeModal] = useState(false); // State for QR code modal
    const [id, setId] = useState();

    useEffect(() => {
        if (activeTab === 'home'){
            fetchUserData();
            fetchOffers();
        }
            fetchMarkets();
    }, [activeTab]);

    const navigation=useNavigation()
    //setting showing
    const toggleSettings = () => {
        setShowSettings(prevState => !prevState);
        setActiveTab('home');
    };

    const fetchUserData = async () => {
        setLoading(true);
        try {
            console.log('fetching user data');
            const data = await axiosInstance.get('/employee');
            console.log(data.data[0]);
            setUsername(data.data[0].firstname);
            setId(data.data[0]._id);
            setPoints(data.data[0].points);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch user Data.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (id || activeTab === 'transactions') {
          fetchTransactions();
        }
      }, [id, activeTab]);
    const fetchMarkets = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/superadmin/thirdparties');
            setMarkets(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch markets.');
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
            const data = await axiosInstance.get(`/employee/transactions/${id}`);

            setTransactions(data.data);
            console.log(data.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch transactions.');
        } finally {
            setLoading(false);
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
            const response = await axiosInstance.post('/employee-app/generate-qr'); // Assuming backend expects username
            if (response.status === 200 && response.data.Qrcode) {
                setQrCodeUrl(response.data.Qrcode);
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
        if (points >= offer.points) {
            // Proceed with submitting the offer redemption
            submitOffer(offer);
        } else {
            Alert.alert('Insufficient Points', 'You don\'t have enough points for this offer.');
        }
    };

    const submitOffer = async (offer) => {
        setLoading(true);
        try {

            const response = await axiosInstance.post('/employee-app/generate-code', {
                offerId: offer._id,
            })
            console.log(response.data);
            const code = response.data.code || response.data.fcode;
            
            if (code) {
                // Update the points state to reflect the deduction
                Alert.alert('',`offer's code: ${code}`);
            } else {
                Alert.alert(response.data.message);
            }
        } catch (error) {
            console.log('Error:', error);
            Alert.alert('Error', error.response.data.message || 'Failed to redeem the offer.');
        } finally {
            setLoading(false);
        }
    };

    const renderTransaction = ({ item }) => {
        const transactionDate = new Date(item.date);
        const formattedDate = transactionDate.toLocaleDateString(); // Display only date (e.g., 2025-01-05)
        const formattedTime = transactionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Display only hours and minutes (e.g., 10:30 AM)
        const pointsStyle = item.type === 'added' ? styles.addedPoints : styles.deductedPoints;

        return (
        <View style={styles.transactionCard}>
            <Text style={styles.transactionText}>Date: {formattedDate}</Text>
            <Text style={styles.transactionText}>Time: {formattedTime}</Text>
            <Text style={styles.transactionText}>{item.thirdParty}</Text>
            <Text style={[styles.transactionPoints, pointsStyle]}>
                {item.type === 'added' ? `+${item.points}` : `${item.points}`} Point
            </Text>
            <Text style={styles.transactionText}>Type: {item.type}</Text>
            <Text style={styles.transactionText}>{item.description}</Text>
            
        </View>
    )};

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
                    <Text style={styles.offerPoints}>Points Required: {item.points}</Text>
                    <Text>Redeem points </Text>
                </View>
            </TouchableOpacity>
        );
    };
    // In your previous screen where you call navigation.navigate()
const renderMarket = ({ item }) => {
    const url = item.imageUrl;
    const imageUrl = `${BASE_URL}${url}`;
    console.log(item.imageUrl)
    return(
    <TouchableOpacity
        style={styles.card}
        onPress={() => {
            if (item.website) {
            navigation.navigate('WebViewScreen', { url: item.website });
            } else {
            Alert.alert('No Website', 'This market does not have a website.');
            }
        }}
        >
        <Image source={{uri:`${imageUrl}`}} style={styles.marketImage} />
        <View style={styles.cardContent}>
            <Text style={styles.title}>{item.username}</Text>
            <Text style={styles.industry}>Industry: {item.industryType}</Text>
            <Text style={styles.email}>Email: {item.email}</Text>
            <Text style={styles.phone}>Phone: {item.phonenumber}</Text>
            <Text style={styles.tt}>go to web site →</Text>
        </View>
    </TouchableOpacity>
    );
}

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Image source={require('../assets/rewardhup-logo-resized.png')} style={styles.logo} />
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={toggleSettings}>
                        <Vector name="settings" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSignOut}>
                        <Icon name="logout" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            {/* Main Section */}
            {showSettings? (<>
                    {/* Render Settings Component */}
                    <Settings isVisible={showSettings} onClose={toggleSettings} />
            </>):(<>
                { loading ? (
                <ActivityIndicator size="large" color="#4caf50" style={styles.loader} />
            ) : (
                <>
                    {activeTab === 'home' && (
                        <>
                            <View style={styles.pointsSection}>
                                <Text style={styles.helloText}>Hello, {username}</Text>  
                                <Text style={styles.pointsText}>Points: {points}</Text>
                            </View>
                             {/* Tabs */}
                            
                            <FlatList
                                data={offers}
                                keyExtractor={(item) => item.id}
                                renderItem={renderOffer}
                                contentContainerStyle={styles.list}
                            />
                            
                        </>
                    )}
                    {activeTab === 'markets' && (
                        <FlatList
                            data={markets}
                            keyExtractor={(item) => item.id}
                            renderItem={renderMarket}
                            contentContainerStyle={styles.list}
                        />
                    )}
                    {activeTab === 'transactions' && (
                        <View style={styles.transactionsSection}>
                            <Text style={styles.transactionsHeading}>Transactions</Text>
                            <FlatList
                                data={transactions}
                                keyExtractor={(item) => item._id}
                                renderItem={renderTransaction}
                                contentContainerStyle={styles.list}
                            />
                        </View>
                    )}
                </>
            )}
            </>)}
            
            {/* Footer Navigation */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={() => {setActiveTab('home'); setShowSettings(false);}} style={styles.footerButton}>
                    <Icon name="home" size={24} color={activeTab === 'home' ? '#4caf50' : '#999'} />
                    <Text style={[styles.footerText, activeTab === 'home' && styles.activeText]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {setActiveTab('transactions'); setShowSettings(false);}} style={styles.footerButton}>
                    <Icon name="receipt" size={24} color={activeTab === 'transactions' ? '#4caf50' : '#999'} />
                    <Text style={[styles.footerText, activeTab === 'transactions' && styles.activeText]}>
                        Transactions
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.footerButton}
                    onPress={handleGenerateQRCode}
                    >
                        <Icon name="qrcode" size={24} color={showQRCodeModal == true ? '#4caf50' : '#999'} />
                    <Text style={[styles.footerText]}>qrcode</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => 
                    {setActiveTab('markets');
                    setShowSettings(false);}} style={styles.footerButton}>
                    <Icon name="store" size={24} color={activeTab === 'markets' ? '#4caf50' : '#999'} />
                    <Text style={[styles.footerText, activeTab === 'markets' && styles.activeText]}>
                        Stores
                    </Text>
                </TouchableOpacity>
            </View>
            <QRCodeModal visible={showQRCodeModal}  Qrcode={qrCodeUrl} onClose={() => setShowQRCodeModal(false)}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        paddingTop: 50,
    },
    tt :{
        textAlign: 'right'
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
        display:'flex',
        flexDirection: 'row',
        alignItems:"center",
        justifyContent:"space-around",
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    helloText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4caf50',
    },
    pointsText: {
        fontSize: 18,
        color: '#4caf50',
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
    transactionCard: {
        backgroundColor: '#f9f9f9',
        display:'flex',
        alignItems:'center',
        justifyContent:"center",
        flexDirection:"column",
        gap:'10px',
        padding: 15,
        marginVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    transactionText: { fontSize: 16 },
    transactionPoints: { fontSize: 16, fontWeight: 'bold', color: '#4caf50' },
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
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#81c784',
        justifyContent: 'center',
    },
    tabButton: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#4caf50',
    },
    tabText: {
        fontSize: 16,
        color: '#fff',
    },
    activeTabText: {
        fontWeight: 'bold',
    },
    list: {
        padding: 10,
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    marketImage: {
        width: '100%',
        height: 150,
    },
    cardContent: {
        padding: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    points: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4caf50',
    },
    deductedPoints: {
        fontSize: 16, 
        fontWeight: 'bold',
        color: 'red',
    },
    industry: {
        fontSize: 14,
        color: '#666',
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
    phone: {
        fontSize: 14,
        color: '#666',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
