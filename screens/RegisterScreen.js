import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import { auth, database, storage } from '../firebaseConfig';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (name === '' || email === '' || password === '' || confirmPassword === '') {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true); // Start loading

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profileImageUrl = null;

      if (profileImage) {
        const imageRef = storageRef(storage, `profileImages/${user.uid}`);
        const response = await fetch(profileImage);
        const blob = await response.blob();

        await uploadBytes(imageRef, blob);
        profileImageUrl = await getDownloadURL(imageRef);
        //console.log('Profile image uploaded:', profileImageUrl);
      }

      await set(ref(database, 'users/' + user.uid), {
        name: name,
        email: email,
        profileImage: profileImageUrl,
      });

      //console.log('User registered:', user);
      navigation.navigate('Login');
    } catch (error) {
      //console.error('Error during registration:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 2],
      quality: 1,
    });

    if (result.canceled) {
      Alert.alert('No image selected', 'Please select an image to proceed.');
    } else {
      setProfileImage(result.assets[0].uri);
      //console.log('Selected image URI:', result.assets[0].uri);
    }
  };

  return (
    <LinearGradient colors={['#BE7C4D', '#BE7C4D']} style={styles.container}>
      <Image source={require('../assets/top-bar.png')} style={styles.topImage} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Register</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            value={confirmPassword}
            secureTextEntry
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.buttonText}>{profileImage ? 'Change Profile Image' : 'Upload Profile Image'}</Text>
          </TouchableOpacity>
          {profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#FF7043" style={styles.loadingIndicator} />}

          <Text style={styles.switchText}>
            {"Already have an account? "}
            <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
              {'\n'}Login here.
            </Text>
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  topImage: {
    width: 600,
    height: 200,
    position: 'absolute',
    top: -14,
    left: -120,
    resizeMode: 'contain',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 220,
    paddingHorizontal: 16,
  },
  formContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginTop: -100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7043',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  imageButton: {
    width: '100%',
    backgroundColor: '#FF7043',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  switchText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  linkText: {
    color: '#FF7043',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
