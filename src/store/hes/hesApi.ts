import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery, HES_TAG_TYPES } from '../utils';
import { scheduledReportsEndpoints } from './endpoints/scheduled-reports';
import { deviceManagementEndpoints } from './endpoints/device-management';
import { meterProfileData } from './endpoints/meter-profile-data';
import { commandExecutionEndpoints } from './endpoints/command-execution';
import { DeviceInfoEndpoints } from './endpoints/device-info';
import { loginEndpoints } from './endpoints/login';
import { downloadDataEndpoints } from './endpoints/download-data';

const hesApi = createApi({
  reducerPath: 'hesApi',
  baseQuery: customBaseQuery({
    baseUrl: `${import.meta.env.VITE_HES_BASE_URL}/${
      import.meta.env.VITE_HES_API_VERSION
    }/`,
    credentials: 'same-origin',
    setHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set(
        'Authorization',
        sessionStorage.getItem('hes_token') as string
      );
      return headers;
    }
  }),
  tagTypes: HES_TAG_TYPES,
  endpoints: (builder) => ({
    ...deviceManagementEndpoints(builder),
    ...meterProfileData(builder),
    ...scheduledReportsEndpoints(builder),
    ...meterProfileData(builder),
    ...commandExecutionEndpoints(builder),
    ...DeviceInfoEndpoints(builder),
    ...loginEndpoints(builder),
    ...downloadDataEndpoints(builder)
  })
});

export const {
  useLazyGetLocationHierarchyQuery,
  useLazyGetDeviceIdentifierQuery,
  useGetDeviceMetaInfoMetricsQuery,
  useGetLiveDataMetricsQuery,
  useGetBlockLoadPushDataQuery,
  useGetDailyLoadPushDataQuery,
  useGetMonthlyBillingDataQuery,
  useGetScheduledReportsQuery,
  useGetProfileInstantDataQuery,
  useGetDeviceSubCategoryQuery,
  useGetPeriodicPushDataQuery,
  useLazyGetCommandInfoQuery,
  useGetCommandInfoQuery,
  useGetCommandExecutionHistoryQuery,
  useGetBatchCommandExecutionHistoryQuery,
  useExecuteCommandMutation,
  useGetDeviceInfoQuery,
  useUpdateDeviceInfoMutation,
  useUpdateTokenForAuthMutation,
  useGetCommandExecutionHistoryDetailsQuery,
  useLazyDownloadCSVDataQuery,
  usePrefetch
} = hesApi;

export default hesApi;
