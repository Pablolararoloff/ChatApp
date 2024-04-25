import Start from './components/Start';
import Chat from './components/Chat';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LogBox, Alert } from 'react-native';
const Stack = createNativeStackNavigator();

import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeApp } from "firebase/app";
import { getFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
import { useNetInfo } from '@react-native-community/netinfo';
import { getStorage } from "firebase/storage";

LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);

const App = () => {
  const connectionStatus = useNetInfo();

  const firebaseConfig = {
    apiKey: "AIzaSyAZI-G2QjVwM4NMi-ojDZR0HA1NEe7oIiQ",
    authDomain: "chatapp-bed9b.firebaseapp.com",
    projectId: "chatapp-bed9b",
    storageBucket: "chatapp-bed9b.appspot.com",
    messagingSenderId: "872367595184",
    appId: "1:872367595184:web:70d3d64adef02ad73e6575"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection Lost!");
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);
  
  signInAnonymously(auth)
    .then(() => {
      console.log("User signed in anonymously");
    })
    .catch((error) => {
      console.error("Anonymous sign-in failed:", error);
    });

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen
          name="Chat"
        >
          {props => <Chat
            isConnected={connectionStatus.isConnected}
            db={db}
            storage={storage}
            {...props}
          />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;