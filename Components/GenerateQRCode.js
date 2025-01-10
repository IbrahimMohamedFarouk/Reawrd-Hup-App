// QRCodeModal.js
import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const QRCodeModal = ({ visible, Qrcode, onClose }) => {
    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Your QR Code</Text>
                    {Qrcode ? (
                        <Image source={{ uri: Qrcode }} style={styles.qrCodeImage} />
                    ) : (
                        <Text>Loading QR Code...</Text>
                    )}
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    qrCodeImage: { width: 200, height: 200, marginBottom: 15 },
    closeButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    closeButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default QRCodeModal;
