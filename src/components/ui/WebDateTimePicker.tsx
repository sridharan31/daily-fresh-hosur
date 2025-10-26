// src/components/ui/WebDateTimePicker.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform } from 'react-native';

interface WebDateTimePickerProps {
  value: Date;
  mode: 'date' | 'time' | 'datetime';
  onChange: (event: any, date?: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  is24Hour?: boolean;
  display?: 'default' | 'spinner' | 'clock' | 'calendar';
  disabled?: boolean;
}

const WebDateTimePicker: React.FC<WebDateTimePickerProps> = ({
  value,
  mode,
  onChange,
  minimumDate,
  maximumDate,
  is24Hour = false,
  display = 'default',
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // For web platform, use native HTML input
  if (Platform.OS === 'web') {
    if (mode === 'time') {
      return (
        <input
          type="time"
          value={value.toTimeString().slice(0, 5)}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':');
            const newDate = new Date(value);
            newDate.setHours(parseInt(hours), parseInt(minutes));
            onChange({ type: 'set' }, newDate);
          }}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        />
      );
    } else if (mode === 'date') {
      return (
        <input
          type="date"
          value={value.toISOString().split('T')[0]}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            onChange({ type: 'set' }, newDate);
          }}
          min={minimumDate ? minimumDate.toISOString().split('T')[0] : undefined}
          max={maximumDate ? maximumDate.toISOString().split('T')[0] : undefined}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        />
      );
    }
  }

  // For native platforms, use the native DateTimePicker
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      is24Hour={is24Hour}
      display={display}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      disabled={disabled}
      onChange={onChange}
    />
  );
};

export default WebDateTimePicker;
