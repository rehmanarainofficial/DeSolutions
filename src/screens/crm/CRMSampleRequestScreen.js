/* eslint-disable react-native/no-inline-styles */
import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { useTheme } from '@config/useTheme';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import { useSelector } from 'react-redux';
import { SearchableDropdown } from '@components/common';
import {
  useGetHospitalMutation,
  useGetHospitalContactsMutation,
  useGetCityDropdownMutation,
} from '@api/baseApi';

const DUMMY_DROPDOWN = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

const CRMSampleRequestScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const user = useSelector(state => state.auth.user);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Sample Request',
    });
  }, [navigation]);

  // Top Section State
  const [basicInfo, setBasicInfo] = useState({
    salePerson: null,
    salesRegion: null,
    hospital: null,
    hospitalContact: null,
    surgeonName: '',
    surgeonSpecialty: '',
    department: null,
  });

  // Dynamic Products Section State
  const emptyProduct = {
    product: null,
    quantity: '',
    batchNo: '',
    expectedDate: '',
    currentBrand: '',
    samplePurpose: '',
  };
  const [products, setProducts] = useState([{ ...emptyProduct }]);

  // API Hooks
  const [getHospital, { data: hospRes, isLoading: hospLoading }] = useGetHospitalMutation();
  const [getHospitalContacts, { data: contactRes, isLoading: contactLoading }] = useGetHospitalContactsMutation();
  const [getCityDropdown, { data: cityRes, isLoading: cityLoading }] = useGetCityDropdownMutation();

  // Calendar Picker State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [currentProductIndexForDate, setCurrentProductIndexForDate] = useState(null);

  useEffect(() => {
    getHospital({ id: user?.id });
    getCityDropdown({ id: user?.id });
  }, [user?.id, getHospital, getCityDropdown]);

  const handleHospitalSelect = (item) => {
    setBasicInfo(prev => ({
      ...prev,
      hospital: item.debtor_no,
      hospitalContact: null,
    }));
    getHospitalContacts({ hospital_id: item.debtor_no, user_id: user?.id });
  };

  // Remarks State
  const [remarks, setRemarks] = useState('');

  // Calendar Helpers
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCalendarDate(prev => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, 1);
    });
  };

  const handleNextMonth = () => {
    setCalendarDate(prev => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 1);
    });
  };

  const handleDateSelect = (day) => {
    const formattedDate = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (currentProductIndexForDate !== null) {
      updateProductField(currentProductIndexForDate, 'expectedDate', formattedDate);
    }
    setIsCalendarOpen(false);
  };

  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const dayItems = [];

    // Empty spaces for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      dayItems.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    }

    // Days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDayDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = currentProductIndexForDate !== null && products[currentProductIndexForDate]?.expectedDate === formattedDayDate;

      dayItems.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.calendarDayBtn,
            isSelected && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <Text
            style={[
              styles.calendarDayText,
              { color: isSelected ? '#FFFFFF' : theme.colors.text }
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return dayItems;
  };

  // Handlers
  const updateBasicField = (key, value) => {
    setBasicInfo(prev => ({ ...prev, [key]: value }));
  };

  const updateProductField = (index, key, value) => {
    const updated = [...products];
    updated[index][key] = value;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, { ...emptyProduct }]);
  };

  const removeProduct = (index) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  // UI Helpers
  const renderInput = (label, value, onChangeText, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder={`Enter ${label}`}
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );

  const renderDropdown = (label, value, onChange) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <Dropdown
        style={[styles.dropdown, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
        placeholderStyle={[styles.placeholderStyle, { color: theme.colors.textSecondary }]}
        selectedTextStyle={[styles.selectedTextStyle, { color: theme.colors.text }]}
        itemTextStyle={[styles.itemTextStyle, { color: theme.colors.text }]}
        containerStyle={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
        data={DUMMY_DROPDOWN}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={`Select ${label}`}
        value={value}
        onChange={(item) => onChange(item.value)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Top Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <SearchableDropdown
            label="Hospital"
            placeholder="Select Hospital"
            data={hospRes?.data || []}
            selectedId={basicInfo.hospital}
            onSelect={handleHospitalSelect}
            isLoading={hospLoading}
            idKey="debtor_no"
            labelKey="name"
            iconName="business-outline"
          />

          <SearchableDropdown
            label="Hospital Contact"
            placeholder={
              basicInfo.hospital ? 'Select Contact' : 'First select hospital'
            }
            data={contactRes?.data || []}
            selectedId={basicInfo.hospitalContact}
            onSelect={item => updateBasicField('hospitalContact', item.id)}
            isLoading={contactLoading}
            labelKey="person_name"
            iconName="people-outline"
            disabled={!basicInfo.hospital}
          />

          {renderDropdown('Sale Person Name', basicInfo.salePerson, (val) => updateBasicField('salePerson', val))}

          <SearchableDropdown
            label="Sales Region/Territory"
            placeholder="Select City"
            data={cityRes?.data || []}
            selectedId={basicInfo.salesRegion}
            onSelect={item => updateBasicField('salesRegion', item.id)}
            isLoading={cityLoading}
            idKey="id"
            labelKey="cityname"
            iconName="location-outline"
          />

          {renderInput('Surgeon Name', basicInfo.surgeonName, (text) => updateBasicField('surgeonName', text))}
          {renderInput('Surgeon Specialty', basicInfo.surgeonSpecialty, (text) => updateBasicField('surgeonSpecialty', text))}
          {renderDropdown('Department', basicInfo.department, (val) => updateBasicField('department', val))}
        </View>

        {/* Dynamic Products Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Products Details</Text>
          
          {products.map((item, index) => (
            <View key={index} style={[styles.dynamicBlock, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
              <View style={styles.dynamicHeader}>
                <Text style={[styles.dynamicTitle, { color: theme.colors.text }]}>Item {index + 1}</Text>
                {products.length > 1 && (
                  <TouchableOpacity onPress={() => removeProduct(index)}>
                    <Icon name="trash-outline" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              {renderDropdown('Product', item.product, (val) => updateProductField(index, 'product', val))}
              {renderInput('Quantity', item.quantity, (text) => updateProductField(index, 'quantity', text), 'numeric')}
              {renderInput('Batch No.', item.batchNo, (text) => updateProductField(index, 'batchNo', text))}
              
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Expected Date of Use</Text>
                <TouchableOpacity
                  style={[styles.datePickerBtn, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                  onPress={() => {
                    setCurrentProductIndexForDate(index);
                    if (item.expectedDate) {
                      const parsed = new Date(item.expectedDate);
                      if (!isNaN(parsed)) {
                        setCalendarDate(parsed);
                      }
                    } else {
                      setCalendarDate(new Date());
                    }
                    setIsCalendarOpen(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateText, { color: item.expectedDate ? theme.colors.text : theme.colors.textSecondary }]}>
                    {item.expectedDate || 'Select Expected Date of Use'}
                  </Text>
                  <Icon name="calendar-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>

              {renderInput('Current Brand', item.currentBrand, (text) => updateProductField(index, 'currentBrand', text))}
              {renderInput('Sample Purpose', item.samplePurpose, (text) => updateProductField(index, 'samplePurpose', text))}
            </View>
          ))}
          
          <TouchableOpacity 
            style={[styles.addMoreBtn, { borderColor: theme.colors.primary }]}
            onPress={addProduct}
          >
            <Icon name="add" size={20} color={theme.colors.primary} style={styles.addIcon} />
            <Text style={[styles.addMoreText, { color: theme.colors.primary }]}>Add More Item</Text>
          </TouchableOpacity>
        </View>

        {/* Remarks */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Remarks</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="Add any remarks..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.submitBtnText}>Submit Request</Text>
        </TouchableOpacity>
        
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Premium Custom Calendar Modal */}
      <Modal
        visible={isCalendarOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCalendarOpen(false)}
      >
        <View style={styles.calendarModalOverlay}>
          <TouchableOpacity style={styles.calendarModalBg} onPress={() => setIsCalendarOpen(false)} activeOpacity={1} />
          <View style={[styles.calendarContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.calendarArrowBtn}>
                <Icon name="chevron-back-outline" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.calendarMonthTitle, { color: theme.colors.text }]}>
                {months[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.calendarArrowBtn}>
                <Icon name="chevron-forward-outline" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekDaysRow}>
              {daysOfWeek.map((day, dIdx) => (
                <Text key={dIdx} style={[styles.calendarWeekDayLabel, { color: theme.colors.textSecondary }]}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarDaysGrid}>
              {renderCalendarDays()}
            </View>

            <TouchableOpacity
              style={[styles.calendarCloseBtn, { borderColor: theme.colors.primary }]}
              onPress={() => setIsCalendarOpen(false)}
            >
              <Text style={[styles.calendarCloseBtnText, { color: theme.colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  placeholderStyle: { fontSize: 15 },
  selectedTextStyle: { fontSize: 15 },
  itemTextStyle: { fontSize: 15 },
  dynamicBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dynamicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dynamicTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitBtn: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  datePickerBtn: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 15,
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModalBg: {
    ...StyleSheet.absoluteFillObject,
  },
  calendarContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '15',
  },
  calendarMonthTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  calendarWeekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
  },
  calendarWeekDayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  calendarDayEmpty: {
    width: '14.28%',
    aspectRatio: 1,
  },
  calendarDayBtn: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarCloseBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  addIcon: {
    marginRight: 8,
  },
  footerSpacer: {
    height: 40,
  },
});

export default CRMSampleRequestScreen;
