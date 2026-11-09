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
              {/* Icon Container */}
              <View style={styles.iconCircle}>
                {item.iconImage ? (
                  <Image
                    source={item.iconImage}
                    style={styles.imageIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <Icon
                    name={item.iconName || 'chevron-forward'}
                    size={item.iconSize || 17}
                    color={item.iconColor || '#70685E'}
                  />
                )}
              </View>

              {/* Item Label */}
              <Text style={styles.itemLabel}>{item.label}</Text>

              {/* Right Chevron */}
              <Icon name="chevron-forward" size={15} color="#A59B8F" />
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
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF8F4',
    borderWidth: 1,
    borderColor: '#EFEAE0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  imageIcon: {
    width: 18,
    height: 18,
  },
  itemLabel: {
    flex: 1,
    fontFamily: 'Comfortaa-Bold',
    fontSize: 13.5,
    color: '#161413',
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0ECE4',
    marginLeft: 58,
    marginRight: 14,
  },
});

export default React.memo(AccountMenuSection);

