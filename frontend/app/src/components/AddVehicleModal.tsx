import React, { memo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface AddVehicleModalProps {
  visible: boolean;
  newVehicle: {
    brand: string;
    model: string;
    vin: string;
    owner: string;
  };
  theme: any;
  isSubmitting: boolean;
  onBrandChange: (text: string) => void;
  onModelChange: (text: string) => void;
  onVinChange: (text: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = memo(({
  visible,
  newVehicle,
  theme,
  isSubmitting,
  onBrandChange,
  onModelChange,
  onVinChange,
  onCancel,
  onSubmit,
}) => {
  if (!visible) return null;

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent
      onRequestClose={onCancel}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity
          style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
          activeOpacity={1}
          onPress={() => {}} // Prevent closing when tapping inside modal
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Register New Vehicle
          </Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Brand (e.g., Tesla, BMW)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newVehicle.brand}
            onChangeText={onBrandChange}
            autoCapitalize="words"
            maxLength={50}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Model (e.g., Model 3, i3)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newVehicle.model}
            onChangeText={onModelChange}
            autoCapitalize="words"
            maxLength={50}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="VIN (17 characters)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newVehicle.vin}
            onChangeText={onVinChange}
            autoCapitalize="characters"
            maxLength={17}
            autoCorrect={false}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button, 
                { backgroundColor: isSubmitting ? theme.colors.textSecondary : theme.colors.primary }
              ]}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddVehicleModal;
