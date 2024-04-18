import { useState, useEffect } from "react";
import { StyleSheet, View } from 'react-native';
import { GiftedChat, Bubble, Avatar } from "react-native-gifted-chat";


const Chat = ({ route, navigation }) => {
  const { name, backgroundColor  } = route.params;
  const [messages, setMessages] = useState([]);

  const onSend = (newMessages) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  };

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
      {
        _id: 2,
        text: 'This is a system message',
        createdAt: new Date(),
        system: true,
      },
    ]);
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