import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import { useTheme } from '@config/useTheme';
import { useSelector } from 'react-redux';
import {
  useGetStockMasterDropdownMutation,
  useGetCustBranchDropdownMutation,
} from '@api/baseApi';
import { CustomDatePicker, SearchableDropdown } from '@components/common';
import { launchImageLibrary } from 'react-native-image-picker';
import { usePostServicePurchSaleMutation } from '@api/portalApi';
import { selectCurrentUser } from '@store/slices/authSlice';

const SalesOrderFormScreen = ({ navigation, route }) => {
  const { theme } = useTheme();

  const [cart, setCart] = useState([]);

  const [ProductModal, setProductModal] = useState(false);
  const [Search, setSearch] = useState('');
  const [selectProduct, setSelectProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('0');
  const [poNo, setPoNo] = useState('');
  const [poDate, setPoDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(
    route.params?.customer?.shipping_address ||
      route.params?.customer?.address ||
      '',
  );
  const [picture, setPicture] = useState(null);
  const [orderLoader, setOrderLoader] = useState(false);

  const { company } = useSelector(state => state.auth);

  const user = useSelector(selectCurrentUser);
  const [getStockMaster] = useGetStockMasterDropdownMutation();
  const [postOrder] = usePostServicePurchSaleMutation();
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [getCustBranchDropdown, { isLoading: branchLoading }] =
    useGetCustBranchDropdownMutation();

  React.useEffect(() => {
    fetchProducts();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    const customer = route.params?.customer || {};
    const personId = customer.person_id;

    if (personId) {
      try {
        const response = await getCustBranchDropdown({
          company: user?.company_user_code || company,
          person_id: personId,
        }).unwrap();
        if (response && String(response.status) === 'true') {
          setBranches(response.data || []);
        }
      } catch (error) {
        console.log('Error fetching branches:', error);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getStockMaster({
        company: user?.company_user_code || company,
      }).unwrap();
      if (response && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.log('Error fetching products:', error);
    }
  };

  // Derived Values
  const grandTotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.GrandTotal || 0),
    0,
  );

  const handleQuantityChange = type => {
    if (type === 'plus') {
      setQuantity(prev => prev + 1);
    } else {
      setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    }
  };

  const addToCart = () => {
    if (!selectProduct) {
      Toast.show({ type: 'error', text1: 'Please Select a Product' });
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      Toast.show({ type: 'error', text1: 'Please enter a valid Price' });
      return;
    }

    const itemCode = selectProduct.stock_id || selectProduct.item_code;
    const isExist = cart.some(item => item.item_code === itemCode);

    if (isExist) {
      Toast.show({ type: 'error', text1: 'Item already exists in the cart' });
      return;
    }

    let itemGrandTotal = (parseFloat(price) * quantity).toFixed(2);

    const newItem = {
      description: selectProduct.description,
      unit_price: price,
      quantity_ordered: quantity,
      item_code: itemCode,
      GrandTotal: itemGrandTotal,
    };

    setCart([...cart, newItem]);

    // Reset fields
    setSelectProduct(null);
    setQuantity(1);
    setPrice('0');

    Toast.show({ type: 'success', text1: 'Item added to cart' });
  };

  const deleteCartItem = index => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    Toast.show({ type: 'success', text1: 'Item removed from cart' });
  };

  const confirmOrder = async () => {
    if (cart.length === 0) {
      Toast.show({ type: 'error', text1: 'Cart is empty' });
      return;
    }
    if (!shippingAddress.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter shipping address' });
      return;
    }

    setOrderLoader(true);

    try {
      const customer = route.params?.customer || {};

      const purch_order_details = cart.map(item => ({
        item_code: item.item_code,
        description: item.description || '', // Now sending actual description
        quantity_ordered: String(item.quantity_ordered),
        del_qty: String(item.quantity_ordered),
        unit_price: String(item.unit_price),
      }));

      const formatDate = dateObj => {
        const d = new Date(dateObj);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0',
        )}-${String(d.getDate()).padStart(2, '0')}`;
      };

      const payload = {
        order_no: '0',
        person_id: customer.person_id,
        trans_type: '30',
        ord_date: formatDate(new Date()),
        po_no: poNo,
        po_date: formatDate(poDate),
        loc_code: selectedBranch,
        branch_code: selectedBranch,
        total: String(grandTotal),
        price_list: customer.price_list || '',
        ship_via: customer.ship_via || '',
        memo: '',
        purch_order_details: JSON.stringify(purch_order_details),
        user_id: user?.company_user_id || '',
        shiping_address: shippingAddress,
        company: user?.company_user_code || '',
        image: picture,
        salesman: customer.salesman || '',
        payments: customer.payments || customer.payment_terms || '',
      };
      const response = await postOrder(payload).unwrap();

      if (response && response.status === true) {
        setCart([]);
        setPicture(null);
        setPoNo('');
        setShippingAddress('');
        Toast.show({
          type: 'success',
          text1: 'Order confirmed successfully',
          text2: response.message || '',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to place order',
          text2: response?.message || 'Unknown error',
        });
      }
    } catch (error) {
      console.log('Order Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Could not place order',
      });
    } finally {
      setOrderLoader(false);
    }
  };

  const filteredProducts = products.filter(val => {
    const desc = val.description ? String(val.description).toLowerCase() : '';
    const sid = val.stock_id ? String(val.stock_id).toLowerCase() : '';
    const q = Search.toLowerCase();
    return desc.includes(q) || sid.includes(q);
  });

  const handlePickImage = async () => {
    const options = { mediaType: 'photo', quality: 0.5 };
    const result = await launchImageLibrary(options);
    if (result.assets && result.assets.length > 0) {
      setPicture(result.assets[0]);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.formContainer,
            { backgroundColor: theme.colors.surface, shadowColor: '#000' },
          ]}
        >
          {/* Select Branch */}
          <SearchableDropdown
            label="Select Branch"
            placeholder="Choose a branch..."
            data={branches}
            selectedId={selectedBranch}
            onSelect={item => {
              setSelectedBranch(item.branch_code);
              if (item.br_address) {
                setShippingAddress(item.br_address);
              }
            }}
            isLoading={branchLoading}
            idKey="branch_code"
            labelKey="br_name"
            iconName="git-branch-outline"
          />

          {/* Select Product */}
          <TouchableOpacity
            onPress={() => setProductModal(true)}
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Select Product
            </Text>
            <Text
              style={[styles.inputValue, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {selectProduct
                ? selectProduct.description
                : 'Choose a product...'}
            </Text>
          </TouchableOpacity>

          {/* Quantity */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Quantity :
            </Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => handleQuantityChange('minus')}
                style={[
                  styles.quantityBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons name="remove" size={20} color="#fff" />
              </TouchableOpacity>

              <TextInput
                keyboardType="numeric"
                value={String(quantity)}
                onChangeText={txt => setQuantity(Number(txt) || 0)}
                style={[styles.quantityInput, { color: theme.colors.text }]}
              />

              <TouchableOpacity
                onPress={() => handleQuantityChange('plus')}
                style={[
                  styles.quantityBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Price :
            </Text>
            <TextInput
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor={theme.colors.textSecondary}
              style={[
                styles.textInput,
                {
                  color: theme.colors.text,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            />
          </View>

          {/* Add Item Button */}
          <TouchableOpacity onPress={addToCart} style={styles.addItemBtn}>
            <View
              style={[
                styles.gradientBtn,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.btnText}>Add Item</Text>
            </View>
          </TouchableOpacity>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={[
                  styles.label,
                  { color: theme.colors.text, marginBottom: 10 },
                ]}
              >
                Cart Items ({cart.length})
              </Text>
              {cart.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}
                >
                  <Text style={{ color: theme.colors.textSecondary, flex: 1 }}>
                    {item.description} (x{item.quantity_ordered})
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontWeight: '600',
                        marginRight: 10,
                      }}
                    >
                      {item.GrandTotal}
                    </Text>
                    <TouchableOpacity onPress={() => deleteCartItem(idx)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.border },
                ]}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={[
                    styles.label,
                    { color: theme.colors.text, fontWeight: '700' },
                  ]}
                >
                  Grand Total
                </Text>
                <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
                  Rs {grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {/* PO No */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.text }]}>
              PO No :
            </Text>
            <TextInput
              value={poNo}
              onChangeText={setPoNo}
              placeholder="Enter PO No"
              placeholderTextColor={theme.colors.textSecondary}
              style={[
                styles.textInput,
                {
                  color: theme.colors.text,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            />
          </View>

          {/* PO Date */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.text }]}>
              PO Date :
            </Text>
            <Text
              style={[styles.inputValue, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {poDate ? poDate.toLocaleDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity>

          {/* Shipping Address */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                flexDirection: 'column',
                alignItems: 'flex-start',
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: theme.colors.text, marginBottom: 10 },
              ]}
            >
              Shipping Address :
            </Text>
            <TextInput
              value={shippingAddress}
              onChangeText={setShippingAddress}
              placeholder="Enter Shipping Address"
              placeholderTextColor={theme.colors.textSecondary}
              style={[
                styles.textInput,
                {
                  color: theme.colors.text,
                  borderBottomColor: theme.colors.border,
                  width: '100%',
                  textAlign: 'left',
                  marginLeft: 0,
                },
              ]}
              multiline
            />
          </View>

          {/* Picture */}
          <TouchableOpacity
            onPress={handlePickImage}
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Picture :
            </Text>
            <Text
              style={[styles.inputValue, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {picture
                ? picture.fileName || 'Image Selected'
                : 'Choose from Gallery...'}
            </Text>
          </TouchableOpacity>

          {/* Confirm order Button */}
          <TouchableOpacity
            onPress={confirmOrder}
            disabled={orderLoader}
            style={styles.confirmBtn}
          >
            <View
              style={[
                styles.gradientBtn,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              {orderLoader ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Confirm order</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={date => {
          setPoDate(date);
          setShowDatePicker(false);
        }}
        selectedDate={poDate}
        title="Select PO Date"
      />

      {/* Product Selection Modal */}
      <Modal
        isVisible={ProductModal}
        onBackdropPress={() => setProductModal(false)}
        style={styles.modal}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View
            style={[
              styles.searchBar,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              placeholder="Search by Description or Stock ID"
              placeholderTextColor={theme.colors.textSecondary}
              value={Search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: theme.colors.text }]}
            />
          </View>

          <FlatList
            data={filteredProducts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectProduct(item);
                  setPrice(String(item.price || '0'));
                  setProductModal(false);
                }}
                style={[
                  styles.productItem,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <Text
                  style={[styles.productName, { color: theme.colors.text }]}
                >
                  {item.description}
                </Text>
                <Text
                  style={[
                    styles.productCode,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.stock_id}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

export default SalesOrderFormScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputValue: {
    fontSize: 14,
    width: '60%',
    textAlign: 'right',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 15,
    textAlign: 'center',
    minWidth: 30,
  },
  textInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    borderBottomWidth: 1,
    padding: 0,
    marginLeft: 10,
  },
  addItemBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  gradientBtn: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  confirmBtn: {
    width: '100%',
    marginTop: 10,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 45,
    marginLeft: 10,
  },
  productItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
  },
  productCode: {
    fontSize: 12,
    marginTop: 2,
  },
});
