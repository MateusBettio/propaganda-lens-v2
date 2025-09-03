import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/fonts';
import { fetchMetadata, Metadata } from '../../services/metadata';

interface SharedContentProps {
  content?: string;
  contentType?: 'url' | 'text' | 'audio' | 'trending';
  sources?: Array<{
    title: string;
    url: string;
    domain: string;
    thumbnail?: string;
  }>;
  analyzeMetadata?: boolean;
}

export const SharedContent: React.FC<SharedContentProps> = ({
  content,
  contentType = 'text',
  sources = [],
  analyzeMetadata = true
}) => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (contentType === 'url' && content && analyzeMetadata) {
      loadMetadata(content);
    }
  }, [content, contentType, analyzeMetadata]);

  const loadMetadata = async (url: string) => {
    setLoading(true);
    setImageError(false);
    try {
      console.log('SharedContent: Loading metadata for URL:', url);
      const result = await fetchMetadata(url);
      console.log('SharedContent: Received metadata:', result);
      setMetadata(result);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const renderURLContent = () => {
    if (loading) {
      return (
        <View style={styles.urlPreview}>
          <View style={styles.loadingPlaceholder} />
          <View style={styles.urlContent}>
            <View style={[styles.loadingPlaceholder, { width: '70%', height: 16 }]} />
            <View style={[styles.loadingPlaceholder, { width: '100%', height: 12, marginTop: 4 }]} />
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.urlPreview} 
        activeOpacity={0.7}
        onPress={() => content && openUrl(content)}
      >
        {metadata?.image && !imageError ? (
          <Image 
            source={{ uri: metadata.image }} 
            style={styles.urlThumbnail}
            resizeMode="cover"
            onLoad={() => console.log('Image loaded successfully:', metadata.image)}
            onError={(error) => {
              console.log('Image failed to load:', metadata.image);
              console.log('Image error:', error.nativeEvent.error);
              setImageError(true);
            }}
          />
        ) : (
          <View style={styles.urlIconContainer}>
            <Ionicons name="link-outline" size={24} color="#6B7280" />
            {metadata?.image && (
              <Text style={{ fontSize: 8, color: '#EF4444', textAlign: 'center', marginTop: 2 }}>
                IMG
              </Text>
            )}
          </View>
        )}
        <View style={styles.urlContent}>
          <Text style={styles.urlTitle} numberOfLines={2}>
            {metadata?.title || content}
          </Text>
          {metadata?.description && (
            <Text style={styles.urlDescription} numberOfLines={2}>
              {metadata.description}
            </Text>
          )}
          <Text style={styles.urlDomain}>{metadata?.domain}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTextContent = () => {
    return (
      <View style={styles.textContent}>
        <Text style={styles.textContentText} numberOfLines={3}>
          {content}
        </Text>
      </View>
    );
  };

  const renderAudioContent = () => {
    return (
      <View style={styles.audioContent}>
        <View style={styles.audioIcon}>
          <Ionicons name="musical-notes-outline" size={24} color="#6B7280" />
        </View>
        <View style={styles.audioInfo}>
          <Text style={styles.audioTitle}>Audio File</Text>
          <Text style={styles.audioDescription}>Shared audio content analyzed for propaganda techniques</Text>
        </View>
        <TouchableOpacity style={styles.playButton} activeOpacity={0.7}>
          <Ionicons name="play-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSourcesCarousel = () => {
    if (sources.length === 0) return null;

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sourcesContainer}
      >
        {sources.map((source, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sourceItem}
            activeOpacity={0.7}
            onPress={() => openUrl(source.url)}
          >
            {source.thumbnail ? (
              <Image 
                source={{ uri: source.thumbnail }} 
                style={styles.sourceThumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.sourceIconContainer}>
                <Ionicons name="globe-outline" size={16} color="#6B7280" />
              </View>
            )}
            <Text style={styles.sourceTitle} numberOfLines={2}>
              {source.title}
            </Text>
            <Text style={styles.sourceDomain}>
              {source.domain}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const getSectionTitle = () => {
    switch (contentType) {
      case 'trending':
        return 'Sources';
      default:
        return 'Shared Content';
    }
  };

  const renderContent = () => {
    switch (contentType) {
      case 'url':
        return renderURLContent();
      case 'audio':
        return renderAudioContent();
      case 'trending':
        return renderSourcesCarousel();
      default:
        return renderTextContent();
    }
  };

  if (!content && contentType !== 'trending') return null;
  if (contentType === 'trending' && sources.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getSectionTitle()}</Text>
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    marginTop: 24,
    width: '100%',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  header: {
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#111827',
  },
  
  // URL Content Styles
  urlPreview: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  urlThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  urlIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  urlContent: {
    flex: 1,
  },
  urlTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#111827',
    marginBottom: 2,
  },
  urlDescription: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 2,
  },
  urlDomain: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#9CA3AF',
  },
  
  // Text Content Styles
  textContent: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  textContentText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#4B5563',
    lineHeight: 20,
  },
  
  // Audio Content Styles
  audioContent: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  audioIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#111827',
    marginBottom: 2,
  },
  audioDescription: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#6B7280',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Sources Carousel Styles
  sourcesContainer: {
    paddingHorizontal: 26,
    paddingBottom: 30,
  },
  sourceItem: {
    width: 120,
    marginHorizontal: 4,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  sourceThumbnail: {
    width: '100%',
    height: 60,
    borderRadius: 6,
    marginBottom: 6,
  },
  sourceIconContainer: {
    width: '100%',
    height: 60,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  sourceTitle: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#111827',
    lineHeight: 14,
    marginBottom: 2,
  },
  sourceDomain: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: '#6B7280',
  },
  
  // Loading Styles
  loadingPlaceholder: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 60,
    height: 60,
  },
});