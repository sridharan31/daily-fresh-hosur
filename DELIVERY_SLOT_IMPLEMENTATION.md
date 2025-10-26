# Delivery Slot Implementation

## Overview
This document describes the implementation of recurring weekday/weekend delivery slots functionality for Daily Fresh Hosur.

## Features Implemented

### 1. Admin Panel - Slot Management
**File:** `src/screens/admin/SlotManagementScreen.tsx`

- **Slot Templates**: Create and manage recurring slot templates
- **Weekday/Weekend Tabs**: Separate management for weekday and weekend slots
- **Slot Configuration**:
  - Slot type (weekday/weekend)
  - Start and end times
  - Max orders capacity
  - Repeat weekly toggle
  - End date (optional)
- **Actions**: Create, Edit, Pause/Resume, Delete slots
- **Status Indicators**: Color-coded active/paused status
- **Database Integration**: Direct Supabase queries for CRUD operations

### 2. Customer Checkout - Slot Selection
**File:** `app/checkout.tsx`

- **Date Picker**: Select delivery date
- **Automatic Slot Detection**: Determines weekday/weekend based on selected date
- **Available Slots Display**: Shows available time slots in card format
- **Slot Selection**: Visual selection with green highlight
- **Capacity Display**: Shows remaining slots available
- **Full Slot Handling**: Disabled appearance for full slots
- **Integration**: Saves selected slot ID to order

### 3. Order Confirmation
**File:** `app/order-confirmation.tsx`

- **Slot Display**: Shows confirmed delivery slot details
- **Time Format**: Human-readable time format (e.g., "10 AM - 2 PM")
- **Date Format**: Formatted date with day name (e.g., "Saturday, Oct 26")
- **Database Query**: Fetches slot details from `delivery_slot_instances`

## Database Schema

### Tables Created

#### 1. `delivery_slot_templates`
Stores recurring slot templates.

