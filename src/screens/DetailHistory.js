import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { fetchTransactionDetails } from '../api/odooApi';
import {
    View,
    StyleSheet,
    Text,
    FlatList,
    Alert
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const SlotItem = ({ item }) => (
    <View style={styles.slotItemContainer}>
        <Text style={styles.slotNumber}>{item.slot}</Text>
        <Text style={styles.productName}>{item.product_id[1]}</Text>
        <Text style={styles.quantity}>Nhập/Thực tế: {item.quantity}/{item.quantity_actual}</Text>
    </View>
);

const DetailHistory = () => {
    const route = useRoute();
    const { transaction } = route.params;
    const [slots, setSlots] = useState([]);

    useEffect(() => {
        const getSetting = async () => {
            try {
                const response = await fetchTransactionDetails(transaction.id);
                setSlots(response)
            } catch (error) {
                Alert.alert("Đã xảy ra lỗi", error.message);
            }
        };

        getSetting();
    }, []);

    return (
        <SafeAreaProvider style={styles.container}>
            <Text style={styles.title}>{transaction.machine_id[1]}</Text>

            <FlatList
                data={slots}
                renderItem={({ item }) => (
                    <SlotItem
                        item={item}
                    />
                )}
                keyExtractor={item => item.id}
                style={styles.list}
            />
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
        color: '#1c1e21',
    },
    list: {
        flex: 1,
    },
    slotItemTouchable: {
        marginVertical: 5,
        marginHorizontal: 10,
    },
    slotItemContainer: {
        backgroundColor: '#ffffff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    slotNumber: { fontSize: 16, fontWeight: 'bold', color: '#007bff', marginRight: 15, minWidth: 30 },
    productName: { fontSize: 16, color: '#333', flex: 1 },
    quantity: { fontSize: 16, fontWeight: 'bold', color: '#28a745' },
});

export default DetailHistory;