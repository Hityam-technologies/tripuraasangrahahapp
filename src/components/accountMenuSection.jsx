import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * AccountMenuSection Component
 * 
 * Reusable grouped settings/account menu card:
 * - Rounded card container with subtle shadow & border
 * - Supports vector icons or custom asset images
 * - Uniform typography, chevron, and divider lines
 * - Real-world production modular design
 */
function AccountMenuSection({ items = [], containerStyle }) {
  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.sectionCard, containerStyle]}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.id || item.label || index}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={item.onPress}
              style={styles.itemRow}>
              {/* Leading icon, image, or custom node (e.g. profile avatar) */}
              <View style={styles.iconSlot}>
                {item.leading ? (
                  item.leading
                ) : item.iconImage ? (
                  <Image
                    source={item.iconImage}
                    style={styles.imageIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <Icon
                    name={item.iconName || 'chevron-forward'}
                    size={item.iconSize || 21}
                    color={item.iconColor || '#4A433A'}
                  />
                )}
              </View>

              {/* Item Label */}
              <Text style={styles.itemLabel}>{item.label}</Text>

              {item.badgeText ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badgeText}</Text>
                </View>
              ) : null}

              {/* Right Chevron */}
              <Icon name="chevron-forward" size={16} color="#B0A699" />
            </TouchableOpacity>

            {/* Row Divider (not after last item) */}
            {!isLast && <View style={styles.divider} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDE9E2',
    paddingVertical: 2,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  iconSlot: {
    minWidth: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  imageIcon: {
    width: 22,
    height: 22,
  },
  itemLabel: {
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14.5,
    color: '#161413',
    letterSpacing: -0.2,
  },
  badge: {
    backgroundColor: '#FDF2EB',
    borderWidth: 1,
    borderColor: '#F6D2BA',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    marginRight: 6,
  },
  badgeText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11.5,
    color: '#BF5B21',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0ECE4',
    marginLeft: 56,
    marginRight: 16,
  },
});

export default React.memo(AccountMenuSection);

