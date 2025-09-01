export const fonts = {
  regular: 'InstrumentSans_400Regular',
  medium: 'InstrumentSans_500Medium',
  semiBold: 'InstrumentSans_600SemiBold',
  bold: 'InstrumentSans_700Bold',
  regularItalic: 'InstrumentSans_400Regular_Italic',
  mediumItalic: 'InstrumentSans_500Medium_Italic',
  semiBoldItalic: 'InstrumentSans_600SemiBold_Italic',
  boldItalic: 'InstrumentSans_700Bold_Italic',
  serifRegular: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
};

export const getFontStyle = (weight: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular', italic = false) => {
  const weightMap = {
    regular: italic ? fonts.regularItalic : fonts.regular,
    medium: italic ? fonts.mediumItalic : fonts.medium,
    semiBold: italic ? fonts.semiBoldItalic : fonts.semiBold,
    bold: italic ? fonts.boldItalic : fonts.bold,
  };
  
  return {
    fontFamily: weightMap[weight] || fonts.regular,
  };
};