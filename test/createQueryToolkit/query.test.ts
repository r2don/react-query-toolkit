import { expect, it, describe } from "vitest";

import { createQueryToolkit } from "../../src/createQueryToolkit";
import { customRenderHook, mockQueryClient } from "../utils";

const queryToolkit = createQueryToolkit(mockQueryClient);

describe("createQueryToolkit/query", () => {
  describe("simple api", () => {
    const mockData = [
      { text: "123", id: 1 },
      { text: "456", id: 2 },
    ];
    const simpleApi = () => () => Promise.resolve(mockData);
    const simpleApiQuery = queryToolkit(["simpleApi"], simpleApi);

    it("could be used with useQuery", async () => {
      const { result, waitFor } = customRenderHook(() =>
        simpleApiQuery.useQuery([], { queryKey: ["useQuery"] })
      );
      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toEqual(mockData);
    });

    it("could be used with select", async () => {
      const { result, waitFor } = customRenderHook(() =>
        simpleApiQuery.useQuery([], {
          select: (data) => data[0].text,
          queryKey: ["select"],
        })
      );
      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toEqual("123");
    });

    it("can set query data", async () => {
      const mockData = [
        {
          text: "11",
          id: 2,
        },
      ];
      simpleApiQuery.setQueryData(["setQueryData"], () => mockData);
      const data = simpleApiQuery.getQueryData(["setQueryData"]);
      expect(data).toEqual(mockData);
    });

    it("can set queries data", () => {
      const mockData = [{ text: "1", id: 1 }];
      simpleApiQuery.setQueriesData({}, () => mockData);
      const data1 = simpleApiQuery.getQueryData(["setQueryData"]);
      const data2 = simpleApiQuery.getQueryData(["useQuery"]);
      const data3 = simpleApiQuery.getQueryData(["select"]);

      expect(data1).toEqual(mockData);
      expect(data2).toEqual(mockData);
      expect(data3).toEqual(mockData);
    });

    it("should prefetch data", async () => {
      await simpleApiQuery.prefetchQuery([], { queryKey: ["prefetch"] });

      const { result } = customRenderHook(() =>
        simpleApiQuery.useQuery([], {
          queryKey: ["prefetch"],
        })
      );

      expect(result.current.isLoading).toEqual(false);
      expect(result.current.data).toEqual(mockData);
    });

    it("should get proper value from isFetching", async () => {
      const { result } = customRenderHook(() =>
        simpleApiQuery.useQuery([], {
          queryKey: ["isFetching1"],
        })
      );

      customRenderHook(() =>
        simpleApiQuery.useQuery([], {
          queryKey: ["isFetching2"],
        })
      );

      const { result: isFetchingResult } = customRenderHook(() =>
        simpleApiQuery.useIsFetching()
      );

      expect(result.current.isFetching).toEqual(true);
      expect(isFetchingResult.current).toEqual(2);
    });
  });

  describe("api with args", () => {
    const argApi = (id: number) => () => {
      return Promise.resolve(
        [
          { text: "1", id: 1 },
          { text: "2", id: 2 },
          { text: "3", id: 3 },
          { text: "4", id: 4 },
        ].find((item) => item.id === id)
      );
    };

    const argApiQuery = queryToolkit(["argApi"], argApi);

    it("should pass args to api func", async () => {
      const { result, waitFor } = customRenderHook(() =>
        argApiQuery.useQuery([1])
      );
      await waitFor(() => result.current.isSuccess);

      const data = argApiQuery.getQueryData([1]);

      expect(result.current.data).toEqual({ text: "1", id: 1 });
      expect(data).toEqual({ text: "1", id: 1 });

      const fetchedData = await argApiQuery.fetchQuery([2]);

      expect(fetchedData).toEqual({ text: "2", id: 2 });
    });

    it("should prefetch data with args", async () => {
      await argApiQuery.prefetchQuery([1]);

      const data = argApiQuery.getQueryData([1]);
      const { result } = customRenderHook(() => argApiQuery.useQuery([1]));

      expect(data).toEqual({ text: "1", id: 1 });
      expect(result.current.data).toEqual({ text: "1", id: 1 });
    });

    it("should pass proper queryKey by args", async () => {
      const { result: query1Res, waitFor: wait1 } = customRenderHook(() =>
        argApiQuery.useQuery([1])
      );
      const { result: query2Res, waitFor: wait2 } = customRenderHook(() =>
        argApiQuery.useQuery([2])
      );

      await wait1(() => query1Res.current.isSuccess);
      await wait2(() => query2Res.current.isSuccess);
      expect(query1Res.current.data).not.toEqual(query2Res.current.data);
    });

    it("should not pass args to queryKey", async () => {
      const queryNotPassArgsToQueryKey = queryToolkit(["argApi"], argApi, {
        passArgsToQueryKey: false,
      });
      const { result: query1Res, waitFor: wait1 } = customRenderHook(() =>
        queryNotPassArgsToQueryKey.useQuery([1])
      );
      const { result: query2Res, waitFor: wait2 } = customRenderHook(() =>
        queryNotPassArgsToQueryKey.useQuery([2])
      );

      await wait1(() => query1Res.current.isSuccess);
      await wait2(() => query2Res.current.isSuccess);

      expect(query1Res.current.data).toEqual(query2Res.current.data);
    });
  });
});