```sql
CREATE TABLE delivery_slot_templates (
  id UUID PRIMARY KEY,
  slot_type VARCHAR(10) CHECK (slot_type IN ('weekday', 'weekend')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 50,
  repeat_weekly BOOLEAN DEFAULT true,
  repeat_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 2. `delivery_slot_instances`
Stores concrete slot instances generated from templates.

```sql
CREATE TABLE delivery_slot_instances (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES delivery_slot_templates(id),
  slot_date DATE NOT NULL,
  start_ts TIMESTAMP NOT NULL,
  end_ts TIMESTAMP NOT NULL,
  slot_type VARCHAR(10) CHECK (slot_type IN ('weekday', 'weekend')),
  capacity INTEGER NOT NULL,
  booked_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(slot_date, start_ts, end_ts)
);
```

#### 3. Orders Table Update
Added foreign key to link orders with slot instances.

```sql
ALTER TABLE orders ADD COLUMN delivery_slot_instance_id UUID 
REFERENCES delivery_slot_instances(id);
```

### Indexes
```sql
CREATE INDEX idx_slot_templates_type ON delivery_slot_templates(slot_type);
CREATE INDEX idx_slot_templates_active ON delivery_slot_templates(is_active);
CREATE INDEX idx_slot_instances_date ON delivery_slot_instances(slot_date);
CREATE INDEX idx_slot_instances_status ON delivery_slot_instances(status);
CREATE INDEX idx_slot_instances_type ON delivery_slot_instances(slot_type);
```

## Data Flow

### Admin Flow
1. Admin navigates to Slot Management screen
2. Selects weekday or weekend tab
3. Creates new slot template with:
   - Time range (start_time, end_time)
   - Max orders capacity
   - Repeat weekly option
   - Optional end date
4. Slot template is saved to `delivery_slot_templates`
5. Background process generates slot instances from templates

### Customer Flow
1. Customer proceeds to checkout
2. Selects delivery date using date picker
3. System determines if date is weekday or weekend
4. Fetches available slots for that date and type
5. Customer selects preferred time slot
6. Selected slot ID is stored in checkout state
7. On order placement, slot is linked to order
8. Slot booked_count is incremented
9. Order confirmation displays slot details

## Slot Instance Generation

Slot instances can be generated:
- **Manually**: By admins through UI
- **Automated**: Via cron job or Supabase function
- **On-demand**: When customer requests slots

### Suggested Supabase Function

```sql
CREATE OR REPLACE FUNCTION generate_slot_instances(target_date DATE)
RETURNS void AS $$
BEGIN
  -- Generate slots from active templates for the target date
  INSERT INTO delivery_slot_instances (
    template_id,
    slot_date,
    start_ts,
    end_ts,
    slot_type,
    capacity,
    status
  )
  SELECT 
    t.id,
    target_date,
    (target_date + t.start_time)::timestamp,
    (target_date + t.end_time)::timestamp,
    t.slot_type,
    t.max_orders,
    'available'
  FROM delivery_slot_templates t
  WHERE 
    t.is_active = true
    AND t.repeat_weekly = true
    AND (t.repeat_end_date IS NULL OR target_date <= t.repeat_end_date)
    AND (
      (t.slot_type = 'weekday' AND EXTRACT(DOW FROM target_date) BETWEEN 1 AND 5)
      OR
      (t.slot_type = 'weekend' AND EXTRACT(DOW FROM target_date) IN (0, 6))
    )
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
```

## UI/UX Features

### Admin Panel
- **Color Coding**:
  - 🟢 Active slots
  - 🔴 Paused slots
- **Tabbed Interface**: Weekday/Weekend separation
- **Form Validation**: Required fields checking
- **Confirm Dialogs**: Delete confirmation
- **Edit/Pause/Delete**: Quick action buttons

### Customer Checkout
- **Date Picker**: Native browser date picker
- **Slot Cards**: Rounded cards with time range
- **Visual Feedback**:
  - Selected: Green border + light green background
  - Available: Gray border + white background
  - Full: Grayed out + "Full" indicator
- **Availability Display**: Shows remaining capacity
- **Responsive Layout**: Flexbox for mobile-friendly grid

## Security & RLS Policies

```sql
-- Anyone can view active templates
CREATE POLICY "Anyone can view active slot templates" 
ON delivery_slot_templates FOR SELECT 
USING (is_active = true);

-- Anyone can view available instances
CREATE POLICY "Anyone can view available slot instances" 
ON delivery_slot_instances FOR SELECT 
USING (status = 'available');

-- Admins can manage templates (implement via service role)
-- UPDATE policy needed for admins only
```

## Future Enhancements

1. **Auto-generation**: Automatically create slot instances from templates
2. **Capacity Management**: Auto-close slots when capacity reached
3. **Expiration**: Auto-mark expired slots as 'expired' status
4. **Analytics**: Track slot utilization and demand patterns
5. **Dynamic Pricing**: Adjust delivery charges based on slot type/time
6. **Waitlist**: Queue customers when slots are full
7. **Preferences**: Save customer's preferred slots
8. **Notifications**: Remind customers of their scheduled delivery

## Testing

### Test Cases
1. **Admin**: Create weekday slot template
2. **Admin**: Create weekend slot template
3. **Admin**: Pause and resume slots
4. **Admin**: Delete slot template
5. **Customer**: Select delivery date (weekday)
6. **Customer**: Select delivery date (weekend)
7. **Customer**: Select slot and place order
8. **System**: Verify slot capacity decremented
9. **Order Confirmation**: Display slot details

## Deployment

1. Run schema migration: `database/schema_ultra_safe.sql`
2. Deploy updated admin screen
3. Deploy updated checkout page
4. Deploy updated order confirmation
5. Test end-to-end flow
6. Monitor for errors

## Support

For issues or questions:
- Check Supabase logs for database errors
- Verify RLS policies are correctly configured
- Ensure slot instances are being generated
- Check booking count increments on orders
