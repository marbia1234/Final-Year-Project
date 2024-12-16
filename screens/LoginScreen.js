import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient effect
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database'; // Import get from Firebase Realtime Database
import { auth, database } from '../firebaseConfig'; // Import Firebase Auth instance

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const navigation = useNavigation();

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }
    setLoading(true); // Start loading

    try {
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
     // console.log('User logged in:', user);

      // Fetch user data from Realtime Database
      const userRef = ref(database, 'users/' + user.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        // Navigate to the home screen and pass the user data
        
        navigation.navigate('Home', {
          userId: user.uid,
          name: userData.name,
          profileImage: userData.profileImage,
        });
      } else {
        Alert.alert('Error', 'User data not found in the database.');
      }
    } catch (error) {
      //console.error('Error during login:', error);
      
      // Error handling
      switch (error.code) {
        case 'auth/invalid-email':
          Alert.alert('Invalid Email', 'The email address is not valid.');
          break;
        case 'auth/user-not-found':
          Alert.alert('User Not Found', 'No user found with this email.');
          break;
        case 'auth/wrong-password':
          Alert.alert('Incorrect Password', 'The password is incorrect.');
          break;
        case 'auth/network-request-failed':
          Alert.alert('Network Error', 'Please check your internet connection.');
          break;
        default:
          Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
          break;
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <LinearGradient colors={['#BE7C4D', '#BE7C4D']} style={styles.container}>
      {/* Top Image */}
      <Image source={require('../assets/top-bar.png')} style={styles.topImage} />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#FF7043" style={styles.loadingIndicator} />}

        <Text style={styles.switchText}>
          {"Don't have an account? "}
          <Text style={styles.linkText} onPress={() => navigation.navigate('Register')}>
            Register here.
          </Text>
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  topImage: {
    width: 550,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: -190, // Adjust the spacing from the top
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7043', // Orangish title
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#4CAF50', // Green button
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  linkText: {
    color: '#FF7043', // Orangish link text
    fontWeight: 'bold',
  },
});

export default LoginScreen;
