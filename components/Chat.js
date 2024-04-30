import { useState, useEffect } from "react";
import { StyleSheet, View, Platform, KeyboardAvoidingView, TouchableOpacity, Text } from 'react-native';
import { GiftedChat, Bubble, Avatar, InputToolbar } from "react-native-gifted-chat";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';
import { Audio } from "expo-av";



const Chat = ({ db, route, navigation, isConnected, storage }) => {
  const { userID, backgroundColor, name } = route.params;
  const [messages, setMessages] = useState([]);
  let soundObject = null;

  let unsubMessages;

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

  const loadCachedMessages = async () => {
    const cachedMessages = await AsyncStorage.getItem("messages") || [];
    setMessages(JSON.parse(cachedMessages));
  }

  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(messagesToCache));
    } catch (error) {
      console.log(error.message);
    }
  }

  const onSend = (newMessages) => {
    addDoc(collection(db, "messages"), newMessages[0])
  }

  const renderInputToolbar = (props) => {
    if (isConnected === true) return <InputToolbar {...props} />;
    else return null;
  }

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


  const renderCustomActions = (props) => {
    return <CustomActions onSend={onSend} storage={storage} {...props} userID={userID} />;
  };

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
  return <View {...props}>
    <TouchableOpacity
      style={{
        backgroundColor: "#FF0", borderRadius: 10, margin: 5
      }}
      onPress={async () => {
        const { sound } = await Audio.Sound.createAsync({
          uri:
            props.currentMessage.audio
        });
        await sound.playAsync();
      }}>
      <Text style={{
        textAlign: "center", color: 'black', padding:
          5
      }}>Play Sound</Text>
    </TouchableOpacity>
  </View>
}

const renderMessageAudio = (props) => {
  return <View {...props}>
    <TouchableOpacity
      style={{
        backgroundColor: "#FF0", borderRadius: 10, margin: 5
      }}
      onPress={async () => {
        if (soundObject) soundObject.unloadAsync();
        const { sound } = await Audio.Sound.createAsync({
          uri:
            props.currentMessage.audio
        });
        soundObject = sound;
        await sound.playAsync();
      }}>
      <Text style={{
        textAlign: "center", color: 'black', padding:
          5
      }}>Play Sound</Text>
    </TouchableOpacity>
  </View>
}


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