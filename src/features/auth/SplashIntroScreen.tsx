/**
 * ------------------------------------------------------------------
 * SplashIntroScreen
 * ------------------------------------------------------------------
 *
 * Animation sequence:
 *
 * 1. UC logo slides in from the right.
 * 2. Logo fades/scales into its final position.
 * 3. "Urban Cruise" appears character-by-character.
 * 4. Small hold.
 * 5. Replace Splash with Onboarding.
 *
 * No deprecated SafeAreaView is used.
 * ------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '../../theme';
import type { OnboardingParamList } from '../../navigation/types';

/* ------------------------------------------------------------------
 * Assets
 * ------------------------------------------------------------------ */

const UC_ICON = require('../../assets/icons/uc-icon.png');

/* ------------------------------------------------------------------
 * Animation configuration
 * ------------------------------------------------------------------ */

const ICON_SLIDE_MS = 750;

const TEXT_START_DELAY_MS = 650;

const TYPEWRITER_INTERVAL_MS = 95;

const HOLD_AFTER_TYPING_MS = 750;

const OFFSCREEN_X = 420;

/*
 * The complete text that will be typed.
 */
const WORDMARK = 'Urban Cruise';

type SplashNavProp = NativeStackNavigationProp<
  OnboardingParamList,
  'Splash'
>;

/* ------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------ */

const SplashIntroScreen: React.FC = () => {
  const navigation = useNavigation<SplashNavProp>();

  /*
   * Logo animation values.
   */
  const iconX = useSharedValue(OFFSCREEN_X);
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.88);

  /*
   * Text container animation.
   */
  const textOpacity = useSharedValue(1);

  /*
   * Typewriter state.
   *
   * Example:
   *
   * ""
   * "U"
   * "Ur"
   * "Urb"
   * "Urba"
   * "Urban"
   * "Urban "
   * "Urban C"
   * ...
   */
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let mounted = true;

    /*
     * --------------------------------------------------------------
     * 1. Animate UC logo
     * --------------------------------------------------------------
     */

    iconX.value = withTiming(0, {
      duration: ICON_SLIDE_MS,
      easing: Easing.out(Easing.cubic),
    });

    iconOpacity.value = withTiming(1, {
      duration: ICON_SLIDE_MS,
      easing: Easing.out(Easing.cubic),
    });

    iconScale.value = withTiming(1, {
      duration: ICON_SLIDE_MS,
      easing: Easing.out(Easing.back(1.15)),
    });

    /*
     * --------------------------------------------------------------
     * 2. Start typewriter
     * --------------------------------------------------------------
     */

    const typewriterTimeout = setTimeout(() => {
      if (!mounted) {
        return;
      }

      let currentIndex = 0;

      const typewriterInterval = setInterval(() => {
        if (!mounted) {
          clearInterval(typewriterInterval);
          return;
        }

        currentIndex += 1;

        setTypedText(
          WORDMARK.substring(0, currentIndex),
        );

        /*
         * Finished typing.
         */
        if (currentIndex >= WORDMARK.length) {
          clearInterval(typewriterInterval);

          /*
           * --------------------------------------------------------
           * 3. Hold after typing
           * --------------------------------------------------------
           */

          setTimeout(() => {
            if (!mounted) {
              return;
            }

            /*
             * Replace instead of navigate/push.
             *
             * User cannot go back to splash.
             */
            navigation.replace('Onboarding');
          }, HOLD_AFTER_TYPING_MS);
        }
      }, TYPEWRITER_INTERVAL_MS);
    }, TEXT_START_DELAY_MS);

    /*
     * Cleanup.
     */
    return () => {
      mounted = false;
      clearTimeout(typewriterTimeout);
    };

    // Animation intentionally starts once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * --------------------------------------------------------------
   * Logo animated style
   * --------------------------------------------------------------
   */

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: iconX.value,
      },
      {
        scale: iconScale.value,
      },
    ],
    opacity: iconOpacity.value,
  }));

  /*
   * --------------------------------------------------------------
   * Wordmark animated style
   * --------------------------------------------------------------
   */

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  /*
   * --------------------------------------------------------------
   * Split typed text into Urban / Cruise.
   *
   * This allows:
   *
   * Urban  -> dark text
   * Cruise -> brand green
   * --------------------------------------------------------------
   */

  const urbanText = typedText.substring(
    0,
    Math.min(5, typedText.length),
  );

  const cruiseText =
    typedText.length > 6
      ? typedText.substring(6)
      : '';

  return (
    <View style={styles.flex}>
      <View style={styles.center}>
        {/* --------------------------------------------------------
         * UC LOGO
         * -------------------------------------------------------- */}

        <Animated.View style={iconStyle}>
          <Image
            source={UC_ICON}
            style={styles.icon}
            resizeMode="contain"
            accessible
            accessibilityRole="image"
            accessibilityLabel="Urban Cruise"
          />
        </Animated.View>

        {/* --------------------------------------------------------
         * TYPEWRITER WORDMARK
         * -------------------------------------------------------- */}

        <Animated.View
          style={[
            styles.wordmarkContainer,
            textStyle,
          ]}
        >
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkUrban}>
              {urbanText}
            </Text>

            {typedText.length > 5 && (
              <Text style={styles.space}>
                {' '}
              </Text>
            )}

            <Text style={styles.wordmarkCruise}>
              {cruiseText}
            </Text>

            {/* Cursor */}
            {/* {typedText.length < WORDMARK.length && (
              <Text style={styles.cursor}>
                |
              </Text>
            )} */}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default SplashIntroScreen;

/* ------------------------------------------------------------------
 * Styles
 * ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 170,
    height: 170,
    marginBottom: -45,
  },

  wordmarkContainer: {
    minHeight: 42,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  wordmark: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  wordmarkUrban: {
    color: Colors.textPrimary,
  },

  wordmarkCruise: {
    color: Colors.primary,
  },

  space: {
    color: Colors.textPrimary,
  },

//   cursor: {
//     color: Colors.primary,
//     fontWeight: '400',
//   },
});