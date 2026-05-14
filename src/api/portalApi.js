import { baseApi } from './baseApi';

export const portalApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getDebtorsMaster: builder.query({
      query: body => {
        const formData = new FormData();
        formData.append('company', body.company?.trim()?.toUpperCase());
        formData.append('user_id', body.user_id || '');
        return {
          url: 'portal/debtors_master.php',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
    postServicePurchSale: builder.mutation({
      query: body => {
        const formData = new FormData();
        Object.keys(body).forEach(key => {
          if (key === 'image' && body[key]) {
            formData.append(key, {
              uri: body[key].uri,
              type: body[key].type,
              name: body[key].fileName || 'image.jpg',
            });
          } else if (key === 'purch_order_details') {
            formData.append(
              key,
              typeof body[key] === 'string'
                ? body[key]
                : JSON.stringify(body[key]),
            );
          } else {
            formData.append(key, body[key]);
          }
        });
        return {
          url: 'portal/post_service_purch_sale.php',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
    getOrderShippingInfo: builder.mutation({
      query: body => {
        const formData = new FormData();
        formData.append('company', body.company);
        formData.append('user_id', body.user_id);
        return {
          url: 'portal/order_shiping_info.php',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
    getOrderStatusListing: builder.mutation({
      query: body => {
        const formData = new FormData();
        formData.append('company', body.company);
        formData.append('user_id', body.user_id);
        return {
          url: 'portal/order_status_listing.php',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
    getOutstandingReport: builder.mutation({
      query: body => {
        const formData = new FormData();
        formData.append('company', body.company);
        formData.append('customer_id', body.customer_id);
        return {
          url: 'portal/outstanding_report.php',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
    getViewData: builder.mutation({
      query: body => {
        const formData = new FormData();
        formData.append('company', body.company);
        formData.append('trans_no', body.trans_no);
        formData.append('type', body.type);
        return {
          url: 'view/view_data.php',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
    postPayment: builder.mutation({
      query: body => {
        const formData = new FormData();
        Object.keys(body).forEach(key => {
          if (key === 'filename' && body[key]) {
            formData.append(key, {
              uri: body[key].uri,
              type: body[key].type,
              name: body[key].fileName || 'payment.jpg',
            });
          } else if (key === 'gl_detail') {
            formData.append(
              key,
              typeof body[key] === 'string'
                ? body[key]
                : JSON.stringify(body[key]),
            );
          } else {
            formData.append(key, body[key]);
          }
        });
        return {
          url: 'portal/post_service_payments.php',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
    getContactsData: builder.mutation({
      query: body => {
        const formData = new FormData();
        formData.append('company', 'CRM');
        formData.append('user_id', body.user_id);
        return {
          url: 'portal/get_contacts_data.php',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
    getHospitalData: builder.mutation({
      query: body => {
        const formData = new FormData();
        formData.append('company', 'CRM');
        formData.append('user_id', body.user_id);
        return {
          url: 'portal/get_hospital_data.php',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDebtorsMasterQuery,
  useLazyGetDebtorsMasterQuery,
  usePostServicePurchSaleMutation,
  useGetOrderShippingInfoMutation,
  useGetOrderStatusListingMutation,
  useGetOutstandingReportMutation,
  useGetViewDataMutation,
  usePostPaymentMutation,
  useGetContactsDataMutation,
  useGetHospitalDataMutation,
} = portalApi;
