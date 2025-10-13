// app/components/delivery/SlotCalendar.tsx
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface SlotCalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: string[];
  availableDates?: string[];
  style?: ViewStyle;
  testID?: string;
}

const SlotCalendar: React.FC<SlotCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days ahead
  disabledDates = [],
  availableDates = [],
  style,
  testID,
}) => {
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});

  useEffect(() => {
    updateMarkedDates();
  }, [selectedDate, disabledDates, availableDates]);

  const updateMarkedDates = () => {
    const marked: {[key: string]: any} = {};

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#4CAF50',
        selectedTextColor: '#fff',
      };
    }

    // Mark disabled dates
    disabledDates.forEach(date => {
      marked[date] = {
        ...marked[date],
        disabled: true,
        disableTouchEvent: true,
        textColor: '#ccc',
      };
    });

    // Mark available dates with slots
    availableDates.forEach(date => {
      if (!marked[date]?.selected) {
        marked[date] = {
          ...marked[date],
          marked: true,
          dotColor: '#4CAF50',
        };
      }
    });

    setMarkedDates(marked);
  };

  const handleDayPress = (day: DateData) => {
    const selectedDateStr = day.dateString;
    
    // Check if date is disabled
    if (disabledDates.includes(selectedDateStr)) {
      return;
    }

    // Check if date is before minDate or after maxDate
    const dayMoment = moment(selectedDateStr);
    const minMoment = moment(minDate);
    const maxMoment = moment(maxDate);

    if (dayMoment.isBefore(minMoment, 'day') || dayMoment.isAfter(maxMoment, 'day')) {
      return;
    }

    onDateSelect(selectedDateStr);
  };

  const isWeekend = (dateString: string) => {
    const day = moment(dateString).day();
    return day === 5 || day === 6; // Friday or Saturday (weekend in UAE)
  };

  const theme = {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: '#4CAF50',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#4CAF50',
    dayTextColor: '#2d4150',
    textDisabledColor: '#d9e1e8',
    dotColor: '#4CAF50',
    selectedDotColor: '#ffffff',
    arrowColor: '#4CAF50',
    disabledArrowColor: '#d9e1e8',
    monthTextColor: '#2d4150',
    indicatorColor: '#4CAF50',
    textDayFontFamily: 'System',
    textMonthFontFamily: 'System',
    textDayHeaderFontFamily: 'System',
    textDayFontWeight: '300' as const,
    textMonthFontWeight: '600' as const,
    textDayHeaderFontWeight: '600' as const,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.title}>Select Delivery Date</Text>
      
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        minDate={moment(minDate).format('YYYY-MM-DD')}
        maxDate={moment(maxDate).format('YYYY-MM-DD')}
        theme={theme}
        firstDay={0} // Sunday as first day
        showWeekNumbers={false}
        disableAllTouchEventsForDisabledDays={true}
        enableSwipeMonths={true}
        testID={`${testID}-calendar`}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: '#4CAF50'}]} />
          <Text style={styles.legendText}>Available dates</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: '#ccc'}]} />
          <Text style={styles.legendText}>Unavailable dates</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default SlotCalendar;
