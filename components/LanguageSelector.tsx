import React, { FC } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';

type Language = {
  code: string;
  name: string;
};

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
];

type LanguageSelectorProps = {
  style?: any;
};

export const LanguageSelector: FC<LanguageSelectorProps> = ({ style }) => {
  const { locale, setLocale } = useTranslation();

  const onSelectLanguage = (languageCode: string) => {
    setLocale(languageCode);
  };

  return (
    <View style={[styles.container, style]}>
      {LANGUAGES.map((language) => (
        <TouchableOpacity
          key={language.code}
          style={[
            styles.languageButton,
            locale.startsWith(language.code) && styles.activeLanguage,
          ]}
          onPress={() => onSelectLanguage(language.code)}
        >
          <Text
            style={[
              styles.languageText,
              locale.startsWith(language.code) && styles.activeLanguageText,
            ]}
          >
            {language.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeLanguage: {
    backgroundColor: '#007AFF',
  },
  languageText: {
    fontSize: 14,
    color: '#333',
  },
  activeLanguageText: {
    color: '#fff',
  },
});
