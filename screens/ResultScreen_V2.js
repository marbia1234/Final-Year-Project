import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const ResultScreen = ({ route }) => {
  const { image } = route.params;
  const [result, setResult] = useState(null);
  const [diseaseInfo, setDiseaseInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUrdu, setIsUrdu] = useState(false);
  const navigation = useNavigation();
  const [boundingBoxes, setBoundingBoxes] = useState([]);

  const API_KEY = 'AIzaSyDi1BnDCsFPHZy7rie-OdVA-LNIKgyu_NA'; // Replace with your actual Google API key
  const CSE_ID = 'e2e23c30e867a4f5f'; // Your Custom Search Engine ID
  const acceptableDiseases = [
    "Healthy Leaf",
    "Insect Pest Disease",
    "Leaf Spot Disease",
    "Mosaic Virus Disease",
    "Small Leaf Disease",
    "White Mold Disease",
    "Wilt Disease"
  ];

  const showAlertAndNavigateHome = (message) => {
    Alert.alert("Unrecognized Disease", message, [
      {
        text: "OK",
       // onPress: () => navigation.navigate('Home'),
      },
    ]);
  };

  const showAlertAndNavigateHome1 = (message) => { 
    Alert.alert("Select Image", message, [
      {
        text: "OK",
       // onPress: () => navigation.navigate('Home'),
      },
    ]);
  };

  useEffect(() => {
    if (!image || !image.assets || !image.assets.length) {
      showAlertAndNavigateHome1("No image selected. Please select an image to proceed.");
      return;
    }

    const predictDisease = async () => {
      try {
        const imageUri = image.assets[0].uri;
        let formData = new FormData();
        let file = {
          uri: imageUri,
          type: image.assets[0].mimeType,
          name: image.assets[0].fileName,
        };
        formData.append('file', file);

        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        };

        const response = await axios.post('https://us-central1-wordpress-website-423605.cloudfunctions.net/predict', formData, {
          headers: headers,
        });
        if (response.data.class) {
          const { class: predictedClass, confidence, bounding_boxes } = response.data;
          
          if (acceptableDiseases.includes(predictedClass)) {
            setResult({ class: predictedClass, confidence });
            setBoundingBoxes(bounding_boxes || []);
            await fetchDiseaseInfo("eggplant " + predictedClass);
            setLoading(false);
          } else {
            showAlertAndNavigateHome("Please provide a clear and more accurate image.");
          }
        } else {
          showAlertAndNavigateHome(response.data.message || "An error occurred.");
        }
      } catch (error) {
        setLoading(false);
      }
      //   const predictedClass = response.data.class;
      //   if (acceptableDiseases.includes(predictedClass)) {
      //     setResult(response.data);
      //     await fetchDiseaseInfo("eggplant " + predictedClass);
      //     setLoading(false);
      //   } else {
      //     showAlertAndNavigateHome("Please provide a clear and more accurate image.");
      //   }
      // } catch (error) {
      //   setLoading(false);
      // }
    };

    const fetchDiseaseInfo = async (disease) => {
      try {
        const translatedDisease = await translateText(disease, 'ur');
        const searchResponse = await axios.get(
          `https://www.googleapis.com/customsearch/v1?q=${disease}&cx=${CSE_ID}&key=${API_KEY}`
        );

        const snippets = searchResponse.data.items.map(item => item.snippet).join('\n\n');
        const translatedSnippets = await translateText(snippets, 'ur');
        setDiseaseInfo({ en: snippets, ur: translatedSnippets || 'No information available for this disease.' });
      } catch (error) {
        //console.error('Error fetching disease info:', error);
      }
    };

    const translateText = async (text, targetLanguage) => {
      try {
        const response = await axios.post(
          `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
          {
            q: text,
            target: targetLanguage,
          }
        );

        return response.data.data.translations[0].translatedText;
      } catch (error) {
        //console.error('Error translating text:', error);
        return text;
      }
    };

    if (image) {
      predictDisease();
    } else {
      Alert.alert('Error', 'No image provided.');
      navigation.navigate('Home');
    }
  }, [image]);

  const toggleLanguage = () => {
    setIsUrdu(!isUrdu);
  };

  const handleChatWithDoctor = () => {
    navigation.navigate('Chat', { disease: result.class });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.imageContainer}>
        {image && <Image source={{ uri: image.assets[0].uri }} style={styles.image} />}
      </View> */}
      <View style={styles.imageContainer}>
  {image && <Image source={{ uri: image.assets[0].uri }} style={styles.image} />}
  {boundingBoxes.map((box, index) => (
    <View
      key={index}
      style={{
        position: 'absolute',
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
        borderColor: 'red',
        borderWidth: 2,
      }}
    />
  ))}
</View>
      {result && (
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.heading}>Detected Disease</Text>
          <Text style={styles.text}>{"Eggplant " + result.class}</Text>
          <Text style={styles.heading}>Confidence</Text>
          <Text style={styles.text}>{result.confidence}</Text>
          <Text style={styles.heading}>Information</Text>
          <Text style={styles.text}>{isUrdu ? diseaseInfo.ur : diseaseInfo.en}</Text>
        </ScrollView>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleLanguage}>
          <Text style={styles.buttonText}>{isUrdu ? "Show in English" : "Show in Urdu"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleChatWithDoctor}>
          <Text style={styles.buttonText}>Chat with Doctor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#BE7C4D',
  },
  // imageContainer: {
  //   borderWidth: 2,
  //   borderColor: 'white',
  //   borderRadius: 10,
  //   padding: 5,
  //   marginBottom: 16,
  // },
  imageContainer: {
  position: 'relative',
  borderWidth: 2,
  borderColor: 'white',
  borderRadius: 10,
  padding: 5,
  marginBottom: 16,
},

  image: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'snow',
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
    color: 'snow',
  },
  loading: {
    marginTop: 20,
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  button: {
    backgroundColor: '#FF7043',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    height: 50,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    color: 'white',
  },
});

export default ResultScreen;
