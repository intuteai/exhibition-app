// ===================== VisitorDetails.tsx =====================
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from './VisitorDetails.styles';


const VisitorDetails = () => {
const [form, setForm] = useState({
name: '',
email: '',
whatsapp: '',
company: '',
});


const handleChange = (key: string, value: string) => {
setForm({ ...form, [key]: value });
};


return (
<View style={styles.container}>
<Text style={styles.title}>Visitor Details</Text>


<TextInput
placeholder="Full Name"
style={styles.input}
value={form.name}
onChangeText={(v) => handleChange('name', v)}
/>


<TextInput
placeholder="Email"
style={styles.input}
keyboardType="email-address"
value={form.email}
onChangeText={(v) => handleChange('email', v)}
/>


<TextInput
placeholder="WhatsApp Number"
style={styles.input}
keyboardType="phone-pad"
value={form.whatsapp}
onChangeText={(v) => handleChange('whatsapp', v)}
/>


<TextInput
placeholder="Company"
style={styles.input}
value={form.company}
onChangeText={(v) => handleChange('company', v)}
/>


<TouchableOpacity style={styles.submitButton}>
<Text style={styles.submitText}>Submit</Text>
</TouchableOpacity>
</View>
);
};


export default VisitorDetails;