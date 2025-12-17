import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EEF2FF', // subtle tech tint
    padding: 20,
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,

    shadowColor: '#1E3A8A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  /* ===== HEADERS ===== */

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 22,
    marginBottom: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  /* ===== FIELD LABEL ===== */

  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },

  /* ===== INPUTS ===== */

  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 16,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },

  commentsInput: {
    height: 130,
    textAlignVertical: 'top',
  },

  /* ===== OPTION / CHIP GROUP ===== */

  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  optionChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },

  optionChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },

  optionChipText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },

  optionChipTextActive: {
    color: '#FFFFFF',
  },

  /* ===== BUTTON ===== */

  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,

    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});

export default styles;
