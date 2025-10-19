# Survey Application Testing Guide

## 🚀 Quick Start Testing

### **Application URLs:**

- **Survey Landing**: http://localhost:3001/
- **Admin Login**: http://localhost:3001/admin/login
- **Database GUI**: http://localhost:5555 (Prisma Studio)

## 🔐 **Admin Testing:**

### **Admin Credentials:**

- **Email**: `admin@example.com`
- **Password**: `admin123`

### **Admin Features to Test:**

1. **Login**: Use credentials above
2. **Dashboard**: View real statistics (4 invites, 5 responses)
3. **Navigation**: Use tabs to switch between sections
4. **Data Export**: Download Excel/CSV from Responses page
5. **Logout**: Click User icon → "Sign Out"

## 📧 **Survey Participant Testing:**

### **Test Participants (Whitelisted Emails):**

#### **Teachers Group:**

- **Email**: `teacher@example.com`
- **Questions**: 3 questions about classroom technology and AI teaching
- **Sample Question**: "How do you currently use technology in your classrooms?"

#### **Students Group:**

- **Email**: `student@example.com`
- **Questions**: 3 questions about AI tool usage and perceptions
- **Sample Question**: "How often do you use AI tools like ChatGPT for schoolwork?"

#### **Administrators Group:**

- **Email**: `admin@example.com`
- **Questions**: 1 question about district AI policies
- **Sample Question**: "What is the district's current stance on AI in education?"

#### **IT Admins Group:**

- **Email**: `it@example.com`
- **Questions**: 1 question about infrastructure readiness
- **Sample Question**: "What is the current state of your technological infrastructure?"

## 🔐 **OTP Testing Process:**

### **Step-by-Step Survey Flow:**

1. **🏠 Go to**: http://localhost:3001/
2. **📧 Enter Email**: Use any test email above
3. **📨 Request Code**: Click "Request Access Code"
4. **🔍 Find Code**: Look for blue development box with OTP code
5. **🔐 Enter Code**:
   - Type manually OR click "Auto-fill Code" button
   - Use "Clear" button to re-enter if needed
6. **✅ Consent**: Check the consent checkbox
7. **📋 Survey**: Answer questions (different for each group!)
8. **🎉 Success**: Complete survey and see confirmation

### **Development Features:**

- **Auto-fill Button**: Automatically fills the development OTP code
- **Clear Button**: Clears OTP input for re-entry
- **Visual Code Display**: Blue box shows current development code
- **Group-Specific Questions**: Different questions based on user's stakeholder group

## 🧪 **Testing Scenarios:**

### **Happy Path Testing:**

- ✅ Complete survey flow for each stakeholder group
- ✅ Admin login and dashboard navigation
- ✅ Data export functionality (Excel/CSV)
- ✅ OTP generation and verification

### **Error Testing:**

- ❌ Invalid email addresses (should be rejected)
- ❌ Wrong OTP codes (should show error)
- ❌ Unauthorized admin access (should redirect to login)
- ❌ Missing consent (should prevent survey access)

### **Security Testing:**

- 🛡️ Admin logout clears session
- 🛡️ Survey data is anonymized in exports
- 🛡️ OTP codes expire after 10 minutes
- 🛡️ Rate limiting prevents abuse

## 📊 **Current Test Data:**

### **Database Contents:**

- **4 Invited Users**: One for each stakeholder group
- **4 Survey Versions**: Tailored questions per group
- **5 Survey Responses**: Sample responses for analytics
- **1 Admin User**: For dashboard management

### **Sample Export Data:**

```csv
participantId,group,surveyVersion,submittedAt,q1_ai_use,q2_cheating_perception
bdffc5fe32e2f43e,Students,v1.0-Students,2025-10-15T03:58:44.460Z,I use AI tools daily...,Always helpful
```

## 🎯 **Testing Checklist:**

### **Survey Flow:**

- [ ] Landing page loads correctly
- [ ] Email validation works
- [ ] OTP request generates code
- [ ] OTP verification with consent works
- [ ] Survey loads with correct questions for user's group
- [ ] Question navigation works (Next/Back)
- [ ] Survey submission completes successfully

### **Admin Interface:**

- [ ] Admin login works with correct credentials
- [ ] Dashboard shows real statistics
- [ ] Navigation between admin sections works
- [ ] User management interface loads
- [ ] Data export downloads files
- [ ] Logout functionality works

### **Security & Privacy:**

- [ ] Invalid emails are rejected
- [ ] Wrong OTP codes are rejected
- [ ] Admin routes require authentication
- [ ] Exported data is anonymized
- [ ] Sessions expire appropriately

## 🔧 **Development Commands:**

```bash
# Start application
npm run dev

# Run tests
npm test

# View database
npm run db:studio

# Reset database (if needed)
npm run db:reset && npm run db:seed

# Create test responses
npx tsx src/scripts/create-test-responses.ts
```

## 🎉 **Ready for Research!**

Your survey application is now fully functional and ready to collect real data for the "No Concept Left Behind" research project. Each stakeholder group will see questions tailored to their role and expertise in education.
