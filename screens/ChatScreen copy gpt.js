import React, { useState } from 'react';
import { View, ScrollView, TextInput, Button, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { ActivityIndicator } from 'react-native-paper';

const predefinedResponses = {
  'Insect Pest Disease': 'Insect pests like aphids, whiteflies, and mites can attack eggplants. Use insecticidal soaps or neem oil for effective control.',
  'Leaf Spot Disease': 'Leaf Spot Disease is caused by fungi or bacteria, leading to brown or black spots on leaves. Apply fungicides and maintain proper spacing between plants to prevent it.',
  'Mosaic Virus Disease': 'Mosaic Virus Disease causes mottled patterns on leaves and stunted growth. Remove infected plants and control insect vectors like aphids.',
  'Small Leaf Disease': 'Small Leaf Disease leads to reduced leaf size and poor growth. Ensure proper nutrient supply and monitor for pest infestations.',
  'White Mold Disease': 'White Mold Disease causes white, cottony growth on stems and leaves. Avoid overwatering and use fungicides as needed.',
  'Wilt Disease': 'Wilt Disease can be caused by fungi like Fusarium or bacteria. Ensure well-drained soil and rotate crops to prevent buildup of pathogens.',
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are an expert on eggplants and related topics like diseases, prevention, and cures. Do not answer unrelated questions.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    // Add the user's message to the conversation
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Check for predefined responses
    const matchedResponse = Object.keys(predefinedResponses).find((disease) =>
      input.toLowerCase().includes(disease.toLowerCase())
    );

    if (matchedResponse) {
      // Use predefined response
      const botMessage = { role: 'assistant', content: predefinedResponses[matchedResponse] };
      setMessages([...updatedMessages, botMessage]);
      setLoading(false);
      return;
    }

    try {
      // Send the user's message to OpenAI's GPT API
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // Use gpt-4 if available
          messages: updatedMessages, // Pass the conversation history
          temperature: 0.2, // Makes responses more focused
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer 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`, // Replace with your actual API key
          },
        }
      );

      // Get the response from the GPT model
      const botMessage = response.data.choices[0].message;
      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' },
      ]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              { backgroundColor: message.role === 'user' ? '#D0F0C0' : '#EAEAEA' },
            ]}
          >
            <Text>{message.role === 'user' ? 'You: ' : 'Bot: '}{message.content}</Text>
          </View>
        ))}
      </ScrollView>
      {loading && <ActivityIndicator size="large" />}
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Ask about eggplant diseases..."
        onSubmitEditing={sendMessage}
      />
      
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default Chatbot;
