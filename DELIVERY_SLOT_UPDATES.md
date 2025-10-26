# Delivery Slot Feature Updates

## Summary
Updated the SlotManagementScreen to use date/time pickers instead of manual text input, and fixed the Supabase RLS policies to allow admin access.

## Changes Made

### 1. Database Security Policies
**File:** `src/screens/admin/SlotManagementScreen.tsx` (via MCP Supabase)

Added RLS policies for admins to manage delivery slots:

- **INSERT Policy**: Admins can create slot templates
- **UPDATE Policy**: Admins can update slot templates  
- **DELETE Policy**: Admins can delete slot templates
- Same policies added for `delivery_slot_instances` table

**Migration Name:** `add_slot_templates_admin_policies`

### 2. Date/Time Picker Implementation

**File:** `src/screens/admin/SlotManagementScreen.tsx`

#### Added Dependencies
```typescript
import DateTimePicker from '@react-native-community/datetimepicker';
import Platform from 'react-native';
```

#### New State Variables
- `showStartTimePicker` - Controls start time picker visibility
- `showEndTimePicker` - Controls end time picker visibility
- `showEndDatePicker` - Controls end date picker visibility
- `startTime` - Selected start time value
- `endTime` - Selected end time value
- `endDate` - Selected end date value

#### Updated UI Components

**Start Time Field:**
- Changed from TextInput to TouchableOpacity
- Opens DateTimePicker with time mode
- Displays time in HH:MM format
- Shows clock icon

**End Time Field:**
- Changed from TextInput to TouchableOpacity  
- Opens DateTimePicker with time mode
- Displays time in HH:MM format
- Shows clock icon

**End Date Field:**
- Changed from TextInput to TouchableOpacity
- Opens DateTimePicker with date mode
- Displays date in YYYY-MM-DD format
- Shows calendar icon
- Minimum date set to today

#### Styling Updates
```typescript
input: {
  // ... existing styles
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
inputText: {
  fontSize: 16,
  color: '#333',
},
```

## Benefits

1. **Better UX**: Native date/time pickers are easier to use than manual text input
2. **Data Validation**: Prevents invalid date/time entries
3. **Platform Consistency**: Uses native pickers on iOS and Android
4. **Accessibility**: Native pickers are more accessible
5. **Security**: Proper RLS policies ensure only admins can manage slots

## Testing

### Test the Date/Time Pickers:
1. Navigate to Slot Management Screen
2. Click "Add New Slot"
3. Click on "Start Time" field → Should open time picker
4. Click on "End Time" field → Should open time picker
5. Click on "End Date" field → Should open date picker (if repeat weekly is enabled)

### Test Admin Access:
1. Login as admin user
2. Navigate to Slot Management
3. Try to create a new slot template
4. Should successfully save (no 403 error)

## Installation Notes

Install the required package if not already installed:

```bash
npm install @react-native-community/datetimepicker
```

For iOS, add to `Podfile` and run `pod install`:
```ruby
pod 'RNDateTimePicker', :path => '../node_modules/@react-native-community/datetimepicker'
```

## API Fix

The 403 error from the curl request has been fixed by adding the admin RLS policies. The following should now work:

```bash
curl 'https://yvjxgoxrzkcjvuptblri.supabase.co/rest/v1/delivery_slot_templates' \
  -H 'authorization: Bearer <admin_token>' \
  --data-raw '[{
    "slot_type":"weekday",
    "start_time":"09:00",
    "end_time":"12:00",
    "max_orders":50,
    "repeat_weekly":true,
    "repeat_end_date":null
  }]'
```

## Next Steps

1. Test the implementation on both iOS and Android devices
2. Verify that the date/time format matches database requirements (HH:MM for time, YYYY-MM-DD for date)
3. Add validation to ensure end time is after start time
4. Add loading states while saving slot templates
5. Add success/error notifications after save
