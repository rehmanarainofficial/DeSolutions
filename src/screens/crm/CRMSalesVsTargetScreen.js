import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { useTheme } from '@config/useTheme';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetSalesTargetMutation } from '@api/portalApi';

const { width } = Dimensions.get('window');

const CRMSalesVsTargetScreen = ({ navigation }) => {
  const { theme } = themeHook();
  const user = useSelector(selectCurrentUser);
  const [getSalesTarget, { isLoading }] = useGetSalesTargetMutation();
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTargetData = async () => {
    try {
      const response = await getSalesTarget({
        user_id: user?.id || user?.user_id || '66',
        sub_company: user?.company_user_code || 'KUD',
        sub_user_id: user?.company_user_id || '51',
      }).unwrap();

      if (response && String(response.status) === 'true') {
        setData(response.data || []);
      } else {
        // Fallback for demo/empty state or API issue
        console.log('API returned false/empty:', response);
      }
    } catch (e) {
      console.log('Error fetching sales vs target:', e);
    }
  };

  useEffect(() => {
    fetchTargetData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTargetData();
    setRefreshing(false);
  };

  // Search filter
  const filteredData = data.filter(item =>
    (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Totals calculations
  const totals = filteredData.reduce(
    (acc, curr) => {
      acc.target += parseFloat(curr.target || 0);
      acc.sale += parseFloat(curr.sale || 0);
      acc.diff += parseFloat(curr.diff || 0);
      return acc;
    },
    { target: 0, sale: 0, diff: 0 }
  );

  const totalAchv = totals.target > 0 ? (totals.sale / totals.target) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Cards Summary */}
      <View style={styles.topSummaryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.iconBg, { backgroundColor: theme.colors.primary + '15' }]}>
              <Icon name="locate-outline" size={20} color={theme.colors.primary} />
            </View>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total Target</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {totals.target.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.iconBg, { backgroundColor: '#10B98115' }]}>
              <Icon name="trending-up-outline" size={20} color="#10B981" />
            </View>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total Sales</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {totals.sale.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.iconBg, { backgroundColor: totalAchv >= 90 ? '#10B98115' : '#EF444415' }]}>
              <Icon name="pie-chart-outline" size={20} color={totalAchv >= 90 ? '#10B981' : '#EF4444'} />
            </View>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Overall Achv.</Text>
            <Text style={[styles.summaryValue, { color: totalAchv >= 90 ? '#10B981' : '#EF4444' }]}>
              {totalAchv.toFixed(1)}%
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.iconBg, { backgroundColor: totals.diff >= 0 ? '#10B98115' : '#EF444415' }]}>
              <Icon name="git-compare-outline" size={20} color={totals.diff >= 0 ? '#10B981' : '#EF4444'} />
            </View>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total Diff</Text>
            <Text style={[styles.summaryValue, { color: totals.diff >= 0 ? '#10B981' : '#EF4444' }]}>
              {totals.diff.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Icon name="search-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search categories..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sales vs Target Table */}
      {isLoading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredData.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}>
          <Icon name="bar-chart-outline" size={60} color={theme.colors.textSecondary + '40'} />
          <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>No target details found</Text>
        </ScrollView>
      ) : (
        <View style={styles.tableWrapper}>
          {/* Table Header */}
          <View style={[styles.tableHeader, { backgroundColor: theme.colors.primary + '15', borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.columnHeader, styles.colCategory, { color: theme.colors.primary }]}>Category</Text>
            <Text style={[styles.columnHeader, styles.colMiddle, { color: theme.colors.primary }]}>Sale vs Target</Text>
            <Text style={[styles.columnHeader, styles.colRight, { color: theme.colors.primary }]}>Diff vs Achv</Text>
          </View>

          {/* Table Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}>
            {filteredData.map((item, index) => {
              const achvVal = parseFloat(item.achv || 0);
              const diffVal = parseFloat(item.diff || 0);
              return (
                <View
                  key={item.category_id || index}
                  style={[
                    styles.tableRow,
                    {
                      backgroundColor: theme.colors.surface,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}>
                  {/* Category Name */}
                  <View style={styles.colCategory}>
                    <Text style={[styles.categoryTitle, { color: theme.colors.text }]} numberOfLines={2}>
                      {item.description || 'N/A'}
                    </Text>
                    <Text style={[styles.categoryId, { color: theme.colors.textSecondary }]}>
                      ID: {item.category_id || '-'}
                    </Text>
                  </View>

                  {/* Sale vs Target */}
                  <View style={styles.colMiddle}>
                    <Text style={[styles.saleText, { color: theme.colors.text }]}>
                      {parseFloat(item.sale || 0).toLocaleString()}
                    </Text>
                    <Text style={[styles.targetText, { color: theme.colors.textSecondary }]}>
                      {parseFloat(item.target || 0).toLocaleString()}
                    </Text>
                  </View>

                  {/* Difference vs Achievement */}
                  <View style={styles.colRight}>
                    <Text style={[styles.diffText, { color: diffVal >= 0 ? '#10B981' : '#EF4444' }]}>
                      {diffVal >= 0 ? `+${diffVal.toLocaleString()}` : diffVal.toLocaleString()}
                    </Text>
                    <View style={styles.achvContainer}>
                      <Text style={[styles.achvText, { color: achvVal >= 90 ? '#10B981' : '#EF4444' }]}>
                        {achvVal.toFixed(1)}%
                      </Text>
                      {/* Micro achievement bar */}
                      <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${Math.min(achvVal, 100)}%`,
                              backgroundColor: achvVal >= 90 ? '#10B981' : '#EF4444',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// Hook utility to safely call useTheme
const themeHook = () => {
  try {
    return useTheme();
  } catch (e) {
    return {
      theme: {
        colors: {
          background: '#F9FAFB',
          surface: '#FFFFFF',
          border: '#E5E7EB',
          text: '#111827',
          textSecondary: '#6B7280',
          primary: '#3B82F6',
        },
      },
    };
  }
};

export default CRMSalesVsTargetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSummaryContainer: {
    paddingVertical: 12,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  summaryCard: {
    width: width * 0.38,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'flex-start',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    padding: 0,
  },
  tableWrapper: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryId: {
    fontSize: 11,
    marginTop: 2,
  },
  saleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  targetText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  diffText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  achvContainer: {
    alignItems: 'flex-end',
    marginTop: 2,
  },
  achvText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    width: 60,
    height: 3,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  colCategory: {
    flex: 2.2,
  },
  colMiddle: {
    flex: 1.6,
    textAlign: 'left',
  },
  colRight: {
    flex: 1.6,
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noDataText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
});
