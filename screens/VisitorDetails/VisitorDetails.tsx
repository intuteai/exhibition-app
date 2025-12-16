// ===================== VisitorDetails.tsx =====================
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import styles from './VisitorDetails.styles';

const VisitorDetails = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    company: '',
    comments: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Visitor Details</Text>
        <Text style={styles.subtitle}>
          Please fill in your information below
        </Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={form.name}
          onChangeText={(v) => handleChange('name', v)}
        />

        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => handleChange('email', v)}
        />

        <TextInput
          placeholder="WhatsApp Number"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          keyboardType="phone-pad"
          value={form.whatsapp}
          onChangeText={(v) => handleChange('whatsapp', v)}
        />

        <TextInput
          placeholder="Company / Organization"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={form.company}
          onChangeText={(v) => handleChange('company', v)}
        />

        <TextInput
          placeholder="Comments or Purpose of Visit"
          placeholderTextColor="#9CA3AF"
          style={[styles.input, styles.commentsInput]}
          value={form.comments}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          onChangeText={(v) => handleChange('comments', v)}
        />

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Submit Details</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default VisitorDetails;
