import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GiftedChat, IMessage, MessageProps, Bubble, Send, InputToolbar, Actions } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/theme-context';
import { ColorScheme } from '../../types';
import { useAIChat } from './useAIChat';

interface ChatScreenProps {
  onSendMessage?: (message: string) => void;
  initialMessages?: IMessage[];
  initialUserMessage?: string;
  aiApiKey?: string;
  aiModel?: string;
  enableImages?: boolean;
}

export default function ChatScreen({
  onSendMessage,
  initialMessages = [],
  initialUserMessage,
  aiApiKey,
  aiModel = 'gpt-3.5-turbo',
  enableImages = true
}: ChatScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { sendMessage, isLoading } = useAIChat({ apiKey: aiApiKey, model: aiModel });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize chat with initial message if provided
  const initializeChat = async () => {
    if (isInitialized) return;

    setIsInitialized(true);

    if (!initialUserMessage) {
      // No initial message, show welcome
      const welcomeMessage: IMessage = {
        _id: 1,
        text: 'Hello! How can I help you analyze this content?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AI Assistant',
          avatar: '🤖',
        },
      };
      setMessages([welcomeMessage, ...initialMessages]);
    } else {
      // Process initial user message
      console.log('Processing initial message:', initialUserMessage);
      const userMsg: IMessage = {
        _id: Math.random().toString(),
        text: initialUserMessage,
        createdAt: new Date(),
        user: {
          _id: 1,
          name: 'User',
        },
      };

      setMessages([userMsg]);

      if (onSendMessage) {
        onSendMessage(initialUserMessage);
      }

      if (aiApiKey) {
        try {
          const response = await sendMessage(initialUserMessage);

          const aiMessage: IMessage = {
            _id: Math.round(Math.random() * 1000000),
            text: response,
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'AI Assistant',
              avatar: '🤖',
            },
          };

          setMessages(prev => GiftedChat.append(prev, [aiMessage]));
        } catch (error) {
          console.error('AI response error:', error);
        }
      }
    }
  };

  useEffect(() => {
    initializeChat();
  }, []); // Only run once on mount

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    
    if (onSendMessage) {
      onSendMessage(userMessage.text);
    }

    if (aiApiKey) {
      try {
        const response = await sendMessage(userMessage.text);
        
        const aiMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: response,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'AI Assistant',
            avatar: '🤖',
          },
        };
        
        setMessages(previousMessages => GiftedChat.append(previousMessages, [aiMessage]));
      } catch (error) {
        console.error('AI response error:', error);
      }
    }
  }, [onSendMessage, sendMessage, aiApiKey]);

  const handleImagePicker = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: { _id: 1 },
          image: result.assets[0].uri,
        };
        
        setMessages(previousMessages => GiftedChat.append(previousMessages, [imageMessage]));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  }, []);


  const renderActions = (props: any) => (
    <Actions
      {...props}
      containerStyle={styles.actionsContainer}
      onPressActionButton={() => {}}
      icon={() => (
        <View style={styles.attachmentActions}>
          {enableImages && (
            <Ionicons 
              name="image" 
              size={20} 
              color={colors.textSecondary} 
              onPress={handleImagePicker}
            />
          )}
        </View>
      )}
    />
  );

  const renderBubble = (props: MessageProps<IMessage>) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: colors.primary,
        },
        left: {
          backgroundColor: colors.surface,
        },
      }}
      textStyle={{
        right: {
          color: colors.primary === '#ffffff' ? '#000000' : '#ffffff',
        },
        left: {
          color: colors.text,
        },
      }}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <Ionicons name="send" size={20} color={colors.primary} />
      </View>
    </Send>
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputPrimary}
    />
  );

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderActions}
        isTyping={isLoading}
        placeholder="Type a message..."
        textInputStyle={styles.textInput}
        alwaysShowSend
        scrollToBottom
        showUserAvatar={false}
        showAvatarForEveryMessage={false}
      />
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    sendButton: {
      marginRight: 10,
      marginBottom: 5,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputToolbar: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderTopColor: 'rgba(0, 0, 0, 0.05)',
      borderTopWidth: 1,
      paddingTop: 8,
      paddingBottom: 8,
      minHeight: 60,
      marginBottom: 20,
    },
    inputPrimary: {
      alignItems: 'center',
    },
    actionsContainer: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
      marginRight: 4,
      marginBottom: 0,
    },
    attachmentActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    textInput: {
      color: colors.text,
      fontSize: 16,
    },
  });
}