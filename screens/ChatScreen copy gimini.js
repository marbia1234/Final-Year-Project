import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, ScrollView, Text, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import * as GoogleGenerativeAI from "@google/generative-ai";
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ChatScreen = ({ route }) => {
  const { disease } = route.params;
  const [messages, setMessages] = useState([{ text: `Tell me about ${disease}`, sender: 'user' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBotMessage, setCurrentBotMessage] = useState('');  // For word-by-word typing

  const apiKey = 'AIzaSyDwP25V6_z94Iag3bmhAmNZOmvOC6j76Bg';

  const scrollViewRef = useRef(null); // Ref for the ScrollView

  useEffect(() => {
   // sendMessage(`Tell me about ${disease}`, false);
  }, []);

  const cleanResponse = (response) => {
    return response.replace(/\*/g, '').replace(/\n\n/g, '\n');
  };

  const sendMessage = async (messageText = input, isUser = true) => {
    if (!messageText.trim()) return;

    const newMessage = { text: messageText, sender: isUser ? 'user' : 'bot' };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    if (isUser) {
      setInput('');
    }

    if (isUser) {
      setLoading(true);
      try {
        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = messages
          .map(msg => `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.text}`)
          .join('\n') + `\nUser: ${messageText}`;
        
        const result = await model.generateContent(prompt);
        let botResponse = result.response.text();
        botResponse = cleanResponse(botResponse);

        // Start typing the bot's response word by word
        typeMessage(botResponse);

      } catch (error) {
        //console.error('Error fetching response from Gemini:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'Sorry, something went wrong. Please try again later.', sender: 'bot' }
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const typeMessage = (fullMessage) => {
    setCurrentBotMessage(''); // Reset the message
    const words = fullMessage.split(' ');
    let index = 0;

    const interval = setInterval(() => {
      if (index < words.length) {
        setCurrentBotMessage(prev => prev + (index === 0 ? '' : ' ') + words[index]);
        index++;

        // Scroll to end on each word update
        scrollViewRef.current?.scrollToEnd({ animated: true });
      } else {
        clearInterval(interval);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: currentBotMessage + ' ' + words.join(' '), sender: 'bot' }
        ]);
        setCurrentBotMessage('');
      }
    }, 200); // Adjust typing speed
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messageContainer} ref={scrollViewRef}>
        {messages.map((message, index) => (
          <View key={index} style={[styles.messageBubble, message.sender === 'user' ? styles.userMessage : styles.botMessage]}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {currentBotMessage ? (
          <View style={[styles.messageBubble, styles.botMessage]}>
            <Text style={styles.messageText}>{currentBotMessage}</Text>
          </View>
        ) : null}
        {loading && <ActivityIndicator size="large" color="#406849" style={styles.loader} />}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(input)}>
          <Ionicons name="arrow-up" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#BE7C4D',
    justifyContent: 'space-between',
  },
  messageContainer: {
    marginTop: 10,
    flex: 1,
  },
  messageBubble: {
    padding: 15,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: '75%',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#406849',
    color: 'white',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#e1e1e1',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#BE7C4D',
    borderTopWidth: 1,
    borderTopColor: '#BE7C4D',
    marginBottom: 0,
  },
  sendButton: {
    backgroundColor: '#406849',
    borderRadius: 30,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'snow',
    backgroundColor: 'snow',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  loader: {
    marginTop: 10,
    color: '#8AB260',
  },
});

export default ChatScreen;
