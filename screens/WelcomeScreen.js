import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient effect

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Top Image */}
      <Image source={require('../assets/top-bar.png')} style={styles.topImage} />

      {/* Large slogan */}
      <Text style={styles.slogan}>
        Take care of your plant...{'\n'}
        <Text style={styles.sloganHighlight}>virtually</Text>
      </Text>

      {/* Two buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.topButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.topButton, styles.registerButton]} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Image and bottom gradient */}
      <View style={styles.bottomContainer}>
        <Image source={require('../assets/eggplant-welcone.png')} style={styles.image} />
        <LinearGradient
          colors={['transparent', '#78563D']} // Gradient adjusted to match the theme
          style={styles.gradient}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#BE7C4D', // Light orangish background
    padding: 20,
  },
  topImage: {
    width: 600,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: -90, // Adjust the spacing from the top
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems:'center',
    marginBottom: 40,
    marginTop: 50,
  },
  topButton: {
    backgroundColor: '#FF7043', // Orangish button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  registerButton: {
    backgroundColor: '#4CAF50', // Green button
  },
  buttonText: {
    color: '#FFF', // White text
    fontSize: 16,
    fontWeight: 'bold',
  },
  slogan: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2F2E41', // Dark color for text
    marginBottom: 10,
    marginTop: -100,
    textAlign: 'center', // Center the slogan text
    alignSelf: 'stretch',
  },
  sloganHighlight: {
    color: '#4CAF50', // Highlighted part in green
    fontSize: 50,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flex: 3,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 550,
    top:400,
    position: 'absolute',
  },
  image: {
    width: 350,
    height: 330,
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: '60%',
    width: '100%',
  },
});

export default WelcomeScreen;
