import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Button, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CameraScreen = () => {
  const cameraRef = useRef(null);
  const [hasCameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const capturedPhoto = await cameraRef.current.takePictureAsync({
        skipProcessing: true,
      });
      setPhoto(capturedPhoto);
    }
  };

  const handleSaveAndNavigate = async () => {
    if (photo && hasMediaLibraryPermission) {
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      const formattedPhoto = {
        assets: [
          {
            assetId: null,
            base64: null,
            duration: null,
            exif: null,
            fileName: photo.uri.split('/').pop(),
            fileSize: photo.fileSize,
            height: photo.height,
            mimeType: "image/jpeg",
            rotation: null,
            type: "image",
            uri: photo.uri,
            width: photo.width,
          },
        ],
        canceled: false,
      };
      navigation.navigate('Result', { image: formattedPhoto });
    } else {
      Alert.alert('Permission required', 'Permission to access media library is required to save the image.');
    }
  };

  if (!hasCameraPermission || !hasCameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestCameraPermission} title="Grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.takePictureButton} onPress={takePicture}>
            <MaterialCommunityIcons name="camera" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
      {photo && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveAndNavigate}
          >
            <MaterialCommunityIcons name="check-circle" size={24} color="white" />
            <Text style={styles.buttonText}> Save & Go to Result</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',

    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  takePictureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,

    backgroundColor: '#FF7043', // Theme color
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Add shadow
  },
  previewContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 200,
    height: 200,
    borderColor: '#fff',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: 200,
    height: 200,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#FF7043', // Theme color
    borderRadius: 50,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 3,
    fontSize: 16,
    color: 'white',
  },
});

export default CameraScreen;
