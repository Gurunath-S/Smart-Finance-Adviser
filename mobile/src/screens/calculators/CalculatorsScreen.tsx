import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../theme/theme';

interface ToolItem {
  id: keyof AppStackParamList;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  badge?: string;
}

export const CalculatorsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const tools: ToolItem[] = [
    {
      id: 'SIPCalculator',
      title: 'SIP Calculator',
      subtitle: 'Systematic investment wealth multiplier',
      icon: 'trending-up-outline',
      color: colors.brand,
      badge: 'Popular',
    },
    {
      id: 'SWPCalculator',
      title: 'SWP Calculator',
      subtitle: 'Systematic monthly cash withdrawal plan',
      icon: 'cash-outline',
      color: colors.income,
    },
    {
      id: 'FDCalculator',
      title: 'Fixed Deposit (FD)',
      subtitle: 'Guaranteed compound interest returns',
      icon: 'business-outline',
      color: '#3B82F6',
    },
    {
      id: 'MutualFundCalculator',
      title: 'Mutual Funds',
      subtitle: 'Lump-sum capital growth projections',
      icon: 'pie-chart-outline',
      color: colors.accentPink,
    },
    {
      id: 'PPFCalculator',
      title: 'PPF Calculator',
      subtitle: 'Tax-free sovereign 15-year public fund',
      icon: 'shield-checkmark-outline',
      color: '#10B981',
    },
    {
      id: 'GoldCalculator',
      title: 'Gold Investment',
      subtitle: 'Precious metal inflation hedge growth',
      icon: 'medal-outline',
      color: '#F59E0B',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Financial Tools</Text>
          <Text style={styles.subtitle}>
            Plan and project your long-term wealth compounding
          </Text>
        </View>

        {/* AI Advisory Callout */}
        <TouchableOpacity
          style={[styles.aiBanner, shadows.md]}
          onPress={() => navigation.navigate('Suggestions')}
          activeOpacity={0.85}
        >
          <View style={styles.aiIconCircle}>
            <Ionicons name="sparkles" size={24} color={colors.textInverse} />
          </View>
          <View style={styles.aiTextContainer}>
            <View style={styles.aiTag}>
              <Text style={styles.aiTagText}>AI POWERED</Text>
            </View>
            <Text style={styles.aiTitle}>Smart Financial Advice</Text>
            <Text style={styles.aiSubtitle}>Get personalized allocation recommendations</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textInverse} />
        </TouchableOpacity>

        {/* Tools Section */}
        <Text style={styles.sectionTitle}>Investment Calculators</Text>

        <View style={styles.grid}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolCard, shadows.sm]}
              onPress={() => navigation.navigate(tool.id as any)}
              activeOpacity={0.7}
            >
              <View style={styles.toolHeader}>
                <View style={[styles.toolIconCircle, { backgroundColor: `${tool.color}18` }]}>
                  <Ionicons name={tool.icon} size={22} color={tool.color} />
                </View>
                {tool.badge && (
                  <View style={styles.toolBadge}>
                    <Text style={styles.toolBadgeText}>{tool.badge}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolSubtitle} numberOfLines={2}>
                {tool.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  aiIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
    marginBottom: 4,
  },
  aiTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  aiTitle: {
    ...typography.h3,
    color: colors.textInverse,
  },
  aiSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  toolCard: {
    width: '47.5%',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toolIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBadge: {
    backgroundColor: 'rgba(245, 102, 146, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  toolBadgeText: {
    ...typography.captionBold,
    color: colors.accentPink,
    fontSize: 10,
  },
  toolTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  toolSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
});
