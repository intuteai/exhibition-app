import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  logo: {
    width: 260,
    height: 140,
    alignSelf: 'center',
    marginBottom: 50,
  },

  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    marginBottom: 18,
    alignItems: 'center',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    // Android shadow
    elevation: 6,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default styles;
