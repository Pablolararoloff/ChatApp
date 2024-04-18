import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/Background.png')}
        resizeMode="cover"
        style={styles.imageBackground}
      >
        <Text style={styles.title}>Chat App</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            onChangeText={setName}
            value={name}
            placeholder="Your Name"
            placeholderTextColor="#757083"
          />

          <Text style={styles.label}>Choose Background Color:</Text>
          <View style={styles.colorOptions}>
          <TouchableOpacity
  accessible={true}
  accessibilityLabel="Choose background color: Dark"
  accessibilityHint="Lets you choose a dark background color for the chat screen."
  accessibilityRole="button"
  style={[styles.colorCircle, { backgroundColor: '#090C08' }]}
  onPress={() => setBackgroundColor('#090C08')}
/>
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Choose background color: Deep Gray"
  accessibilityHint="Lets you choose a deep gray background color for the chat screen."
  accessibilityRole="button"
  style={[styles.colorCircle, { backgroundColor: '#474056' }]}
  onPress={() => setBackgroundColor('#474056')}
/>
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Choose background color: Light Gray"
  accessibilityHint="Lets you choose a light gray background color for the chat screen."
  accessibilityRole="button"
  style={[styles.colorCircle, { backgroundColor: '#8A95A5' }]}
  onPress={() => setBackgroundColor('#8A95A5')}
/>
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Choose background color: Pale Spring Bud"
  accessibilityHint="Lets you choose a pale spring bud background color for the chat screen."
  accessibilityRole="button"
  style={[styles.colorCircle, { backgroundColor: '#B9C6AE' }]}
  onPress={() => setBackgroundColor('#B9C6AE')}
/>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Chat', { name, backgroundColor })}>
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 120,
  },
  inputBox: {
    flex: 1,
    height: 350,
    position: 'absolute',
    bottom: 20,
    width: '88%',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: '#757083',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    backgroundColor: '#FFFFFF',
    marginBottom: 60,
  },
  label: {
    fontSize: 16,
    color: '#757083',
    marginBottom: 10,
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  button: {
    backgroundColor: '#757083',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 45,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default HomeScreen;
