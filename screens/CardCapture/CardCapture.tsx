import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, PhotoFile, TakePhotoOptions } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import RNFS from 'react-native-fs';
import styles from './CardCapture.styles';

// CommonJS import (because Extraction.js uses module.exports)
const extractionModule = require('../../Logic/Extraction');
const extractCardFields = extractionModule.extractCardFields;

// --------------------
// Types
// --------------------
interface CardData {
  name: string | null;
  designation: string | null;
  company_name: string | null;
  email_primary: string | null;
  email_secondary: string | null;
  company_website: string | null;
  personal_website: string | null;
  raw_ocr: string;
}

const CaptureCard = () => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');

  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  /**
   * ✅ FINAL WORKING OCR (Android-safe)
   */
  const runOcrOnImage = async (photo: PhotoFile): Promise<string> => {
    console.log('Original camera path:', photo.path);

    // 🔑 Copy image to readable cache location
    const targetPath = `${RNFS.CachesDirectoryPath}/ocr_${Date.now()}.jpg`;

    await RNFS.copyFile(photo.path, targetPath);

    const fileUri = `file://${targetPath}`;
    console.log('OCR file URI:', fileUri);

    // ✅ ML Kit accepts this
    const result = await TextRecognition.recognize(fileUri);

    const rawText = result.blocks
      .map(block => block.text)
      .join('\n');

    console.log('--- RAW OCR TEXT ---');
    console.log(rawText);

    return rawText;
  };

  const takePhoto = async () => {
    if (!camera.current || isProcessing) return;

    setIsProcessing(true);
    setCardData(null);

    try {
      const photo = await camera.current.takePhoto({
        skipMetadata: true,
      } as TakePhotoOptions);

      // 1️⃣ OCR
      const rawOcrText = await runOcrOnImage(photo);

      // 2️⃣ Structured extraction
      const structuredData = extractCardFields(rawOcrText);

      // 3️⃣ Save result
      setCardData(structuredData);

      console.log('✅ FINAL STRUCTURED CARD DATA');
      console.log(structuredData);

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

      {cardData && (
        <View style={styles.resultOverlay}>
          <Text style={styles.resultText}>✅ Extracted</Text>
          <Text style={styles.resultText}>Name: {cardData.name || 'N/A'}</Text>
          <Text style={styles.resultText}>Company: {cardData.company_name || 'N/A'}</Text>
          <Text style={styles.resultText}>Email: {cardData.email_primary || 'N/A'}</Text>
        </View>
      )}
    </View>
  );
};

export default CaptureCard;