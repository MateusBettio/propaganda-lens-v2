import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';

interface AnalysisIconProps {
  type: 'covid-19' | 'war-complex' | 'gun-control' | 'chinese-propaganda' | 'islam-propaganda' | 'nazi-propaganda' | 'russian-propaganda' | 'warming';
  size?: number;
}

export function AnalysisIcon({ type, size = 16 }: AnalysisIconProps) {
  const getIconSource = (): ImageSourcePropType => {
    switch (type) {
      case 'covid-19':
        return require('../assets/analysis-icons/covid-19.png');
      case 'war-complex':
        return require('../assets/analysis-icons/war-complex.png');
      case 'gun-control':
        return require('../assets/analysis-icons/gun-control.png');
      case 'chinese-propaganda':
        return require('../assets/analysis-icons/chinese-propaganda.png');
      case 'islam-propaganda':
        return require('../assets/analysis-icons/islam-propaganda.png');
      case 'nazi-propaganda':
        return require('../assets/analysis-icons/nazi-propaganda.png');
      case 'russian-propaganda':
        return require('../assets/analysis-icons/russian-propaganda.png');
      case 'warming':
        return require('../assets/analysis-icons/warming.png');
      default:
        return require('../assets/analysis-icons/covid-19.png');
    }
  };

  return (
    <Image 
      source={getIconSource()} 
      style={{ width: size, height: size }} 
      resizeMode="contain"
    />
  );
}