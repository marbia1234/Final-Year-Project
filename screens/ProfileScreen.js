import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, set,update } from 'firebase/database';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import { auth, database, storage } from '../firebaseConfig';

const ProfileScreen = ({ navigation, route }) => {
  const user = auth.currentUser;
  const [profileImage, setProfileImage] = useState(route.params?.profileImage || user.photoURL);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle profile image change
  const handleChangeProfileImage = async () => {
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
      const profileImage = result.assets[0].uri; // Correct path for the image
      await updateProfile(profileImage, '12');
      //console.log('Selected image URI:', result.assets[0].uri);
    }
  };

  const updateProfile = async (profileImage, name) => {
    try {
      
  
      if (!user) {
        console.error('User is not logged in.');
        return;
      }
    
        let profileImageUrl = null;
  
      if (profileImage) {
        const imageRef = storageRef(storage, `profileImages/${user.uid}`);
        const response = await fetch(profileImage);
        const blob = await response.blob();

        await uploadBytes(imageRef, blob);
        profileImageUrl = await getDownloadURL(imageRef);
        console.log('Profile image uploaded:', profileImageUrl);
      }
      await update(ref(database, 'users/' + user.uid), {
        
        profileImage: profileImageUrl,
      });
      Alert.alert('Message', 'ProfileUpdated');

      console.log('Profile updated successfully.');
    } catch (error) {
      console.error('Error updating profile:', error.message);
    }
  };
  // Handle password reset
  const handlePasswordReset = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    reauthenticateWithCredential(user, credential).then(() => {
      updatePassword(user, newPassword)
        .then(() => {
          Alert.alert('Success', 'Your password has been reset successfully.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        })
        .catch((error) => {
          Alert.alert('Error', 'Failed to update password:',error.message);
        });
    }).catch((error) => {
      Alert.alert('Error', 'Current password is incorrect.');
    });
  };

  return (
    <LinearGradient colors={['#BE7C4D', '#78563D']} style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleChangeProfileImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <MaterialCommunityIcons name="camera" size={40} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.profileText}>Change Profile Photo</Text>
      </View>

      {/* Password Reset Section */}
      <View style={styles.passwordContainer}>
        <Text style={styles.sectionTitle}>Reset Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          placeholderTextColor="#FFF"
          secureTextEntry={true}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#FFF"
          secureTextEntry={true}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#FFF"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#406849',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  profileText: {
    marginTop: 10,
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  passwordContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#406849',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;