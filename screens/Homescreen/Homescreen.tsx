import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
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

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const btn1Anim = useRef(new Animated.Value(0)).current;
  const btn2Anim = useRef(new Animated.Value(0)).current;
  const btn3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(btn1Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(btn2Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(btn3Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animatedStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      {/* Logo animation */}
      <Animated.View style={animatedStyle(logoAnim)}>
        <Image
          source={require('../../assets/intuteai_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={animatedStyle(btn1Anim)}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CaptureCard')}
        >
          <Text style={styles.buttonText}>Capture Card</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* <Animated.View style={animatedStyle(btn2Anim)}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => console.log('Record Conversation pressed')}
        >
          <Text style={styles.buttonText}>Record Conversation</Text>
        </TouchableOpacity>
      </Animated.View> */}

      <Animated.View style={animatedStyle(btn3Anim)}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('VisitorDetails')}
        >
          <Text style={styles.buttonText}>Enter Visitor Details</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default HomeScreen;
