# USER ID FORMAT FIX GUIDE

## Issue Identified

We've identified an issue with the user ID format when querying the Supabase database. The problem occurs when using numeric IDs instead of the required UUID format.

## Diagnostic Results

The error occurs when making API requests to Supabase with an incorrect user ID format:

```
{
  "code": "22P02",
  "details": null,
  "hint": null,
  "message": "invalid input syntax for type uuid: \"1\""
}
```

## Proper UUID Format

User IDs in the Supabase database are stored as UUID strings. For example:
```
2e8e8b4c-c4a9-4701-8d98-02252e44767d
```

## Fixing the Issue

1. **Direct API Calls**: When making direct REST API calls to Supabase, ensure you're using the correct UUID format:

   ```
   # INCORRECT
   curl 'https://yvjxgoxrzkcjvuptblri.supabase.co/rest/v1/user_addresses?select=*&user_id=eq.1'
   
   # CORRECT
   curl 'https://yvjxgoxrzkcjvuptblri.supabase.co/rest/v1/user_addresses?select=*&user_id=eq.2e8e8b4c-c4a9-4701-8d98-02252e44767d'
   ```

2. **In Application Code**: The app code correctly uses `user.id` which contains the proper UUID format:

   ```typescript
   // This is already correct in the codebase
   const addresses = await userService.getUserAddresses(user.id);
   ```

3. **Testing Considerations**: When testing with Postman or other API tools, make sure to use valid UUIDs from your database.

## Verification

We confirmed that using the correct UUID format returns the expected data:

```javascript
Status code: 200
Addresses found: 2
Addresses: [
  {
    "id": "a42eb313-e3db-4098-9d57-fe286a914277",
    "user_id": "2e8e8b4c-c4a9-4701-8d98-02252e44767d",
    "title": "SRIDHARAN PERIYANNAN",
    "address_line_1": "Paraminfo",
    "address_line_2": null,
    "city": "krishnigiri",
    "state": "tamil nadu",
    "pincode": "635112",
    "landmark": null,
    "latitude": null,
    "longitude": null,
    "is_default": false,
    "created_at": "2025-10-19T06:54:07.907956",
    "updated_at": "2025-10-19T07:19:13.549907"
  },
  {
    "id": "1d4f554a-0303-4fa4-b928-13ae36f52b25",
    "user_id": "2e8e8b4c-c4a9-4701-8d98-02252e44767d",
    "title": "SRIDHARAN PERIYANNAN",
    "address_line_1": "Paraminfo",
    "address_line_2": null,
    "city": "rewrwt",
    "state": "أبو ظبي",
    "pincode": "342344",
    "landmark": null,
    "latitude": null,
    "longitude": null,
    "is_default": true,
    "created_at": "2025-10-19T07:19:13.729844",
    "updated_at": "2025-10-19T07:19:13.729844"
  }
]
```

## Next Steps

1. Review all direct API calls to Supabase to ensure they use proper UUID formatting
2. Consider adding validation in any middleware or API layers
3. Update any testing scripts or documentation to emphasize the UUID requirement