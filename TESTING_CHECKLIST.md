# Testing Checklist

## ✅ Recent Fixes to Test

### 1. Sign-Up Page
- [ ] Open homepage
- [ ] Click "Sign Up" button
- [ ] **VERIFY**: Doctor button is greyed out and disabled
- [ ] **VERIFY**: "Currently accepting patient registrations only" text appears
- [ ] **VERIFY**: Patient button is active and selected by default
- [ ] Try to sign up as patient → Should work

### 2. Profile Completion
- [ ] Sign up as a new patient
- [ ] **Step 1**: Fill basic info (phone, DOB, gender, address)
- [ ] **Step 2**: Fill health vitals (height, weight, blood type)
- [ ] **Step 3**: Fill medical history (allergies, conditions, medications)
- [ ] **Step 4**: Fill emergency contact
- [ ] Click "Complete Profile"
- [ ] **VERIFY**: Profile creates successfully OR shows clear error message
- [ ] **VERIFY**: Redirects to `/patient-dashboard` on success
- [ ] Check browser console (F12) for any errors
- [ ] Check server terminal for logs

## 🎯 All Features to Test

### Patient Features

#### Authentication
- [ ] Sign up as patient works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Auto-redirect to dashboard after login

#### Profile Management
- [ ] Complete profile form (4 steps)
- [ ] View profile data
- [ ] Profile shows real data from Firestore

#### Chat Features
- [ ] AI Doctor chat works
  - [ ] Switch to "AI Doctor" mode
  - [ ] Send message
  - [ ] Receive AI response
- [ ] Real Doctor chat works
  - [ ] Switch to "Chat with Doctor" mode
  - [ ] Send message
  - [ ] Message appears in real-time
  - [ ] Open doctor app in another browser
  - [ ] Verify doctor receives message
  - [ ] Doctor responds
  - [ ] Patient sees response instantly

#### Find Healthcare (Map)
- [ ] Click "Healthcare" tab
- [ ] Click "Use My Current Location"
- [ ] Allow location access
- [ ] **VERIFY**: Real hospitals/pharmacies appear
- [ ] **VERIFY**: Distances are calculated
- [ ] Click "Get Directions"
- [ ] **VERIFY**: Opens Google Maps

#### Appointments
- [ ] View appointments list
- [ ] Click "Book Appointment"
- [ ] Fill appointment form
- [ ] Submit booking
- [ ] **VERIFY**: Appointment appears in list

#### Home Dashboard
- [ ] View health metrics
- [ ] Quick actions work
- [ ] Recent activity shows

#### Notifications
- [ ] View notifications
- [ ] Mark as read
- [ ] Click notification

### Doctor Features

#### Message Center
- [ ] Open Messages tab
- [ ] **VERIFY**: Patient conversations appear
- [ ] Filter by status (all/waiting/active)
- [ ] Search conversations
- [ ] Click on a conversation
- [ ] **VERIFY**: Messages load
- [ ] Send reply to patient
- [ ] **VERIFY**: Message delivers instantly
- [ ] Close conversation
- [ ] **VERIFY**: Status changes to "closed"

#### AI Assistant
- [ ] Click AI Assistant button
- [ ] Ask "Show me patient encounters for patient 1"
- [ ] **VERIFY**: Gets structured response
- [ ] Try other queries

## 🔍 Error Scenarios to Test

### Profile Completion Errors
- [ ] Try to complete profile without phone number
- [ ] Try to submit with invalid data
- [ ] Check error messages are clear
- [ ] Verify form doesn't lose data on error

### Chat Errors
- [ ] Try to send empty message → Should be disabled
- [ ] Test with no internet → Should show error
- [ ] Test AI chat without Gemini key → Should fallback to demo mode

### Map Errors
- [ ] Deny location access → Should show mock data
- [ ] Test without internet → Should show error message
- [ ] Test in area with no hospitals → Should show "No locations found"

## 📊 Performance Checks

### Load Times
- [ ] Homepage loads < 2 seconds
- [ ] Dashboard loads < 3 seconds
- [ ] Chat messages appear instantly
- [ ] Map data loads < 5 seconds

### Real-Time Features
- [ ] Messages sync within 1 second
- [ ] Conversations update in real-time
- [ ] No page refresh needed

## 🎨 UI/UX Checks

### Mobile Responsiveness
- [ ] Test on mobile screen size
- [ ] Bottom navigation works
- [ ] Hamburger menu works
- [ ] Forms are usable on mobile
- [ ] Chat interface works on small screens

### Visual Consistency
- [ ] Helix purple color used consistently
- [ ] Buttons have hover states
- [ ] Loading spinners appear during operations
- [ ] Error messages are red and clear
- [ ] Success messages are green

## 🔐 Security Checks

### Authentication
- [ ] Can't access dashboard without login
- [ ] Sign out works properly
- [ ] Session persists on page refresh

### Data Protection
- [ ] Patient can only see their own data
- [ ] Doctor can't access without proper auth
- [ ] API keys not exposed in browser

## 📝 Known Working Features

### ✅ Verified Working
- AI Doctor Chat (uses `/api/ai/chat`)
- Real Doctor Chat (Firebase real-time)
- Find Healthcare Map (OpenStreetMap + Geolocation)
- Patient Profile (Firestore)
- Appointments (Dorra API)
- Authentication (Firebase Auth)
- Doctor Message Center (Firebase real-time)

### ⚠️ Recently Fixed
- Profile completion error handling
- Doctor sign-up disabled
- Better error messages

### 🚧 Known Limitations
- Doctor registration disabled (by design)
- Appointment booking requires Dorra API access
- AI chat requires Gemini API key (has fallback)
- Map requires geolocation permission (has fallback)

## 🎯 Testing Priority

### High Priority (Test First)
1. ✅ Doctor button disabled in sign-up
2. ✅ Profile completion works or shows clear errors
3. ✅ Real doctor chat messaging
4. ✅ AI chat responses

### Medium Priority
5. ✅ Map functionality
6. ✅ Appointment booking
7. ✅ Profile viewing
8. ✅ Authentication flow

### Low Priority (Nice to Have)
9. ✅ Mobile responsiveness
10. ✅ Error edge cases
11. ✅ Performance optimization
12. ✅ Visual polish

## 📊 Test Results Log

### Date: [Fill in when testing]

| Feature | Status | Notes |
|---------|--------|-------|
| Doctor sign-up disabled | ☐ Pass / ☐ Fail | |
| Profile completion | ☐ Pass / ☐ Fail | |
| AI chat | ☐ Pass / ☐ Fail | |
| Real doctor chat | ☐ Pass / ☐ Fail | |
| Map feature | ☐ Pass / ☐ Fail | |
| Appointments | ☐ Pass / ☐ Fail | |
| Doctor messages | ☐ Pass / ☐ Fail | |

---

**Note**: Check off items as you test them. Report any issues with details about what went wrong.



