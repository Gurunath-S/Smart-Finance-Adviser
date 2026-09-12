# Smart Finance Adviser - Mobile Application (React Native / Expo)

A production-quality, modern mobile application built with **React Native**, **Expo SDK 57**, and **TypeScript** for the Smart Finance Adviser platform.

The mobile application connects directly to the existing **Node.js / Express / MongoDB** backend REST APIs running on port 5000, adhering strictly to the backend as the single source of truth for authentication, transactions, AI wealth suggestions, and user data.

---

## 🚀 Key Features

### 1. 🔐 Authentication & Session Security
* **JWT Token Storage**: Persisted securely using hardware-backed `expo-secure-store`.
* **Auto Session Recovery**: Seamless auto-login on app launch with token validation.
* **Auto-Logout on 401**: Interceptor flushes expired tokens and resets navigation stack.
* **Dual Login Support**: Sign in using either username or email address.

### 2. 📊 Executive Dashboard
* **Dynamic Net Balance**: Indian Rupee (`₹`) formatted summary with positive/negative tracking.
* **Income vs. Expense Breakdown**: Monthly metrics with savings rate % and expense ratio %.
* **Interactive Financial Flow Bar Chart**: Visualizes cash inflows vs. outflows.
* **Recent 5 Transactions**: Quick view of recent income and expense items.
* **Quick Action FAB**: Instant bottom sheet modal for recording quick income or expense transactions.
* **Pull-to-Refresh**: Real-time sync with backend database.

### 3. 💸 Transaction Passbook & Ledger
* **Unified Feed**: Combines incomes and expenses into a single chronologically sorted ledger.
* **Instant Filtering**: Switch between `All`, `Incomes (₹)`, and `Expenses (₹)`.
* **Search by Keyword**: Filter by title or description in real time.
* **Date Range Filter**: Filter records by `All Time`, `This Month`, or `Last 30 Days`.
* **Swipe-to-Delete / Confirm**: Dialog to delete records with optimistic state update.

### 4. ➕ Dedicated Income & Expense Tracking
* Modal and full-screen transaction entry forms.
* **Presets & Categorization**:
  * Incomes: `Salary`, `Freelancing`, `Investments`, `Stocks`, `Bitcoin`, `Bank Transfer`, `YouTube`, `Other`.
  * Expenses: `Education`, `Groceries`, `Health`, `Subscriptions`, `Takeaways`, `Clothing`, `Travelling`, `Other`.
* Dynamic date picker (ISO formatted), category selector chips, and notes.

### 5. 🤖 AI Financial Advisor & Wealth Engine
* Direct consumption of backend AI endpoint (`POST /api/v1/get-suggestions`).
* Generates actionable financial advice based on current balance, total income, and total expenses.
* **Save to Database**: Save AI advice to MongoDB (`POST /api/v1/saveSuggestions`).
* **History Feed**: Inspect previously generated advisory plans (`GET /api/v1/get-saved-suggestions`).

### 6. 🧮 6 Interactive Financial Calculators (with Growth Curves)
* **SIP Calculator**: Systematic Investment Plan monthly compound returns with visual projection chart.
* **SWP Calculator**: Systematic Withdrawal Plan depletion, monthly payout, and residual balance.
* **FD Calculator**: Fixed Deposit quarterly compounding and maturity amount.
* **Mutual Fund Calculator**: Lumpsum CAGR capital appreciation.
* **PPF Calculator**: Public Provident Fund 15–30 year tax-free compound growth.
* **Gold Calculator**: Sovereign Gold Bonds & physical bullion long-term value estimation.

### 7. 👤 Profile & App Settings
* **Cloudinary Avatar Upload**: Choose photos from gallery via `expo-image-picker` (`PUT /api/users/update-profile-image`).
* **Dynamic API Switcher**: Change backend endpoint without rebuilding (ideal for switching between Android emulator `10.0.2.2`, iOS simulator `localhost`, or LAN IP).
* **Test Connection**: Real-time ping button to test server reachability.
* **Secure Logout**: Clears SecureStore tokens and resets auth context.

---

## 🛠 Tech Stack

* **Framework**: React Native 0.81.5 / Expo SDK 57
* **Language**: TypeScript 5.8 (Strict Mode)
* **Navigation**: React Navigation 7 (Native Stack + Bottom Tabs)
* **API Client**: Axios 1.8 with custom interceptors and dynamic base URL switching
* **Storage**: `expo-secure-store`
* **Charts & Graphics**: `react-native-chart-kit` and `react-native-svg`
* **Image Picker**: `expo-image-picker`
* **Icons**: `@expo/vector-icons` (Ionicons)
* **Sliders**: `@react-native-community/slider`

