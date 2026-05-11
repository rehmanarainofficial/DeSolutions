import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@config/useTheme';
import { useGetDailyWorkingPlanMutation } from '@api/baseApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@store/slices/authSlice';

const quickActions = [
  {
    id: 'contact',
    title: 'CRM\nCONTACT',
    icon: 'people-outline',
  },
  {
    id: 'hospital',
    title: 'HOSPITAL',
    icon: 'business-outline',
  },
  {
    id: 'new_order',
    title: 'NEW ORDER',
    icon: 'clipboard-outline',
  },
  {
    id: 'order_status',
    title: 'ORDER STATUS',
    icon: 'document-text-outline',
  },
  {
    id: 'customer_balance',
    title: 'CUSTOMER BALANCE',
    icon: 'pie-chart-outline',
  },
  {
    id: 'supply_info',
    title: 'SUPPLY INFO',
    icon: 'bus-outline',
  },
  {
    id: 'payment',
    title: 'PAYMENT ENTRY',
    icon: 'cash-outline',
  },
  {
    id: 'sample',
    title: 'SAMPLE REQUEST',
    icon: 'flask-outline',
  },
];

const reports = [
  {
    id: 'sales_target',
    title: 'SALES VS\nTARGET',
    icon: 'bar-chart-outline',
  },
  {
    id: 'cust_balance',
    title: 'CUSTOMER\nBALANCE',
    icon: 'pie-chart-outline',
  },
  {
    id: 'collection',
    title: 'COLLECTION\nREPORT',
    icon: 'wallet-outline',
  },
  {
    id: 'daily_summary',
    title: 'DAILY\nSUMMARY',
    icon: 'calendar-outline',
  },
];

const SaleManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const user = useSelector(selectCurrentUser);
  const [dailyPlans, setDailyPlans] = useState([]);
  const [getDailyWorkingPlan] = useGetDailyWorkingPlanMutation();

  const fetchDailyPlan = async () => {
    try {
      const d = new Date();
      const dateStr = d.toISOString().split('T')[0];
      const response = await getDailyWorkingPlan({
        user_id: user?.id,
        date: dateStr,
      }).unwrap();
      if (response && String(response.status) === 'true') {
        setDailyPlans(response.data || []);
      } else {
        setDailyPlans([]);
      }
    } catch (error) {
      console.log('Fetch Plan Error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDailyPlan();
    }, [])
  );

  const handleActionPress = item => {
    if (item.id === 'new_order') {
      navigation.navigate('SalesGenerateOrderScreen');
    } else if (item.id === 'customer_balance') {
      navigation.navigate('CustomerBalanceScreen');
    } else if (item.id === 'contact') {
      navigation.navigate('CRMContactList');
    } else if (item.id === 'hospital') {
      navigation.navigate('CRMHospitalList');
    } else if (item.id === 'payment') {
      navigation.navigate('SalesPayment');
    } else if (item.id === 'order_status') {
      navigation.navigate('SalesTrackOrderStatus');
    } else if (item.id === 'supply_info') {
      navigation.navigate('SupplyInfoScreen');
    }
    // Handle other actions here
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TODAY'S PLAN SECTION */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>TODAY'S PLAN</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('HCMAttendance')}
          >
            <Text style={styles.sectionRightText}>ATTENDANCE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.planCard}>
          <TouchableOpacity
            style={styles.planHalf}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SaleTask')}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.primary + '1A' },
              ]}
            >
              <Icon
                name="calendar-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.planTextCol}>
              <Text style={styles.planCount}>
                {dailyPlans?.length} <Text style={styles.planSub}>Tasks</Text>
              </Text>
              <Text style={styles.planSub}>Today</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.planHalf}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('HCMAttendance')}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.primary + '1A' },
              ]}
            >
              <Icon
                name="calendar-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.planTextCol}>
              <Text style={styles.planMainText}>Mark</Text>
              <Text style={styles.planMainText}>Attendance</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS SECTION */}
        <Text
          style={[styles.sectionTitle, { marginTop: 20, marginBottom: 12 }]}
        >
          QUICK ACTIONS
        </Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => handleActionPress(action)}
            >
              <Icon
                name={action.icon}
                size={28}
                color={theme.colors.primary}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* REPORTS SECTION */}
        <Text
          style={[styles.sectionTitle, { marginTop: 20, marginBottom: 12 }]}
        >
          REPORTS
        </Text>
        <View style={styles.reportsGrid}>
          {reports.map(report => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportTile}
              activeOpacity={0.7}
            >
              <Icon
                name={report.icon}
                size={28}
                color={theme.colors.primary}
                style={styles.reportIcon}
              />
              <Text style={styles.reportText}>{report.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FIELD EXPENSE SECTION */}
        <Text
          style={[styles.sectionTitle, { marginTop: 20, marginBottom: 12 }]}
        >
          FIELD EXPENSE
        </Text>
        <TouchableOpacity
          style={styles.expenseCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CRMMonthlyExpense')}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.colors.primary + '1A', marginRight: 16 },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.primary + '1A' },
              ]}
            >
              <Icon
                name="wallet-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
          </View>
          <View style={styles.expenseTextCol}>
            <Text style={styles.expenseTitle}>Field Expense</Text>
            <Text style={styles.expenseSub}>Add and manage expenses</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 0.5,
    },
    sectionRightText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#3b82f6',
      textTransform: 'uppercase',
    },
    planCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    planHalf: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      margin: 4,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    planTextCol: {
      marginLeft: 12,
      flex: 1,
      justifyContent: 'center',
    },
    planCount: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
      lineHeight: 26,
    },
    planSub: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    planMainText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
      lineHeight: 18,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 12,
    },
    actionButton: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionIcon: {
      marginRight: 12,
    },
    actionText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.text,
      lineHeight: 16,
    },
    reportsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    reportTile: {
      width: '23%',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 4,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    reportIcon: {
      marginBottom: 8,
    },
    reportText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 14,
    },
    expenseCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    expenseTextCol: {
      flex: 1,
    },
    expenseTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    expenseSub: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
  });

export default SaleManagementScreen;
