import { useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  shoppingList,
  StoreSection,
  ShoppingItem,
  getTotalPrice,
  getCheckedCount,
  getTotalCount,
} from '../data/shoppingData';
import { colors, fonts, spacing } from '../theme';
import { ShoppingListNavigationProp } from '../navigation/types';

export function ShoppingListScreen() {
  const navigation = useNavigation<ShoppingListNavigationProp>();
  const [sections, setSections] = useState<StoreSection[]>(shoppingList);

  const totalPrice = getTotalPrice(sections);
  const checkedCount = getCheckedCount(sections);
  const totalCount = getTotalCount(sections);
  const allDone = checkedCount === totalCount;

  const toggleItem = useCallback((sectionIdx: number, itemId: string) => {
    setSections((prev) =>
      prev.map((section, i) => {
        if (i !== sectionIdx) return section;
        return {
          ...section,
          items: section.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      })
    );
  }, []);

  const handleAllDone = () => {
    Alert.alert(
      'Godt klaret! 🎉',
      'Alle varer er købt. God fornøjelse med madlavningen!',
      [
        {
          text: 'Gå til forsiden',
          onPress: () => navigation.navigate('Home'),
          style: 'default',
        },
      ]
    );
  };

  const storeTotal = (section: StoreSection) =>
    section.items.reduce((sum, item) => sum + item.price, 0);

  const storeChecked = (section: StoreSection) =>
    section.items.filter((i) => i.checked).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Tilbage</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Indkøbsliste</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{checkedCount}/{totalCount}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalCount} varer</Text>
            <Text style={styles.summaryLabel}>i alt</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{sections.length} butikker</Text>
            <Text style={styles.summaryLabel}>at besøge</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.green }]}>
              {totalPrice.toFixed(2).replace('.', ',')} kr
            </Text>
            <Text style={styles.summaryLabel}>samlet pris</Text>
          </View>
        </View>

        {/* Store sections */}
        {sections.map((section, sectionIdx) => {
          const checked = storeChecked(section);
          const sectionDone = checked === section.items.length;

          return (
            <View key={section.store} style={styles.storeSection}>
              {/* Store header */}
              <View style={[styles.storeHeader, sectionDone && styles.storeHeaderDone]}>
                <Text style={styles.storeEmoji}>{section.emoji}</Text>
                <View style={styles.storeHeaderText}>
                  <Text style={[styles.storeName, sectionDone && styles.storeNameDone]}>
                    {section.store}
                  </Text>
                  <Text style={styles.storeInfo}>
                    {checked}/{section.items.length} varer ·{' '}
                    <Text style={styles.storePrice}>
                      {storeTotal(section).toFixed(2).replace('.', ',')} kr
                    </Text>
                  </Text>
                </View>
                {sectionDone && <Text style={styles.doneCheckmark}>✓</Text>}
              </View>

              {/* Items */}
              <View style={styles.itemsList}>
                {section.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemRow, item.checked && styles.itemRowChecked]}
                    onPress={() => toggleItem(sectionIdx, item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                      {item.checked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemDish}>{item.dish}</Text>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={[styles.itemQuantity, item.checked && styles.itemTextChecked]}>
                        {item.quantity}
                      </Text>
                      <Text style={[styles.itemPrice, item.checked && styles.itemTextChecked]}>
                        {item.price.toFixed(2).replace('.', ',')} kr
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.ctaButton, !allDone && styles.ctaButtonDisabled]}
          onPress={handleAllDone}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {allDone ? '🎉  Alt er købt!' : `${checkedCount} af ${totalCount} varer afkrydset`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: spacing.sm,
  },
  backArrow: {
    fontFamily: fonts.regular,
    fontSize: 20,
    color: colors.red,
    lineHeight: 22,
  },
  backLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.red,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  progressBadge: {
    backgroundColor: colors.greyLight,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  progressText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.grey,
  },

  // Progress bar
  progressBarTrack: {
    height: 4,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: colors.green,
    borderRadius: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.md },

  // Summary card
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    padding: spacing.md,
    marginBottom: spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.black,
    marginBottom: 2,
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.grey,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },

  // Store section
  storeSection: {
    marginBottom: spacing.lg,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  storeHeaderDone: {
    backgroundColor: colors.greenLight,
    borderColor: colors.green,
  },
  storeEmoji: {
    fontSize: 24,
  },
  storeHeaderText: {
    flex: 1,
  },
  storeName: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.black,
  },
  storeNameDone: {
    color: colors.green,
  },
  storeInfo: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  storePrice: {
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  doneCheckmark: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.green,
  },

  // Items
  itemsList: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemRowChecked: {
    backgroundColor: '#F9FBF9',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  checkmark: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.black,
  },
  itemNameChecked: {
    color: colors.grey,
    textDecorationLine: 'line-through',
  },
  itemDish: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.grey,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  itemQuantity: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.grey,
  },
  itemPrice: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.black,
  },
  itemTextChecked: {
    color: colors.grey,
  },

  // Bottom CTA
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaButton: {
    backgroundColor: colors.green,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: colors.grey,
  },
  ctaText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.white,
  },
});
