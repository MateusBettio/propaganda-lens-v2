# Chat Component

A production-ready chat component built with React Native Gifted Chat, featuring AI integration, voice recording, and image attachments.

## Features

- ✅ Modern chat UI with message bubbles
- ✅ AI integration with OpenAI/compatible APIs
- ✅ Voice recording with expo-audio
- ✅ Image attachments with expo-image-picker
- ✅ Real-time typing indicators
- ✅ Theme integration (light/dark mode)
- ✅ Accessibility support
- ✅ TypeScript support

## Quick Start

```tsx
import { ChatScreen } from '../components/Chat';

export default function MyChatScreen() {
  return (
    <ChatScreen
      aiApiKey={process.env.EXPO_PUBLIC_OPENAI_API_KEY}
      aiModel="gpt-3.5-turbo"
      enableVoice={true}
      enableImages={true}
      onSendMessage={(message) => {
        console.log('Message sent:', message);
      }}
    />
  );
}
```

## Props

### ChatScreen

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `aiApiKey` | `string` | `undefined` | OpenAI API key for AI responses |
| `aiModel` | `string` | `'gpt-3.5-turbo'` | AI model to use |
| `enableVoice` | `boolean` | `true` | Enable voice recording |
| `enableImages` | `boolean` | `true` | Enable image attachments |
| `onSendMessage` | `(message: string) => void` | `undefined` | Callback when user sends message |
| `initialMessages` | `IMessage[]` | `[]` | Initial messages to display |

## Environment Variables

Add to your `.env`:

```env
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

## Permissions

The component automatically requests these permissions:

- **Microphone**: For voice recording
- **Camera Roll**: For image attachments

## Customization

The component uses your app's existing theme system via `useTheme()`. All colors, fonts, and spacing follow your design system.

### Custom AI Backend

You can connect to any OpenAI-compatible API by changing the `aiApiKey` and `aiModel` props.

### Voice Messages

Voice recordings are saved as `.m4a` files with the following settings:
- Sample Rate: 44100 Hz
- Bit Rate: 128 kbps
- Channels: 2 (Stereo)
- Max Duration: 60 seconds

### Image Messages

Images are compressed to 80% quality and can be edited before sending.

## File Structure

```
/components/Chat/
├── index.tsx           # Component exports
├── ChatScreen.tsx      # Main chat screen (240 lines)
├── useAIChat.tsx       # AI integration hook (60 lines)
├── VoiceRecorder.tsx   # Voice recording component (90 lines)
└── README.md           # This documentation
```

## Dependencies

```json
{
  "react-native-gifted-chat": "^2.8.1",
  "ai": "^5.0.44",
  "@ai-sdk/openai": "^2.0.30",
  "expo-audio": "^1.0.11",
  "expo-speech": "^14.0.7"
}
```

## Usage Examples

### Basic Chat (No AI)

```tsx
<ChatScreen
  enableVoice={true}
  enableImages={true}
  onSendMessage={(message) => {
    // Handle message locally
    console.log('Message:', message);
  }}
/>
```

### AI-Powered Chat

```tsx
<ChatScreen
  aiApiKey={process.env.EXPO_PUBLIC_OPENAI_API_KEY}
  aiModel="gpt-4"
  systemPrompt="You are a helpful assistant specialized in React Native development."
/>
```

### Voice Only Chat

```tsx
<ChatScreen
  enableVoice={true}
  enableImages={false}
  aiApiKey={process.env.EXPO_PUBLIC_OPENAI_API_KEY}
/>
```

## Troubleshooting

### Common Issues

1. **No AI responses**: Check that `EXPO_PUBLIC_OPENAI_API_KEY` is set correctly
2. **Voice recording fails**: Ensure microphone permissions are granted
3. **Image picker not working**: Check camera roll permissions
4. **Styling issues**: Ensure `ThemeProvider` wraps your app

### Performance

- Messages are efficiently rendered with VirtualizedList
- Images are compressed automatically
- Voice recordings are limited to 60 seconds
- AI responses stream in real-time

## Future Enhancements

- [ ] Speech-to-text for voice messages
- [ ] File attachments (PDF, documents)
- [ ] Message reactions and replies
- [ ] Group chat support
- [ ] WebSocket real-time updates
- [ ] Message encryption