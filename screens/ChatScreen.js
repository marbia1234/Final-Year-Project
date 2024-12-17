import React, { useState } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

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
  const [previousChats, setPreviousChats] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const matchedResponse = Object.keys(predefinedResponses).find((disease) =>
      input.toLowerCase().includes(disease.toLowerCase())
    );

    if (matchedResponse) {
      const botMessage = { role: 'assistant', content: predefinedResponses[matchedResponse] };
      setMessages([...updatedMessages, botMessage]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'ft:gpt-4o-2024-08-06:comsats-university-islamabad:eggplant:AXBw13d2',
          messages: updatedMessages,
          temperature: 0.2,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer DUMMY_OPENAI_API_KEY`, 
          },
        }
      );

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
  const startNewChat = () => {
    setMessages([
      {
        role: 'system',
        content:
          'You are an expert on eggplants and related topics like diseases, prevention, and cures. Do not answer unrelated questions.',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* MENU button */}
      <TouchableOpacity style={styles.menuButton} onPress={() => setModalVisible(true)}>
        <Icon name="menu" size={24} color="white" />
      </TouchableOpacity>
      {/* NEW chat */}
      <TouchableOpacity style={styles.newChatButton} onPress={startNewChat}>
        <Icon name="add" size={24} color="white" />
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>
      {/* Modal for Drawer */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Previous Chats</Text>
            <FlatList
              data={previousChats}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    setMessages(item);
                    setModalVisible(false);
                  }}
                  style={styles.chatListItem}
                >
                  <Text style={styles.chatListText}>Chat {index + 1}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Chat Messages */}
      <ScrollView style={styles.chatContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              {
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: message.role === 'user' ? '#D0F0C0' : '#EAEAEA',
              },
            ]}
          >
            <Text style={styles.messageText}>
              {message.role === 'user' ? 'You: ' : 'Bot: '}
              {message.content}
            </Text>
          </View>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator size="large" color="#FF7043" />}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about eggplant diseases..."
          placeholderTextColor="black"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BE7C4D',
    padding: 10,
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 1000,
    backgroundColor: '#FF7043',
    borderRadius: 25,
    padding: 10,
  },
  newChatButton: {
    position: 'absolute',
    top: 40,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7043',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  newChatButtonText: {
    marginLeft: 5,
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chatListItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  chatListText: {
    fontSize: 16,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#FF7043',
    padding: 10,
    borderRadius: 5,
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
    marginTop: 30,
    marginBottom: 30,
  },
  messageBubble: {
    padding: 10,
    top: 60,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D0F0C0',
    borderRadius: 25,
    padding: 10,
  },
  input: {
    flex: 1,
    color: 'black',
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#FF7043',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Chatbot;