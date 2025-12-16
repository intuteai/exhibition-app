// ===================== CaptureCard.styles.ts =====================
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    // Added for centering the inner circle/activity indicator
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- NEW STYLE FOR INNER CAPTURE BUTTON (to handle the press effect / loading) ---
  captureInnerCircle: { 
    width: 60, // Slightly smaller than button width (70)
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker inner circle for contrast
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- NEW STYLE FOR RESULT OVERLAY ---
  resultOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 12,
    borderRadius: 8,
    zIndex: 10, // Ensure it sits above the camera view
  },
  // --- NEW STYLE FOR TEXT IN THE RESULT OVERLAY ---
  resultText: {
    color: '#D8FFD8', // Light green for success
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
});

export default styles;