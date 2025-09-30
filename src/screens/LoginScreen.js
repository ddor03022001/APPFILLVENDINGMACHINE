import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { loginOdoo, fetchMachines, fetchSlotMachines } from '../api/odooApi';

const LoginScreen = ({ setIsLoggedIn, setMachines, setSlotMachines }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureText, setSecureText] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await loginOdoo(email, password);
            const machines = await fetchMachines();
            setMachines(machines);
            const slotMachines = await fetchSlotMachines();
            setSlotMachines(slotMachines)
            setIsLoggedIn(true);
        } catch (error) {
            Alert.alert("Đăng nhập thất bại", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../images/logo.jpg')} style={styles.logo} />
            <TextInput
                label="Email"
                mode="outlined"
                value={email}
                activeOutlineColor='#28a745'
                onChangeText={setEmail}
                keyboardType="email-address"
                style={styles.input}
            />
            <TextInput
                label="Mật khẩu"
                mode="outlined"
                value={password}
                activeOutlineColor='#28a745'
                onChangeText={setPassword}
                secureTextEntry={secureText}
                right={
                    <TextInput.Icon
                        icon={secureText ? "eye-off" : "eye"}
                        onPress={() => setSecureText(!secureText)}
                    />
                }
                style={styles.input}
            />
            {/* Hiển thị ActivityIndicator khi loading là true */}
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            ) : (
                <Button mode="contained" onPress={handleLogin} style={styles.button}>
                    Đăng nhập
                </Button>
            )}
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
    logo: {
        width: 150,
        height: 120,
        marginBottom: 20,
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

export default LoginScreen;
