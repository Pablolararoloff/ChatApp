// Core imports
import Start from './components/Start';
import Chat from './components/Chat';
import { getAuth, signInAnonymously } from "firebase/auth";

// Navigation imports
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Firebase initialization and networking
import { initializeApp } from "firebase/app";
import { getFirestore, disableNetwork, enableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Utilities
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { Alert, LogBox } from "react-native";

// Create the navigator
const Stack = createNativeStackNavigator();

// Ignore specific warnings in the app
LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);

// Main App component
const App = () => {
  const connectionStatus = useNetInfo();

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAZI-G2QjVwM4NMi-ojDZR0HA1NEe7oIiQ",
    authDomain: "chatapp-bed9b.firebaseapp.com",
    projectId: "chatapp-bed9b",
    storageBucket: "chatapp-bed9b.appspot.com",
    messagingSenderId: "872367595184",
    appId: "1:872367595184:web:70d3d64adef02ad73e6575"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth(app);

  // Effect for managing network status with Firestore
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection Lost!");
      disableNetwork(db); // Disable Firestore network access when offline
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db); // Re-enable Firestore network access when online
    }
  }, [connectionStatus.isConnected]);

  // Sign in user anonymously
  signInAnonymously(auth)
    .then(() => {
      console.log("User signed in anonymously");
    })
    .catch((error) => {
      console.error("Anonymous sign-in failed:", error);
    });

    // Main render method
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