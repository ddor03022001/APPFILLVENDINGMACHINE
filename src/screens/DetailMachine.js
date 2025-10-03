import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createTransaction } from '../api/odooApi';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
    View,
    StyleSheet,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Button,
    Alert,
    ActivityIndicator,
    Image,
    ScrollView
} from 'react-native';

const SlotItem = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.slotItemTouchable}>
        <View style={styles.slotItemContainer}>
            <Text style={styles.slotNumber}>{item.id}</Text>
            <Text style={styles.productName}>{item.name} (max: {item.limit_quantity})</Text>
            <Text style={styles.quantity}>Nhập/Thực tế: {item.quantity}/{item.quantity_actual}</Text>
        </View>
    </TouchableOpacity>
);

const DetailMachine = (slotMachines) => {
    const [machineId, setMachineId] = useState('');
    const [mockSlots, setMockSlots] = useState([]);
    const [slots, setSlots] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [newQuantity, setNewQuantity] = useState('');
    const [newActualQuantity, setNewActualQuantity] = useState('');
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const getSetting = async () => {
            try {
                const storeMachine = JSON.parse(await AsyncStorage.getItem('machine_id'));
                if (storeMachine) {
                    setMachineId(storeMachine);
                    const filterSlots = slotMachines.slotMachines
                        .filter(item => item.machine_id[1] === storeMachine.name)
                        .sort((a, b) => a.slot - b.slot);
                    let newList = [];
                    for (let i = 0; i < filterSlots.length; i++) {
                        newList.push({
                            id: filterSlots[i].slot,
                            limit_quantity: filterSlots[i].limit_quantity,
                            product_id: filterSlots[i].product_id[0],
                            name: filterSlots[i].product_id[1],
                            quantity: 0,
                            quantity_actual: 0
                        })
                    }
                    setMockSlots(newList);
                    setSlots(newList);
                }
            } catch (error) {
                Alert.alert("Đã xảy ra lỗi", error.message);
            }
        };

        getSetting();
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh để thực hiện việc này!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImages(result.assets);
        }
    };

    const handleSlotPress = (slot) => {
        setSelectedSlot(slot);
        setNewQuantity(slot.quantity.toString());
        setNewActualQuantity(slot.quantity_actual.toString());
        setModalVisible(true);
    };

    const handleUpdateQuantity = () => {
        if (!selectedSlot) return;
        if (selectedSlot.limit_quantity < parseInt(newQuantity, 10) || selectedSlot.limit_quantity < parseInt(newActualQuantity, 10)) {
            Alert.alert("Thất bại", "Số lượng nhập vượt mức số lượng tối đa.");
            return;
        } else if (parseInt(newActualQuantity, 10) < parseInt(newQuantity, 10)) {
            Alert.alert("Thất bại", "Số lượng nhập vượt mức số lượng thực tế.");
            return;
        }
        const updatedSlots = slots.map(slot =>
            slot.id === selectedSlot.id ? {
                ...slot,
                quantity: parseInt(newQuantity, 10) || 0,
                quantity_actual: parseInt(newActualQuantity, 10) || 0
            } : slot
        );
        setSlots(updatedSlots);
        setModalVisible(false);
        setSelectedSlot(null);
    };

    const createTransactionOdoo = async () => {
        setLoading(true);
        try {
            await createTransaction(slots, images);
            navigation.goBack();
            Alert.alert("Thành công", "Đã lưu lại tất cả thay đổi số lượng.");
            setSlots(mockSlots);
            setImages([]);
        } catch (error) {
            Alert.alert("Lỗi tạo transaction: ", error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleConfirmAllChanges = () => {
        Alert.alert(
            "Xác nhận thay đổi",
            "Bạn có chắc chắn muốn lưu lại tất cả các thay đổi về số lượng không?",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Đồng ý", onPress: createTransactionOdoo }
            ]
        );
    };

    return (
        <SafeAreaProvider style={styles.container}>
            <Text style={styles.title}>{machineId.name}</Text>

            <FlatList
                data={slots}
                renderItem={({ item }) => (
                    <SlotItem
                        item={item}
                        onPress={() => handleSlotPress(item)}
                    />
                )}
                keyExtractor={item => item.id.toString()}
                style={styles.list}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            ) : (
                <View style={styles.confirmButtonContainer}>
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                            <Text style={styles.imagePickerButtonText}>Chọn ảnh bằng chứng</Text>
                        </TouchableOpacity>
                        {/* MỚI: Hiển thị danh sách ảnh đã chọn */}
                        {images.length > 0 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesPreviewScroll}>
                                {images.map((img, index) => (
                                    <Image key={index} source={{ uri: img.uri }} style={styles.previewImage} />
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmAllChanges}>
                        <Text style={styles.confirmButtonText}>Xác nhận tất cả thay đổi</Text>
                    </TouchableOpacity>
                </View>
            )}

            {selectedSlot && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Cập nhật số lượng</Text>
                            <Text style={styles.modalProductName}>{selectedSlot.name} (Slot: {selectedSlot.id})</Text>
                            <Text style={styles.label}>Số lượng nhập:</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={setNewQuantity}
                                value={newQuantity}
                                keyboardType="numeric"
                                autoFocus={true}
                            />
                            <Text style={styles.label}>Số lượng thực tế:</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={setNewActualQuantity}
                                value={newActualQuantity}
                                keyboardType="numeric"
                            />
                            <View style={styles.buttonContainer}>
                                <Button title="Hủy" onPress={() => setModalVisible(false)} color="#6c757d" />
                                <View style={{ width: 10 }} />
                                <Button title="Xác nhận" onPress={handleUpdateQuantity} />
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
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
    quantity: { fontSize: 16, fontWeight: 'bold', color: '#28a745', fontStyle: 'italic' },
    modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContainer: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    modalProductName: { fontSize: 16, fontStyle: 'italic', color: '#666', marginBottom: 15 },
    label: {
        alignSelf: 'flex-start',
        marginLeft: '10%',
        marginBottom: 5,
        color: '#333',
        fontWeight: '500',
    },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, width: '80%', paddingHorizontal: 10, marginBottom: 15, textAlign: 'center', fontSize: 18 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginTop: 10 },
    confirmButtonContainer: {
        padding: 15,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#f8f9fa',
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    imagePickerButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    imagePickerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    imagesPreviewScroll: {
        marginTop: 10,
        maxHeight: 120,
    },
    previewImage: {
        width: 100,
        height: 100,
        marginHorizontal: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    confirmButton: {
        backgroundColor: '#28a745',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loader: {
        padding: 20,
    }
});

export default DetailMachine;