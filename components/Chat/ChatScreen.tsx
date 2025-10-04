import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { GiftedChat, IMessage, MessageProps, Bubble, Send, InputToolbar, Actions, Time } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/theme-context';
import { ColorScheme } from '../../types';
import { useAIChat } from './useAIChat';

interface ChatContext {
  url?: string;
  sharedContent?: any;
  analysis?: any;
  contentType?: string;
}

interface ChatScreenProps {
  onSendMessage?: (message: string) => void;
  initialMessages?: IMessage[];
  initialUserMessage?: string;
  aiApiKey?: string;
  aiModel?: string;
  enableImages?: boolean;
  context?: ChatContext;
}

export default function ChatScreen({
  onSendMessage,
  initialMessages = [],
  initialUserMessage,
  aiApiKey,
  aiModel = 'gpt-3.5-turbo',
  enableImages = true,
  context
}: ChatScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [messages, setMessages] = useState<IMessage[]>([]);

  // Build context-aware system prompt
  const systemPrompt = useMemo(() => {
    let prompt = 'You are an expert AI assistant specializing in propaganda detection, bias analysis, and media literacy.';

    if (context) {
      prompt += '\n\nContext for this conversation:';

      if (context.url) {
        prompt += `\n- URL being analyzed: ${context.url}`;
      }

      if (context.sharedContent) {
        const contentPreview = typeof context.sharedContent === 'string'
          ? context.sharedContent.substring(0, 500)
          : JSON.stringify(context.sharedContent).substring(0, 500);
        prompt += `\n- Content excerpt: ${contentPreview}...`;
      }

      if (context.analysis) {
        prompt += `\n- Analysis results:`;
        if (context.analysis.summary) {
          prompt += `\n  Summary: ${context.analysis.summary}`;
        }
        if (context.analysis.confidence !== undefined) {
          prompt += `\n  Confidence: ${(context.analysis.confidence * 100).toFixed(0)}%`;
        }
        if (context.analysis.techniques) {
          prompt += `\n  Detected techniques: ${context.analysis.techniques.join(', ')}`;
        }
      }

      if (context.contentType) {
        prompt += `\n- Content type: ${context.contentType}`;
      }

      prompt += '\n\nWhen users ask about "this content" or "this article", they are referring to the content described above. Provide specific, contextual answers based on this information.';
    } else {
      prompt += ' Provide clear, concise, and helpful responses about propaganda detection and media analysis.';
    }

    return prompt;
  }, [context]);

  const { sendMessage, isLoading } = useAIChat({
    apiKey: aiApiKey,
    model: aiModel,
    systemPrompt
  });
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
          name: 'Propaganda Lens',
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
          name: 'You',
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
              name: 'Propaganda Lens',
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
          user: {
            _id: 1,
            name: 'You'
          },
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

  const renderTime = (props: any) => {
    const isRightBubble = props.position === 'right';
    const isLightMode = colors.primary === '#000000';

    const timeColor = isRightBubble
      ? (isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)')
      : colors.textSecondary;

    const usernameColor = isRightBubble
      ? (isLightMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)')
      : colors.textSecondary;

    return (
      <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, marginBottom: 5 }}>
        {isRightBubble && (
          <Text style={{
            color: usernameColor,
            fontSize: 10,
            fontWeight: '600',
            marginRight: 2
          }}>
            You
          </Text>
        )}
        <Time {...props} timeTextStyle={{
          left: { color: timeColor, fontSize: 10 },
          right: { color: timeColor, fontSize: 10 }
        }} />
      </View>
    );
  };

  const renderBubble = (props: MessageProps<IMessage>) => {
    const isRightBubble = props.position === 'right';
    // In light mode: primary is black, surface is white
    // In dark mode: primary is white, surface is dark
    const isLightMode = colors.primary === '#000000';

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
            marginBottom: 8,
          },
          left: {
            backgroundColor: colors.surface,
            marginBottom: 8,
          },
        }}
        textStyle={{
          right: {
            color: isLightMode ? '#ffffff' : '#000000',
          },
          left: {
            color: colors.text,
          },
        }}
        usernameStyle={{
          color: colors.textSecondary,
          fontSize: 10,
          fontWeight: '600',
          marginRight: 2,
        }}
        renderUsernameOnMessage={true}
        renderTime={renderTime}
      />
    );
  };

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
        user={{
          _id: 1,
          name: 'You'
        }}
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
        messagesContainerStyle={styles.messagesContainer}
        bottomOffset={0}
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
    messagesContainer: {
      paddingBottom: 70, // Space for the input toolbar
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
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 5,
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