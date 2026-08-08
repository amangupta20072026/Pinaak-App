import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';

import {
  Colors,
  Dimensions,
  Spacing,
  Typography,
} from '../../theme';

const SplashScreen = (): React.JSX.Element => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.content}>

        {/* Logo */}
        <Animated.View
          entering={FadeIn.duration(700)}
          style={styles.logoContainer}
        >
          <Image
            source={require('../../assets/icons/uc-icon.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Urban Cruise logo"
          />
        </Animated.View>

        {/* Brand */}
        <Animated.Text
          entering={FadeInUp.delay(250).duration(600)}
          style={styles.brandName}
        >
          Urban Cruise
        </Animated.Text>

        {/* Tagline */}
        <Animated.View
          entering={FadeInUp.delay(450).duration(600)}
          style={styles.taglineContainer}
        >
          <Text style={styles.tagline}>
            India's Most Preferred
          </Text>

          <Text style={styles.tagline}>
            Bus Rental Services
          </Text>
        </Animated.View>

      </View>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.delay(650).duration(600)}
        style={styles.footer}
      >
        <Text style={styles.loadingText}>
          Loading...
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Dimensions.screenHorizontalPadding,
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: Dimensions.splashLogo,
    height: Dimensions.splashLogo,
  },

  brandName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.xxl,
    textAlign: 'center',
  },

  taglineContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },

  tagline: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xxl,
  },

  loadingText: {
    ...Typography.bodySmall,
    color: Colors.primary,
  },
});

export default SplashScreen;