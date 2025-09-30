import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = (options) => {
    const [machine, setMachine] = useState('');
    const navigation = useNavigation();

    const handleConfirm = async () => {
        const machineFind = options.machines.find((p) => p.name === machine);
        if (machineFind) {
            await AsyncStorage.setItem("machine_id", JSON.stringify(machineFind));
            navigation.navigate("DetailMachine");
        }
        setMachine('');
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="Vui lòng nhập số máy"
                mode="outlined"
                value={machine}
                activeOutlineColor='#28a745'
                onChangeText={setMachine}
                keyboardType="email-address"
                style={styles.input}
            />

            <Button mode="contained" onPress={handleConfirm} style={styles.button}>
                Xác nhận
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        marginBottom: 15,
    },
    button: {
        width: '100%',
        paddingVertical: 8,
        backgroundColor: '#28a745',
    },
});

export default HomeScreen;