---

## 📁 Directory Structure

```text
mobile/
├── App.tsx                        # Root entry component (SafeArea, AuthProvider, Navigators)
├── app.json                       # Expo configuration
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config with '@/*' aliases
├── .env.example                   # Template environment variables
├── .env                           # Local environment config
└── src/
    ├── theme/                     # Design tokens (Colors, Typography, Spacing, Shadows)
    │   ├── colors.ts
    │   ├── typography.ts
    │   ├── spacing.ts
    │   └── theme.ts
    ├── types/                     # Shared TypeScript interfaces
    │   └── index.ts
    ├── utils/                     # Formatting & validation helpers
    │   ├── currency.ts            # Indian Rupee (₹) numbering formatter
    │   ├── date.ts                # Date formatting (Today, Yesterday, DD MMM YYYY)
    │   └── validation.ts
    ├── services/                  # Backend REST API services
    │   ├── api.ts                 # Central Axios instance + SecureStore interceptor
    │   ├── authService.ts         # Login / Signup / Token storage
    │   ├── incomeService.ts       # Get, Add, Delete Incomes
    │   ├── expenseService.ts      # Get, Add, Delete Expenses
    │   ├── transactionService.ts  # Aggregated metrics & unified ledger
    │   ├── suggestionService.ts   # AI suggestions & history
    │   └── userService.ts         # Profile avatar update via Cloudinary
    ├── context/
    │   └── AuthContext.tsx        # Global auth & user state
    ├── hooks/
    │   ├── useAuth.ts             # Auth hook
    │   └── useTransactions.ts     # Incomes/Expenses query, mutation, & refresh hook
    ├── components/
    │   ├── common/                # Buttons, Inputs, Skeletons, FAB, Errors
    │   ├── cards/                 # BalanceCard, FinancialCard, SuggestionCard, etc.
    │   ├── forms/                 # CategoryPicker, QuickTransactionModal
    │   ├── calculators/           # CalculatorSlider
    │   └── charts/                # IncomeExpenseChart, GrowthChart
    ├── screens/
    │   ├── auth/                  # LoginScreen, SignupScreen
    │   ├── dashboard/             # DashboardScreen
    │   ├── income/                # IncomeScreen, AddIncomeScreen
    │   ├── expenses/              # ExpensesScreen, AddExpenseScreen
    │   ├── transactions/          # TransactionsScreen (Passbook)
    │   ├── suggestions/           # SuggestionsScreen (AI Advisor)
    │   ├── calculators/           # Hub + 6 Calculator screens
    │   └── profile/               # ProfileScreen & Server Switcher
    └── navigation/
        ├── AuthNavigator.tsx      # Login ↔ Signup stack
        ├── TabNavigator.tsx       # 4-tab bottom navigation
        ├── AppNavigator.tsx       # Main authenticated stack & modals
        └── RootNavigator.tsx      # Auth gate & splash loading
```

---

## ⚙️ Environment Setup & Configuration

### Backend URL Configuration

The backend runs on `http://localhost:5000` by default. Depending on where you run the mobile app:

| Platform | Recommended Base URL |
| :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:5000/api` |
| **iOS Simulator** | `http://localhost:5000/api` |
| **Physical Device (Expo Go via Wi-Fi)** | `http://<YOUR_LOCAL_IP>:5000/api` (e.g. `http://192.168.1.50:5000/api`) |

Create a `.env` file inside `mobile/`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

> **Tip**: You can also change the API endpoint at runtime inside the app without rebuilding! Go to **Profile Tab -> Backend Server Endpoint** to edit and test the server connection live.

---

## 🏃 Running the Application

### 1. Ensure Backend is Running
In the root project directory:
```bash
cd backend
npm run dev
# Backend server runs on http://localhost:5000
```

### 2. Start the Expo Development Server
In another terminal:
```bash
cd mobile
npm start
```

### 3. Launch on Target Platform
* **Android Emulator**: Press `a` in the Expo terminal.
* **iOS Simulator**: Press `i` in the Expo terminal (macOS only).
* **Physical Device (Expo Go)**: Scan the QR code using the Expo Go app on your phone.
* **Web Preview**: Press `w` in the Expo terminal.

---

## 🧪 Verification & Typechecking

To verify TypeScript correctness across all components, screens, and services:

```bash
cd mobile
npx tsc --noEmit
```
*(Should exit with 0 errors)*
