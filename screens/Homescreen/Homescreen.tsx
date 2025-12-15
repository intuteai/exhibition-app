import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import styles from './Homescreen.styles';

type RootStackParamList = {
  Home: undefined;
  CaptureCard: undefined;
  VisitorDetails: undefined;
};

type HomeScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CaptureCard')}
      >
        <Text style={styles.buttonText}>Capture Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // Placeholder for future audio recording screen
          console.log('Record Conversation pressed');
        }}
      >
        <Text style={styles.buttonText}>Record Conversation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('VisitorDetails')}
      >
        <Text style={styles.buttonText}>Enter Visitor Details</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;