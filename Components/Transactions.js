// TransactionsList.js
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

const TransactionsList = ({ transactions }) => {
    const renderTransaction = ({ item }) => (
        <View style={styles.transactionCard}>
            <Text style={styles.transactionText}>{item.description}</Text>
            <Text style={styles.transactionPoints}>
                {item.points > 0 ? `+${item.points}` : `${item.points}`} Points
            </Text>
        </View>
    );

    return (
        <FlatList 
            data={transactions} 
            keyExtractor={(item) => item.id.toString()} 
            renderItem={renderTransaction} 
        />
    );
};

const styles = StyleSheet.create({
    transactionCard: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        marginVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    transactionText: { fontSize: 16 },
    transactionPoints: { fontSize: 16, fontWeight: 'bold', color: '#4caf50' },
});

export default TransactionsList;
