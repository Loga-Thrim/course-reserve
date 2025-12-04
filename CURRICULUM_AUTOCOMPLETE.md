# Curriculum Autocomplete Feature

## Overview
Added autocomplete/suggestion functionality for curriculum fields (หลักสูตร) in the course registration form. Users can now select from previously entered curriculum values instead of retyping them.

## Features

### 1. **Autocomplete Suggestions**
- When users start typing in the curriculum field, they see a dropdown list of existing curriculum values
- Suggestions are fetched from all previously registered courses in the database
- Users can still type new values if needed

### 2. **Auto-Fill Both Languages**
- When a user selects a Thai curriculum from suggestions, the English curriculum is automatically filled
- When a user selects an English curriculum from suggestions, the Thai curriculum is automatically filled
- This prevents inconsistency and saves time

### 3. **Real-time Updates**
- After creating or updating a course, the curriculum suggestions list is automatically refreshed
- New curriculum values are immediately available for future courses

## Implementation Details

### Backend

#### New Endpoint
**GET** `/api/professor/course-registration/curriculums`

Returns an array of distinct curriculum pairs:
```json
[
  {
    "curriculum_th": "วิทยาศาสตร์คอมพิวเตอร์",
    "curriculum_en": "Computer Science"
  },
  {
    "curriculum_th": "วิศวกรรมซอฟต์แวร์",
    "curriculum_en": "Software Engineering"
  }
]
```

#### Controller Method
- `getCurriculums()` - Queries the database for distinct curriculum_th and curriculum_en pairs
- Orders results alphabetically by Thai curriculum name

### Frontend

#### State Management
- `curriculums` - Stores the list of curriculum suggestions
- Fetched on component mount and after creating/updating courses

#### HTML Datalist
Uses the native HTML `<datalist>` element which provides:
- Native autocomplete dropdown
- Ability to type custom values
- Cross-browser compatibility
- No external dependencies

#### Auto-fill Logic
When a user selects from the dropdown:
1. System checks if the selected value matches an existing curriculum
2. If match found, automatically fills the corresponding language field
3. If no match (user typed new value), only updates the current field

## User Experience

### Typing New Curriculum
1. User clicks on curriculum field (Thai or English)
2. Dropdown appears with existing suggestions
3. User can:
   - Select from dropdown → Both languages auto-filled
   - Type new value → Only current field filled
   - Type partially and select → Both languages auto-filled

### Example Workflow
```
User Action: Clicks "หลักสูตร (ไทย)" field
System: Shows dropdown with ["วิทยาศาสตร์คอมพิวเตอร์", "วิศวกรรมซอฟต์แวร์"]

User Action: Selects "วิทยาศาสตร์คอมพิวเตอร์"
System: Auto-fills "Computer Science" in English field

✅ Both fields filled with one selection!
```

## Benefits

1. **Time Saving** - No need to retype curriculum names repeatedly
2. **Consistency** - Ensures curriculum names are spelled consistently across courses
3. **Error Prevention** - Reduces typos and spelling mistakes
4. **Bilingual Sync** - Keeps Thai and English names paired correctly
5. **Flexibility** - Still allows entering new curriculum values when needed

## Code Files Changed

### Backend
- `/backend/src/controllers/professor/courseRegistrationController.js` - Added `getCurriculums()` method
- `/backend/src/routes/professor.js` - Added curriculum endpoint route

### Frontend
- `/frontend/src/lib/professorApi.js` - Added `getCurriculums()` API method
- `/frontend/src/app/professor/course-registration/page.js`:
  - Added `curriculums` state
  - Added `fetchCurriculums()` function
  - Updated curriculum input fields to use `<datalist>`
  - Enhanced `handleInputChange()` with auto-fill logic
  - Refresh curriculums after save

## Browser Support

The `<datalist>` element is supported by:
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari 12.1+
- ✅ Mobile browsers

## Future Enhancements

Potential improvements:
1. Add visual indicator when auto-fill occurs
2. Show curriculum count in dropdown
3. Add ability to edit/merge duplicate curriculums
4. Implement fuzzy search for better matching
