import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'; // Thêm Alert
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fetchTransactions } from '../api/odooApi';
import { useNavigation } from '@react-navigation/native';

const OrderHistoryScreen = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const navigation = useNavigation();

    // Tách logic gọi API ra một hàm riêng để có thể tái sử dụng
    const loadTransactions = async () => {
        try {
            const response = await fetchTransactions();
            setOrders(response);
        } catch (error) {
            Alert.alert("Đã xảy ra lỗi", error.message);
        }
    };

    // useEffect chỉ dùng cho lần tải đầu tiên
    useEffect(() => {
        const initialLoad = async () => {
            await loadTransactions();
            setIsLoading(false);
        };
        initialLoad();
    }, []);

    // 2. Tạo hàm xử lý khi người dùng kéo để làm mới
    // Dùng useCallback để tối ưu hiệu suất, tránh việc tạo lại hàm mỗi lần render
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true); // Bắt đầu hiển thị icon loading

        await loadTransactions(); // Gọi lại hàm lấy dữ liệu

        setIsRefreshing(false); // Ẩn icon loading khi đã có dữ liệu mới
    }, []);

    const formatAndAdd7Hours = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString.replace(' ', 'T') + 'Z');
        date.setHours(date.getHours() + 7);
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    };

    const renderOrderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('DetailHistory', { transaction: item })}>
            <View style={styles.orderItem}>
                <Text style={styles.machineText}>Máy: {item.machine_id[1]}</Text>
                <Text style={styles.dateText}>Thời gian: {formatAndAdd7Hours(item.date)}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaProvider style={styles.container}>
            <Text style={styles.title}>Lịch Sử Thêm Hàng</Text>
            <FlatList
                data={orders}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id.toString()} // Đảm bảo key là string
                ListEmptyComponent={<Text style={styles.emptyText}>Chưa có lịch sử thêm hàng.</Text>}
                onRefresh={handleRefresh}
                refreshing={isRefreshing}
            />
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 30,
        marginBottom: 30,
        color: '#333',
    },
    orderItem: {
        padding: 15,
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    machineText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray',
    },
});

export default OrderHistoryScreen;