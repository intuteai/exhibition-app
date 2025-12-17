import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, PhotoFile, TakePhotoOptions } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import styles from './CardCapture.styles';

// CommonJS import (Extraction.js uses module.exports)
const extractionModule = require('../../Logic/Extraction');
const extractCardFields = extractionModule.extractCardFields;

// --------------------
// Types
// --------------------
interface CardData {
  name: string | null;
  designation: string | null;
  company_name: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  email_primary: string | null;
  email_secondary: string | null;
  company_website: string | null;
  personal_website: string | null;
  raw_ocr: string;
}

const CaptureCard = () => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const navigation = useNavigation<any>();

  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  /**
   * OCR using Google ML Kit (Android-safe)
   */
  const runOcrOnImage = async (photo: PhotoFile): Promise<string> => {
    const targetPath = `${RNFS.CachesDirectoryPath}/ocr_${Date.now()}.jpg`;
    await RNFS.copyFile(photo.path, targetPath);

    const fileUri = `file://${targetPath}`;
    const result = await TextRecognition.recognize(fileUri);

    return result.blocks.map(b => b.text).join('\n');
  };

  // --------------------
  // ✅ DEV helper: Pick image from gallery (Kaggle testing)
  // --------------------
  const pickImageForTesting = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel || !result.assets?.[0]?.uri) return;

      const imageUri = result.assets[0].uri;
      console.log('🧪 Picked image:', imageUri);

      const ocrResult = await TextRecognition.recognize(imageUri);
      const rawOcrText = ocrResult.blocks.map(b => b.text).join('\n');

      const structuredData: CardData = extractCardFields(rawOcrText);

      navigation.navigate('VisitorDetails', {
        ocrData: structuredData,
        rawOcr: rawOcrText,
      });
    } catch (err) {
      console.error('Gallery OCR failed:', err);
    }
  };

  const takePhoto = async () => {
  if (!camera.current || isProcessing) return;

  setIsProcessing(true);

  try {
    const photo = await camera.current.takePhoto({
      skipMetadata: true,
    } as TakePhotoOptions);

    const rawOcrText = await runOcrOnImage(photo);
    const structuredData: CardData = extractCardFields(rawOcrText);

    navigation.navigate('VisitorDetails', {
      ocrData: structuredData,
      rawOcr: rawOcrText, // ✅ Include this
    });

  } catch (err) {
    console.error('Capture / OCR failed:', err);
  } finally {
    setIsProcessing(false);
  }
};

  if (!device || !hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive
        photo
      />

      <TouchableOpacity
        style={styles.captureButton}
        onPress={takePhoto}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <View style={styles.captureInnerCircle} />
        )}
      </TouchableOpacity>

      {/* ✅ DEV-ONLY BUTTON */}
      {__DEV__ && (
        <TouchableOpacity
          onPress={pickImageForTesting}
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            backgroundColor: 'rgba(255,0,0,0.85)',
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>
            DEBUG: Pick Image
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CaptureCard;