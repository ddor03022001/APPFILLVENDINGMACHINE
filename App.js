import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import DetailMachine from './src/screens/DetailMachine';
import DetailHistory from './src/screens/DetailHistory';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = ({ setIsLoggedIn, machines }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home-outline';
        else if (route.name === 'OrderHistory') iconName = 'time-outline';
        else if (route.name === 'Cart') iconName = 'cart-outline';
        return <Ionicons name={iconName || 'alert-circle-outline'} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { paddingBottom: 5, height: 60 },
    })}
  >
    <Tab.Screen name="Home" options={{ headerShown: false }}>
      {() => <HomeScreen machines={machines} />}
    </Tab.Screen>
    <Tab.Screen name="History" options={{ headerShown: false }}>
      {() => <OrderHistoryScreen />}
    </Tab.Screen>
    <Tab.Screen name="Profile" options={{ headerShown: false }}>
      {() => <ProfileScreen setIsLoggedIn={setIsLoggedIn} />}
    </Tab.Screen>
  </Tab.Navigator>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [machines, setMachines] = useState([]);
  const [slotMachines, setSlotMachines] = useState([]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login">
            {() => <LoginScreen setIsLoggedIn={setIsLoggedIn} setMachines={setMachines} setSlotMachines={setSlotMachines} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main">
              {() => <TabNavigator setIsLoggedIn={setIsLoggedIn} machines={machines} />}
            </Stack.Screen>
            <Stack.Screen
              name="DetailMachine"
              options={{ headerShown: true, title: "Detail Machine" }}
            >
              {() => <DetailMachine slotMachines={slotMachines} />}
            </Stack.Screen>
            <Stack.Screen
              name="DetailHistory"
              component={DetailHistory}
              options={{ headerShown: true, title: "Detail History" }}
            ></Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}