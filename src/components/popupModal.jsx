import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';

/**
 * PopupModal Component
 *
 * Luxury Tripura Sangrahah modal popup:
 * - Replaces standard OS Alert.alert
 * - Supports 1-button alerts and 2-button confirms (Cancel / OK, Remove / Cancel, etc.)
 * - Smooth fade and scale entrance/exit animations
 * - Elegant typography in Comfortaa and Manrope
 */
function PopupModal({
  visible,
  title,
  message,
  buttons = [],
  icon,
  type = 'default',
  cancelable = true,
  onDismiss,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const maxCardWidth = Math.min(360, screenWidth - 48);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 20,
          stiffness: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible, opacityAnim, scaleAnim]);

  if (!visible) return null;

  // Resolve icon based on type / destructive status
  const isDestructive =
    type === 'destructive' || buttons.some((b) => b.style === 'destructive');
  const isSuccess = type === 'success';

  // Use alert for errors; callers that mean "delete" should pass icon="trash-outline"
  const defaultIconName = isDestructive
    ? 'alert-circle-outline'
    : isSuccess
    ? 'checkmark-circle-outline'
    : 'information-circle-outline';

  const iconName = icon || defaultIconName;

  const iconColor = isDestructive
    ? '#C0392B'
    : isSuccess
    ? '#27AE60'
    : colours.saffron || '#BF5B21';

  const iconBg = isDestructive
    ? '#FDF0ED'
    : isSuccess
    ? '#EEF8F1'
    : '#FDF4EC';

  // Handle backdrop press
  const handleBackdropPress = () => {
    if (cancelable && onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={() => {
        if (cancelable && onDismiss) onDismiss();
      }}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.card,
                { width: maxCardWidth, transform: [{ scale: scaleAnim }] },
              ]}>
              {/* Icon Circle */}
              <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                <Icon name={iconName} size={26} color={iconColor} />
              </View>

              {/* Title */}
              {title ? <Text style={styles.title}>{title}</Text> : null}

              {/* Message */}
              {message ? <Text style={styles.message}>{message}</Text> : null}

              {/* Buttons Row */}
              <View
                style={[
                  styles.buttonsContainer,
                  buttons.length === 2 && styles.twoButtonsRow,
                ]}>
                {buttons.map((btn, index) => {
                  const isCancel = btn.style === 'cancel';
                  const isBtnDestructive = btn.style === 'destructive';

                  let btnStyle = styles.defaultBtn;
                  let textStyle = styles.defaultBtnText;

                  if (isCancel) {
                    btnStyle = styles.cancelBtn;
                    textStyle = styles.cancelBtnText;
                  } else if (isBtnDestructive) {
                    btnStyle = styles.destructiveBtn;
                    textStyle = styles.destructiveBtnText;
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.82}
                      onPress={() => {
                        onDismiss?.();
                        btn.onPress?.();
                      }}
                      style={[
                        styles.buttonBase,
                        buttons.length === 2 && styles.halfButton,
                        btnStyle,
                      ]}>
                      <Text style={[styles.buttonTextBase, textStyle]}>
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 12,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 16.5,
    color: '#161413',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  message: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: 12.5,
    color: '#6E675D',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 10,
  },
  twoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonBase: {
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  halfButton: {
    flex: 1,
  },
  buttonTextBase: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 12.5,
    letterSpacing: 0.2,
  },
  defaultBtn: {
    backgroundColor: colours.saffron || '#BF5B21',
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultBtnText: {
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: '#F7F5F0',
    borderWidth: 1,
    borderColor: '#E8E2D6',
  },
  cancelBtnText: {
    color: '#5E564B',
  },
  destructiveBtn: {
    backgroundColor: '#C0392B',
    shadowColor: '#C0392B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
    elevation: 3,
  },
  destructiveBtnText: {
    color: '#FFFFFF',
  },
});

export default React.memo(PopupModal);
