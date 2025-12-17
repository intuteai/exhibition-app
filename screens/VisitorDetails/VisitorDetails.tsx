import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

import styles from './VisitorDetails.styles';
import { initDB, insertVisitor, getAllVisitors } from '../../Database/visitorDB';
import { exportToCSV } from '../../utils/exportCSV';

const VisitorDetails = () => {
  const route = useRoute<any>();
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');

  const [form, setForm] = useState({
    name: '',
    designation: '',
    email: '',
    whatsapp: '',
    company: '',
    comments: '',
    visitorCategory: '',
    leadImportance: '',
    clientType: '',
  });
  const visitorCategories: string[] = [
  'Vendor',
  'Partner',
  'Investor',
  'OEM/Fleet Manager ',
  'Dealer',
  'Supplier',
  'Consultant',
  'Others',
];


  const [showCamera, setShowCamera] = useState(false);
  const [selfiePath, setSelfiePath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const ocrData = route?.params?.ocrData ?? null;
  const rawOcr: string = route?.params?.rawOcr ?? '';

  useEffect(() => {
    initDB().catch(err => {
      Alert.alert('DB Error', 'Failed to initialize database');
      console.error(err);
    });
  }, []);

  useEffect(() => {
    if (ocrData) {
      setForm(prev => ({
        ...prev,
        name: ocrData.name || '',
        designation: ocrData.designation || '',
        email: ocrData.email_primary || '',
        company: ocrData.company_name || '',
        whatsapp: ocrData.phone_primary || '',
      }));
    }
  }, [ocrData]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const openCamera = async () => {
    const permission = await Camera.requestCameraPermission();
    if (permission === 'granted') setShowCamera(true);
    else Alert.alert('Permission required', 'Camera permission denied');
  };

  const captureSelfie = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePhoto();
    setSelfiePath(photo.path);
    setShowCamera(false);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      let savedSelfiePath: string | null = null;
      if (selfiePath && form.name) {
        const safeName = form.name.replace(/[^a-zA-Z0-9]/g, '_');
        const dir = `${RNFS.PicturesDirectoryPath}/VisitorSelfies`;
        await RNFS.mkdir(dir);
        savedSelfiePath = `${dir}/${safeName}_${Date.now()}.jpg`;
        await RNFS.copyFile(selfiePath, savedSelfiePath);
      }

      await insertVisitor({
        ...form,
        selfiePath: savedSelfiePath,
        raw_ocr: rawOcr,
      });

      Alert.alert('Success', 'Visitor saved locally');

      setForm({
        name: '',
        designation: '',
        email: '',
        whatsapp: '',
        company: '',
        comments: '',
        visitorCategory: '',
        leadImportance: '',
        clientType: '',
      });
      setSelfiePath(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save visitor');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const rows = await getAllVisitors();
      if (!rows.length) {
        Alert.alert('No Data', 'No visitors found');
        return;
      }
      await exportToCSV(rows);
    } catch {
      Alert.alert('Error', 'CSV export failed');
    }
  };

  const leadOptions = ['Important', 'Average', 'Not Important'];
  const clientOptions = ['Compage', 'Intute AI'];

  if (showCamera && device) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Camera ref={cameraRef} style={{ flex: 1 }} device={device} isActive photo />
        <TouchableOpacity
          onPress={captureSelfie}
          style={{
            position: 'absolute',
            bottom: 40,
            alignSelf: 'center',
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#fff',
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Visitor Registration</Text>
        <Text style={styles.subtitle}>Please verify and complete the visitor information</Text>

        <Text style={styles.sectionTitle}>Selfie Verification</Text>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: selfiePath ? '#16A34A' : '#2563EB' }]}
          onPress={openCamera}
        >
          <Text style={styles.submitText}>{selfiePath ? 'Selfie Captured ✓' : 'Capture Visitor Selfie'}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name (as per ID)"
          placeholderTextColor="#9CA3AF"
          value={form.name}
          onChangeText={v => handleChange('name', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Designation"
          placeholderTextColor="#9CA3AF"
          value={form.designation}
          onChangeText={v => handleChange('designation', v)}
        />

        <Text style={styles.sectionTitle}>Contact Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          value={form.email}
          onChangeText={v => handleChange('email', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="WhatsApp / Mobile Number"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={form.whatsapp}
          onChangeText={v => handleChange('whatsapp', v)}
        />

        <Text style={styles.sectionTitle}>Organization Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Company / Organization Name"
          placeholderTextColor="#9CA3AF"
          value={form.company}
          onChangeText={v => handleChange('company', v)}
        />

        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.commentsInput]}
          placeholder="Purpose of visit, person to meet, remarks..."
          placeholderTextColor="#9CA3AF"
          multiline
          value={form.comments}
          onChangeText={v => handleChange('comments', v)}
        />

        <Text style={styles.sectionTitle}>Visitor Category</Text>

<View style={styles.optionGroup}>
  {visitorCategories.map((option: string) => {
    const active = form.visitorCategory === option;
    return (
      <TouchableOpacity
        key={option}
        onPress={() => handleChange('visitorCategory', option)}
        style={[styles.optionChip, active && styles.optionChipActive]}
      >
        <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
          {option}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>


        <Text style={styles.sectionTitle}>Lead Importance</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          {leadOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: form.leadImportance === option ? '#2563EB' : '#9CA3AF',
                backgroundColor: form.leadImportance === option ? '#2563EB' : '#fff',
              }}
              onPress={() => handleChange('leadImportance', option)}
            >
              <Text style={{ color: form.leadImportance === option ? '#fff' : '#000' }}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Client For</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          {clientOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: form.clientType === option ? '#16A34A' : '#9CA3AF',
                backgroundColor: form.clientType === option ? '#16A34A' : '#fff',
              }}
              onPress={() => handleChange('clientType', option)}
            >
              <Text style={{ color: form.clientType === option ? '#fff' : '#000' }}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Visitor</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.submitButton, { backgroundColor: '#059669' }]} onPress={handleExport}>
          <Text style={styles.submitText}>Export Visitor Data (CSV)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default VisitorDetails;
