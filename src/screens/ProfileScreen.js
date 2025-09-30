import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { logoutOdoo } from '../api/odooApi';

// MỚI: Component giờ nhận thêm `username` và `companyName`
const ProfileScreen = ({ setIsLoggedIn }) => {
    const [userName, setUserName] = useState('null');
    const [companyName, setCompanyName] = useState('null');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getSetting = async () => {
            try {
                const storeUserName = await AsyncStorage.getItem('user_name');
                const storeCompanyName = await AsyncStorage.getItem('company_name');
                if (storeUserName !== null) {
                    setUserName(storeUserName);
                }
                if (storeCompanyName !== null) {
                    setCompanyName(storeCompanyName);
                }
            } catch (error) {
                Alert.alert("Đã xảy ra lỗi", error.message);
            }
        };

        getSetting();
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logoutOdoo();
            setIsLoggedIn(false);
        } catch (error) {
            Alert.alert("Lỗi kết nối odoo", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaProvider style={styles.container}>
            <View>
                <Text style={styles.title}>Thông tin người dùng</Text>

                {/* MỚI: Khu vực hiển thị thông tin chi tiết */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tên người dùng: </Text>
                        <Text style={styles.infoValue}>{userName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Công ty:</Text>
                        <Text style={styles.infoValue}>{companyName}</Text>
                    </View>
                </View>

            </View>

            {/* Hiển thị ActivityIndicator khi loading là true */}
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            ) : (
                <View style={styles.confirmButtonContainer}>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleLogout}>
                        <Text style={styles.confirmButtonText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaProvider>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 30,
        marginBottom: 30, // Tăng khoảng cách
    },
    // MỚI: Styles cho khu vực thông tin
    infoContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    confirmButtonContainer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#f8f9fa',
    },
    confirmButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});