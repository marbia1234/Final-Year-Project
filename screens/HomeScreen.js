import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import Swiper from 'react-native-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';

const loadFonts = async () => {
  await Font.loadAsync({
    'Roboto-Bold': require('../assets/Roboto-Bold.ttf'),
    'Roboto-Medium': require('../assets/Roboto-Medium.ttf'), // New font for date/time
  });
};

const HomeScreen = ({ route, navigation }) => {
  const { name, profileImage } = route.params;
  const [image, setImage] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState({ date: '', time: '' });
  const [weather, setWeather] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [storedName, setStoredName] = useState('');
  const [storedProfileImage, setStoredProfileImage] = useState('');

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));

    const getCurrentDateTime = () => {
      const now = new Date();
    
      // Format the date: "14-December-2024"
      const day = now.getDate().toString().padStart(2, '0');
      const month = now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
    
      // Format the time: "10:25:32 AM"
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    
      setCurrentDateTime({ date: formattedDate, time: formattedTime });
    };
    

    getCurrentDateTime();
    const intervalId = setInterval(getCurrentDateTime, 1000);
    fetchWeather();
    return () => clearInterval(intervalId);
  }, []);

  const fetchWeather = async () => {
    const apiKey = '9fef82eb2e6f980f68ba98908645abdd';
    const city = 'Attock';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.main) {
        setWeather(`Temperature: ${data.main.temp}°C, ${data.weather[0].description}`);
      } else {
        setWeather('Weather data not available.');
      }
    } catch (error) {
      setWeather('Failed to fetch weather data.');
    }
  };

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 2],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result);
      navigation.navigate('Result', { image: result });
    }
  };
  const Profile = () => navigation.navigate('Profile');
  const handleChatWithDoctor = () => navigation.navigate('Chat', { disease: 'eggplant diseases' });
  const handleCamera = () => navigation.navigate('Camera');

  if (!fontsLoaded) return null; // Render null until fonts are loaded

  return (
    <LinearGradient colors={['#BE7C4D', '#BE7C4D']} style={styles.container}>
      <Image source={require('../assets/top-bar.png')} style={styles.topImage} />

      {/* Top Profile */}
      <View style={styles.profileContainer}>
        <Text style={styles.userName}>Welcome {'\n'}{storedName || name}</Text>
        {storedProfileImage || profileImage ? (
          <Image source={{ uri: storedProfileImage || profileImage }} style={styles.profileImage} />
        ) : null}
      </View>

      {/* Main Content */}
      <View style={styles.middleContainer}>
        <Swiper style={styles.wrapper} showsButtons autoplay autoplayTimeout={3} loop>
          <View style={styles.slide}><Image source={require('../assets/1.png')} style={styles.image} /></View>
          <View style={styles.slide}><Image source={require('../assets/2.png')} style={styles.image} /></View>
          <View style={styles.slide}><Image source={require('../assets/3.png')} style={styles.image} /></View>
        </Swiper>

        <Text style={styles.dateText}>{currentDateTime.date}</Text>
        <Text style={styles.timeText}>{currentDateTime.time}</Text>
        <Text style={styles.weatherText}>{weather}</Text>
      </View>

      {/* Action Buttons */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.cardButton} onPress={selectImage}>
            <MaterialCommunityIcons name="image-search" size={40} color="#4CAF50" />
            <Text style={styles.cardText}>Select Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardButton} onPress={handleChatWithDoctor}>
            <MaterialCommunityIcons name="stethoscope" size={40} color="#4CAF50" />
            <Text style={styles.cardText}>Chat Doctor</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.cardButton} onPress={handleCamera}>
            <MaterialCommunityIcons name="camera" size={40} color="#4CAF50" />
            <Text style={styles.cardText}>Camera Scan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={30} color="#4CAF50" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('News')}>
          <MaterialCommunityIcons name="newspaper" size={30} color="#4CAF50" />
          <Text style={styles.navText}>News</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: storedProfileImage || profileImage }} style={styles.navProfileImage} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // new addintion
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    marginTop:430,
  },
  backgroundImage: {
    flex: 1,             // Ensures the image covers the entire View
    resizeMode: 'contain', // Adjusts the image scaling (cover, contain, etc.)
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  //
  container: {
    flex: 1,
    backgroundColor: '#78563D',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 80,
    width: 330,
    left: 15,
    paddingLeft: 10,
    paddingRight: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: -20,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    color: 'white',
  },
  middleContainer: {
    flex: 1,
    top: 130,
    left: 0,
    height: 280,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  weatherText: {
    fontSize: 20,
    color: 'white',
    fontWeight:'800',
    marginTop: 0,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'center',
    position: 'absolute',
    alignItems: 'center',
    top: 490,
    left: 60,
  },
  customButton: {
    flexDirection: 'row',
    backgroundColor: '#406849',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: 250,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  customButtonText: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  topImage: {
    width: 600,
    height: 200,
    position: 'absolute',
    top: -80,
    left: -120,
    resizeMode: 'contain',
  },
  heading: {
    fontSize: 30,
    fontWeight: '900',
    color: 'white',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navItem:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  navProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Roboto-Medium',
    color: 'white',
    marginTop: 20,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'gabriola',
    marginTop: 10,
  },
  timeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'arial',
    marginTop: 2,
  },  
  wrapper: {}
});

export default HomeScreen;