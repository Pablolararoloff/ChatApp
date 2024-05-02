import { useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Audio } from "expo-av";

// CustomActions component provides additional messaging functionalities like sending images, locations, or recordings
const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, userID }) => {
  const actionSheet = useActionSheet(); // Use the action sheet from context
  let recordingObject = null; // To store the recording object

  // Function to pick an image from the library
  const pickImage = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
      else Alert.alert("Permissions haven't been granted.");
    }
  }

  // Function to take a photo with the camera
  const takePhoto = async () => {
    let permissions = await ImagePicker.requestCameraPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
      else Alert.alert("Permissions haven't been granted.");
    }
  }

  // Function to start audio recording
  const handleAudioRecording = async () => {
    try {
      // Request permissions to use the microphone
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission not granted to use microphone");
        return;
      }

      // Set the audio mode to enable recording on iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false
      });
      // Prepare the recorder
      recordingObject = new Audio.Recording();

      // Since we're simplifying, we're omitting any specific audio mode settings here.
      // Prepare and start the recording directly.
      await recordingObject.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recordingObject.startAsync();
      Alert.alert('Recording started', 'Press OK to stop recording.', [
        { text: 'OK', onPress: () => stopAndSendRecording() },
      ]);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording failed to start');
    }
  };

  const stopAndSendRecording = async () => {
    try {
      await recordingObject.stopAndUnloadAsync();
      const uri = recordingObject.getURI();
      if (uri) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const refPath = `${userID}-${Date.now()}.aac`;
        const storageRef = ref(storage, refPath);
        const snapshot = await uploadBytes(storageRef, blob);
        const audioUrl = await getDownloadURL(snapshot.ref);
        onSend({ audio: audioUrl });
      } else {
        throw new Error('Recording file not available');
      }
      recordingObject = null;
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Recording failed to stop');
    }
  };

  // Cleanup recording objects when component unmounts
  useEffect(() => {
    return () => {
      if (recordingObject) recordingObject.stopAndUnloadAsync();
    }
  }, []);

  // Function to handle action sheet options
  const onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Record Audio', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    actionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            return;
          case 1:
            takePhoto()
            return;
          case 2:
            getLocation();
            return;
          case 3:
            handleAudioRecording();
            break;
          default:
            break;
        }
      },
    );
  };

  // Function to get the current location and send it
  const getLocation = async () => {
    let permissions = await Location.requestForegroundPermissionsAsync();
    if (permissions?.granted) {
      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        onSend({
          location: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
          },
        });
      } else Alert.alert("Error occurred while fetching location");
    } else Alert.alert("Permissions haven't been granted.");
  }

  // Helper function to generate a unique reference for storage
  const generateReference = (uri) => {
    // this will get the file name from the uri
    const imageName = uri.split("/")[uri.split("/").length - 1];
    const timeStamp = (new Date()).getTime();
    return `${userID}-${timeStamp}-${imageName}`;
  }

  // Function to upload an image and send the URL
  const uploadAndSendImage = async (imageURI) => {
    const uniqueRefString = generateReference(imageURI);
    const newUploadRef = ref(storage, uniqueRefString);
    const response = await fetch(imageURI);
    const blob = await response.blob();
    uploadBytes(newUploadRef, blob).then(async (snapshot) => {
      const imageURL = await getDownloadURL(snapshot.ref)
      onSend({ image: imageURL })
    });
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
}

// Styling for the CustomActions component
const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

export default CustomActions;