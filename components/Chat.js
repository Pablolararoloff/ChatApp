import { useState, useEffect } from "react";
import { StyleSheet, View, Platform, KeyboardAvoidingView, TouchableOpacity, Text } from 'react-native';
import { GiftedChat, Bubble, Avatar, InputToolbar } from "react-native-gifted-chat";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';
import { Audio } from "expo-av";


// Main Chat component that handles the messaging functionality
const Chat = ({ db, route, navigation, isConnected, storage }) => {
  const { userID, backgroundColor, name } = route.params;
  const [messages, setMessages] = useState([]);
  let soundObject = null;

  let unsubMessages;

  // Handles fetching and updating messages when online status changes
  useEffect(() => {
    navigation.setOptions({ title: name });
    if (isConnected === true) {
      if (unsubMessages) unsubMessages();
      unsubMessages = null;
      const q = query(collection(db, "messages"),
        orderBy("createdAt", "desc"));
      unsubMessages = onSnapshot(q, (docs) => {
        let newMessages = [];
        docs.forEach(doc => {
          newMessages.push({
            id: doc.id,
            ...doc.data(),
            createdAt: new Date(doc.data().createdAt.toMillis())
          })
        })
        cacheMessages(newMessages);
        setMessages(newMessages);
      })
    } else loadCachedMessages();
    return () => {
      if (unsubMessages) unsubMessages();
      if (soundObject) soundObject.unloadAsync();
    }
  }, [isConnected]);

  // Load messages from local storage when offline
  const loadCachedMessages = async () => {
    const cachedMessages = await AsyncStorage.getItem("messages") || [];
    setMessages(JSON.parse(cachedMessages));
  }
  // Cache messages to local storage
  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(messagesToCache));
    } catch (error) {
      console.log(error.message);
    }
  }
  // Function to handle sending messages
  const onSend = (newMessages) => {
    addDoc(collection(db, "messages"), newMessages[0])
  }
  // Conditional rendering of the input toolbar based on connectivity
  const renderInputToolbar = (props) => {
    if (isConnected === true) return <InputToolbar {...props} />;
    else return null;
  }
  // Render user avatars
  const renderAvatar = (props) => {
    if (props.currentMessage.user._id === userID) {
      return null;
    }

    return (
      <Avatar
        {...props}
        containerStyle={{
          left: {}
        }}
        imageStyle={{
          left: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#e0e0e0',
          }
        }}
      />
    );
  };
  // Customize the look of the chat bubbles
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#3394c2',
          },
          left: {
            backgroundColor: '#e0e0e0',
          }
        }}
        textStyle={{
          right: {
            color: '#fff'
          },
          left: {
            color: '#000'
          }
        }}
      />
    );
  };

  // Custom actions for attachments and more
  const renderCustomActions = (props) => {
    return <CustomActions onSend={onSend} storage={storage} {...props} userID={userID} />;
  };
  // Render custom views for messages, like location
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        renderInputToolbar={renderInputToolbar}
        renderBubble={renderBubble}
        renderAvatar={renderAvatar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
        renderMessageAudio={renderAudioBubble}
        user={{
          _id: userID,
          name
        }}
      />
      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
    </View>
  )
}

const renderAudioBubble = (props) => {
  if (props.currentMessage.audio) {
    return (
      <View style={styles.audioBubble}>
        <TouchableOpacity onPress={() => playSound(props.currentMessage.audio)}>
          <Text style={styles.audioText}>Play Audio</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return <Bubble {...props} />;
};

const playSound = async (uri) => {
  const { sound } = await Audio.Sound.createAsync({ uri });
  await sound.playAsync();
};

// Styles for the Chat component
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  logoutButton: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#C00",
    padding: 10,
    zIndex: 1
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 10
  }
});



export default Chat;