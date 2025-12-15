// ===================== app.tsx =====================
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/Homescreen/Homescreen';
import CaptureCard from './screens/CardCapture/CardCapture';
import VisitorDetails from './screens/VisitorDetails/VisitorDetails';


const Stack = createNativeStackNavigator();


const App = () => {
return (
<NavigationContainer>
<Stack.Navigator>
<Stack.Screen name="Home" component={HomeScreen} />
<Stack.Screen name="CaptureCard" component={CaptureCard} options={{ title: 'Capture Card' }} />
<Stack.Screen name="VisitorDetails" component={VisitorDetails} options={{ title: 'Visitor Details' }} />
</Stack.Navigator>
</NavigationContainer>
);
};


export default App;