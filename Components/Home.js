import React, { useState, useEffect } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { makeAuthenticatedRequest } from './TokenMangement';
import { useNavigation } from '@react-navigation/native'; // 

export default function Home() {
    const [username, setUsername] = useState('Ibrahim'); 
    const [points, setPoints] = useState(100); 
    const [offers, setOffers] = useState([
        {
            id: 1,
            title: "Discount on Electronics",
            description: "Get up to 20% off on electronics.",
            image: "../assets/yellow-paper-note-with-text-special-offer-D38FDP.jpg",
            pointsRequired: 200,
        },
        {
            id: 2,
            title: "Free Coffee",
            description: "Redeem a free coffee at your favorite café.",
            image: "../assets/yellow-paper-note-with-text-special-offer-D38FDP.jpg",
            pointsRequired: 50,
        },
        {
            id: 3,
            title: "Movie Tickets",
            description: "Enjoy a movie night with 2 tickets.",
            image: "https://via.placeholder.com/150",
            pointsRequired: 150,
        },
    ]);
    const [transactions, setTransactions] = useState([
        {
            id: 1,
            description: "Redeemed 1 free coffee",
            points: -50, // Negative because points are deducted
        },
        {
            id: 2,
            description: "Earned points from purchase",
            points: 100, // Positive because points are earned
        },
        {
            id: 3,
            description: "Redeemed 2 movie tickets",
            points: -150, // Negative because points are redeemed
        },
        {
            id: 4,
            description: "Earned points from referral",
            points: 200, // Positive because points are earned
        },
    ]); 
    const [activeTab, setActiveTab] = useState('home');
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        fetchUserData();
        fetchOffers();
        fetchTransactions();
    }, []);
    const navigation=useNavigation()
    const fetchUserData = async () => {
        setLoading(true);
        try {
            const data = await makeAuthenticatedRequest('https://api.example.com/transactions');
            setUsername(data.username);
            setPoints(data.points)
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch user Data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const data = await makeAuthenticatedRequest('https://api.example.com/transactions');
            setOffers(data);
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
    const handleSignOut = () => {
        // Show a confirmation dialog before signing out
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Sign Out', 
                onPress: async () => {
                    try {
                        // Remove the access token and refresh token from AsyncStorage
                        await AsyncStorage.removeItem('accessToken');
                        await AsyncStorage.removeItem('refreshToken');
    
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

    const renderOffer = ({ item }) => (
        <TouchableOpacity onPress={() => handleOfferSelect(item)} style={styles.offerCard}>
            <Image source={{ uri: item.image }} style={styles.offerImage} />
            <View style={styles.offerDetails}>
                <Text style={styles.offerTitle}>{item.title}</Text>
                <Text style={styles.offerDescription}>{item.description}</Text>
                <Text style={styles.offerPoints}>Points Required: {item.pointsRequired}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderTransaction = ({ item }) => (
        <View style={styles.transactionCard}>
            <Text style={styles.transactionText}>{item.description}</Text>
            <Text style={styles.transactionPoints}>
                {item.points > 0 ? `+${item.points}` : `${item.points}`} Points
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Image source={require('../assets/rewardhup-logo-resized.png')} style={styles.logo} />
                <TouchableOpacity onPress={handleSignOut}>
                    <Icon name="logout" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Main Section */}
            {loading ? (
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
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={renderOffer}
                                />
                            </View>
                        </>
                    )}

                    {activeTab === 'transactions' && (
                        <View style={styles.transactionsSection}>
                            <Text style={styles.transactionsHeading}>Transactions</Text>
                            <FlatList
                                data={transactions}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderTransaction}
                            />
                        </View>
                    )}
                </>
            )}

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
    transactionCard: {
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
        justifyContent: 'space-between',
    },
    transactionText: {
        fontSize: 16,
    },
    transactionPoints: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4caf50',
    },
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
});
