import { EndpointBuilder } from "@reduxjs/toolkit/query";
import { FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import { BaseQueryFn } from "@reduxjs/toolkit/query";

export const liveDataEndPoints = (
  builder: EndpointBuilder<
    BaseQueryFn<
      string | FetchArgs,
      unknown,
      FetchBaseQueryError,
      NonNullable<unknown>,
      FetchBaseQueryMeta
    >,
    string,
    "hesApi"
  >
) => ({
  getLiveDataMetrics: builder.query<any, { searchQuery: string }>({
    query: ({ searchQuery }) => ({
      url: `/push-data/metrics${searchQuery}`,
      method: "GET",
    }),
    transformResponse: (response: any) => {
      if (response && response.data && response.data.records) {
        const item = response.data.records;
        return item;
      }
    },
  }),
});
