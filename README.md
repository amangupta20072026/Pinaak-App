# Pinaak-App — File & Folder Structure

Complete file and folder structure of the [`amangupta20072026/Pinaak-App`](https://github.com/amangupta20072026/Pinaak-App) repository.

Excludes `node_modules/`, `.git/`, and other generated/ignored paths.

```
Pinaak-App/
├── .bundle/
│   └── config
├── .eslintrc.js
├── .gitignore
├── .prettierrc.js
├── .watchmanconfig
├── App.tsx
├── Gemfile
├── README.md
├── app.json
├── babel.config.js
├── bootstrap.ts
├── index.js
├── initNetworkListener.ts
├── initPushNotifications.ts
├── initSentry.ts
├── jest.config.js
├── metro.config.js
├── package-lock.json
├── package.json
├── tsconfig.json
│
├── __tests__/
│   └── App.test.tsx
│
├── android/
│   ├── build.gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   ├── settings.gradle
│   ├── app/
│   │   ├── build.gradle
│   │   ├── debug.keystore
│   │   ├── proguard-rules.pro
│   │   └── src/
│   │       └── main/
│   │           ├── AndroidManifest.xml
│   │           ├── java/
│   │           │   └── com/
│   │           │       └── pinaak/
│   │           │           ├── MainActivity.kt
│   │           │           └── MainApplication.kt
│   │           └── res/
│   │               ├── drawable/
│   │               │   └── rn_edit_text_material.xml
│   │               ├── mipmap-hdpi/
│   │               │   ├── ic_launcher.png
│   │               │   └── ic_launcher_round.png
│   │               ├── mipmap-mdpi/
│   │               │   ├── ic_launcher.png
│   │               │   └── ic_launcher_round.png
│   │               ├── mipmap-xhdpi/
│   │               │   ├── ic_launcher.png
│   │               │   └── ic_launcher_round.png
│   │               ├── mipmap-xxhdpi/
│   │               │   ├── ic_launcher.png
│   │               │   └── ic_launcher_round.png
│   │               ├── mipmap-xxxhdpi/
│   │               │   ├── ic_launcher.png
│   │               │   └── ic_launcher_round.png
│   │               └── values/
│   │                   ├── strings.xml
│   │                   └── styles.xml
│   └── gradle/
│       └── wrapper/
│           ├── gradle-wrapper.jar
│           └── gradle-wrapper.properties
│
├── ios/
│   ├── .xcode.env
│   ├── Podfile
│   ├── pinaak/
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist
│   │   ├── LaunchScreen.storyboard
│   │   ├── PrivacyInfo.xcprivacy
│   │   └── Images.xcassets/
│   │       ├── Contents.json
│   │       └── AppIcon.appiconset/
│   │           └── Contents.json
│   └── pinaak.xcodeproj/
│       ├── project.pbxproj
│       └── xcshareddata/
│           └── xcschemes/
│               └── pinaak.xcscheme
│
└── src/
    ├── api/
    │   ├── apiClient.ts
    │   ├── apiEndpoints.ts
    │   ├── authInterceptor.ts
    │   ├── axios.ts
    │   ├── errorInterceptor.ts
    │   ├── interceptor.ts
    │   ├── network.ts
    │   └── refreshToken.ts
    │
    ├── app/
    │   ├── AppProvider.tsx
    │   ├── Bootstrap.tsx
    │   ├── RoleResolver.tsx
    │   └── index.tsx
    │
    ├── assets/
    │   └── icons/
    │       ├── uc-icon.png
    │       ├── ucwithdesignandtext.png
    │       └── ucwithtext.png
    │
    ├── config/
    │   ├── env.ts
    │   ├── featureFlags.ts
    │   ├── firebase.ts
    │   ├── maps.ts
    │   └── razorpay.ts
    │
    ├── constants/
    │   ├── icons.ts
    │   ├── images.ts
    │   ├── regex.ts
    │   ├── roles.ts
    │   └── routes.ts
    │
    ├── hooks/
    │   ├── useAppStateListener.ts
    │   ├── useAuth.ts
    │   ├── useDebounce.ts
    │   ├── useLocation.ts
    │   ├── useNetwork.ts
    │   ├── useNetworkStatus.ts
    │   ├── useNotification.ts
    │   └── usePermission.ts
    │
    ├── localization/
    │   ├── en.json
    │   ├── hi.json
    │   └── i18n.ts
    │
    ├── navigation/
    │   ├── AuthNavigator.tsx
    │   ├── CustomerNavigator.tsx
    │   ├── DriverNavigator.tsx
    │   ├── NavigationService.ts
    │   ├── RootNavigator.tsx
    │   └── VendorNavigator.tsx
    │
    ├── scripts/
    │   ├── bump-version.js
    │   ├── enerate-app-icons.js
    │   └── generate-component.js
    │
    ├── services/
    │   ├── fcmService.ts
    │   ├── analytics/
    │   │   └── analyticsService.ts
    │   ├── camera/
    │   │   └── cameraService.ts
    │   ├── crashReporting/
    │   │   └── sentry.ts
    │   ├── location/
    │   │   └── locationService.ts
    │   └── storage/
    │       ├── mmkv.ts
    │       └── secureStorage.ts
    │
    ├── store/
    │   ├── index.ts
    │   ├── logger.ts
    │   ├── middleware.ts
    │   ├── persist.ts
    │   └── rootReducer.ts
    │
    ├── theme/
    │   ├── colors.ts
    │   ├── fonts.ts
    │   ├── index.ts
    │   ├── radius.ts
    │   ├── shadow.ts
    │   ├── spacing.ts
    │   └── typography.ts
    │
    ├── types/
    │   ├── api.d.ts
    │   ├── api.ts
    │   ├── booking.ts
    │   ├── customer.ts
    │   ├── driver.ts
    │   ├── notification.ts
    │   ├── payment.ts
    │   ├── quotation.ts
    │   └── vendor.ts
    │
    ├── utils/
    │   ├── dateUtils.ts
    │   ├── file.ts
    │   ├── formatters.ts
    │   ├── image.ts
    │   └── validators.ts
    │
    └── validation/
        ├── authSchema.ts
        └── bookingSchema.ts
```

## Summary

| Category                              | Count                                                          |
| ------------------------------------- | -------------------------------------------------------------- |
| Directories                           | 41                                                             |
| Files (excluding lockfile & binaries) | ~110                                                           |
| Top-level folders                     | `__tests__/`, `android/`, `ios/`, `src/`, `.bundle/` |

### Notes

- Root `.ts` files (`bootstrap.ts`, `initNetworkListener.ts`, `initPushNotifications.ts`, `initSentry.ts`) are entry-point stubs.
- Most files under `src/` are empty scaffolding — folder architecture is in place but implementation is pending.
- Only `src/config/env.ts` currently contains meaningful code inside `src/`.
- `src/scripts/enerate-app-icons.js` has a typo in its filename (missing leading `g`).
