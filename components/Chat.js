import { useState, useEffect, useCallback } from "react";
import { StyleSheet, View } from 'react-native';
import { GiftedChat, Bubble, Avatar } from "react-native-gifted-chat";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";


const Chat = ({ db, route, navigation }) => {
  const { name, backgroundColor } = route.params;
  const [messages, setMessages] = useState([]);

  const onSend = useCallback((messages = []) => {
    messages.forEach(message => {
      const { _id, createdAt, text, user } = message;
      addDoc(collection(db, "messages"), {
        _id,
        createdAt,
        text,
        user
      });
    });
  }, []);

  useEffect(() => {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({
        _id: doc.id,
        text: doc.data().text,
        createdAt: doc.data().createdAt.toDate(),
        user: doc.data().user
      }));
      setMessages(loadedMessages);
    });

    return () => unsubscribe();  // Clean up the subscription
  }, []);


  useEffect(() => {
    navigation.setOptions({ title: name });
  }, [name]); // Added name to dependency array to ensure the title updates if name changes.

  const renderAvatar = (props) => {
    if (props.currentMessage.user._id === 1) {
      return null; // Do not show an avatar for the user's own messages.
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
            borderRadius: 20, // Circle shape
            backgroundColor: '#e0e0e0', // Placeholder color
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
            backgroundColor: '#3394c2', // Blue bubble for user messages
          },
          left: {
            backgroundColor: '#e0e0e0', // Gray bubble for others
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

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        renderBubble={renderBubble}
        renderAvatar={renderAvatar} // Include the renderAvatar function in the GiftedChat component
        user={{
          _id: 1  // User's ID
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default Chat;