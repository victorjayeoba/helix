# Patient Creation API Guide

## 🐛 Issue Fixed

**Error**: `"gender: \"male\" is not a valid choice"` and `"last_name: This field may not be blank"`

**Solution**: 
- ✅ Gender values must be `"M"` or `"F"` (not `"male"` or `"female"`)
- ✅ `last_name` cannot be empty string - defaults to `"Patient"` if not provided

## 📍 Two Methods for Patient Creation

### Method 1: Direct API Endpoint (FIXED - Now Working)
**Endpoint**: `POST /api/patients/create`

**What was fixed**:
```javascript
// ❌ BEFORE (Caused errors)
{
  gender: "male",        // Wrong - API expects "M" or "F"
  last_name: ""          // Wrong - Cannot be blank
}

// ✅ AFTER (Works now)
{
  gender: "M",           // Correct - "M" for male, "F" for female
  last_name: "Patient"   // Correct - Defaults to "Patient" if empty
}
```

**Gender Mapping**:
- `"male"` → `"M"`
- `"female"` → `"F"`
- `"other"` → `null`
- `"prefer-not-to-say"` → `null`

**Request Example**:
```javascript
POST /api/patients/create
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "+234 123 456 7890",
  "date_of_birth": "1990-01-15",
  "gender": "male",  // Will be converted to "M"
  "address": "123 Main St",
  "allergies": ["Penicillin", "Peanuts"]
}
```

**Response**:
```javascript
{
  "status": true,
  "id": 123,
  "message": "Patient created successfully"
}
```

### Method 2: AI EMR Endpoint (Alternative - Experimental)
**Endpoint**: `POST /api/patients/create-via-ai`

This uses the AI-powered EMR endpoint that accepts natural language prompts (similar to how appointments are created).

**How it works**:
```javascript
POST /api/patients/create-via-ai
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "+234 123 456 7890",
  "date_of_birth": "1990-01-15",
  "gender": "male",
  "address": "123 Main St",
  "allergies": ["Penicillin", "Peanuts"]
}
```

**Converted to AI Prompt**:
```
"Create a new patient profile for John Doe. 
Email: john@example.com. 
Phone: +234 123 456 7890. 
Date of Birth: 1990-01-15. 
Gender: male. 
Address: 123 Main St. 
Known allergies: Penicillin, Peanuts."
```

**Note**: This method may or may not work depending on how the Dorra API's `/ai/emr` endpoint handles new patient creation. The direct method is more reliable.

## 🔧 What Changed in the Code

### File: `app/api/patients/create/route.ts`

#### 1. Gender Mapping
```javascript
// Map gender values to what API expects
let genderValue = null
if (body.gender) {
  const genderLower = body.gender.toLowerCase()
  if (genderLower === 'male') genderValue = 'M'
  else if (genderLower === 'female') genderValue = 'F'
  else if (['m', 'f'].includes(genderLower)) genderValue = body.gender.toUpperCase()
  else genderValue = null // For other/prefer-not-to-say
}
```

#### 2. Last Name Default
```javascript
const patientData = {
  first_name: body.first_name,
  last_name: body.last_name || 'Patient', // ✅ Default to 'Patient' if empty
  // ...
}
```

## 🧪 Testing

### Test the Fixed Direct Method:
1. Complete the patient profile form
2. Make sure you select a gender (Male/Female)
3. Last name can be empty (will default to "Patient")
4. Click "Complete Profile"
5. Should work now! ✅

### Check Server Logs:
Look for these in your terminal:
```
📥 Received patient creation request
📝 Request body: { first_name: "John", gender: "male", ... }
📤 Creating patient in Dorra API: { ..., gender: "M", last_name: "Patient" }
📊 Response status: 200 OK
✅ Patient created successfully
```

## 📊 API Response Structure

### Success Response:
```json
{
  "status": true,
  "id": 123,
  "message": "Patient created successfully",
  "patient": {
    "id": 123,
    "first_name": "John",
    "last_name": "Doe",
    "gender": "M",
    ...
  }
}
```

### Error Response:
```json
{
  "status": false,
  "status_code": 400,
  "message": "Error description",
  "details": { ... }
}
```

## 🎯 Gender Values Reference

The Dorra API accepts these gender values:
- ✅ `"M"` - Male
- ✅ `"F"` - Female
- ✅ `null` - Not specified

**NOT accepted**:
- ❌ `"male"`, `"female"` (lowercase full words)
- ❌ `"Male"`, `"Female"` (capitalized full words)
- ❌ `"other"`, `"prefer-not-to-say"` (these get converted to `null`)

## 🐛 Troubleshooting

### Still getting "gender is not a valid choice"?
- Check the server logs to see what value is actually being sent
- Verify the gender mapping code is working
- Try sending `"M"` or `"F"` directly in your test

### Still getting "last_name may not be blank"?
- Check that the default value `"Patient"` is being set
- Verify the request body isn't overriding it
- Check server logs for the actual value being sent

### Patient created but missing data?
- Some fields accept `null` when empty (email, phone, address)
- `last_name` must have a value - we default to `"Patient"`
- Gender can be `null` for unspecified

## ✅ What's Working Now

1. ✅ **Gender conversion**: `"male"` → `"M"`, `"female"` → `"F"`
2. ✅ **Last name default**: Empty string → `"Patient"`
3. ✅ **Comprehensive logging**: Easy to debug issues
4. ✅ **Error handling**: Clear error messages
5. ✅ **Field validation**: Checks required fields

## 🚀 Next Steps

The patient creation should now work! If you still encounter issues:

1. Check the server terminal for detailed logs
2. Verify the Dorra API is accessible
3. Confirm the API key is correct
4. Check that all required data is being sent

The enhanced logging will show you exactly what's being sent to the API and what response you're getting back.



