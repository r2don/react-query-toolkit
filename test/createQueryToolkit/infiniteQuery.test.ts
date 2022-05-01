import { waitFor } from "@testing-library/react";
import { expect, it, describe } from "vitest";

import { createQueryToolkit } from "../../src/createQueryToolkit";
import { customRenderHook, mockQueryClient } from "../utils";

const queryToolkit = createQueryToolkit(mockQueryClient);

describe("createQueryToolkit/infiniteQuery", () => {
  describe("simple api", () => {
    const mockData = [
      { text: "123", id: 1 },
      { text: "456", id: 2 },
      { text: "456", id: 2 },
      { text: "456", id: 2 },
      { text: "456", id: 2 },
    ];
    const simpleApiQuery = queryToolkit(
      ["simpleApi"],
      () =>
        ({ pageParam = 0 }) =>
          Promise.resolve(mockData.slice(pageParam, pageParam + 1)),
      {
        queryType: "infiniteQuery",
      },
    );

    it("could be used with useInfiniteQuery", async () => {
      const { result } = customRenderHook(() =>
        simpleApiQuery.useInfiniteQuery([], {
          queryKey: ["useInfiniteQuery"],
          getNextPageParam: (_, allPages) => {
            return allPages.length;
          },
        }),
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({
          pages: [mockData.slice(0, 1)],
          pageParams: [undefined],
        });
      });
    });

    it("should get next page", async () => {
      const { result } = customRenderHook(() =>
        simpleApiQuery.useInfiniteQuery([], {
          queryKey: ["useInfiniteQuery"],
          getNextPageParam: (_, allPages) => {
            return allPages.length;
          },
        }),
      );
      await waitFor(() => {
        expect(result.current.data).toEqual({
          pages: [mockData.slice(0, 1)],
          pageParams: [undefined],
        });
      });

      const { data } = await result.current.fetchNextPage();

      expect(data).toEqual({
        pages: [...mockData.slice(0, 2).map((v) => [v])],
        pageParams: [undefined, 1],
      });
    });

    it("could be used with select", async () => {
      const { result } = customRenderHook(() =>
        simpleApiQuery.useInfiniteQuery([], {
          select: (data) => ({
            pages: data.pages.map((v) => v.map((v) => v.text)),
            pageParams: data.pageParams,
          }),
          getNextPageParam: (_, allPages) => {
            return allPages.length;
          },
          queryKey: ["select"],
        }),
      );
      await waitFor(() => {
        expect(result.current.data).toEqual({
          pages: [["123"]],
          pageParams: [undefined],
        });
      });
    });

    it("should prefetch data", async () => {
      await simpleApiQuery.prefetchInfiniteQuery([], {
        queryKey: ["prefetch"],
      });

      const { result } = customRenderHook(() =>
        simpleApiQuery.useInfiniteQuery([], {
          queryKey: ["prefetch"],
        }),
      );

      expect(result.current.isLoading).toEqual(false);
      expect(result.current.data).toEqual({
        pages: [mockData.slice(0, 1)],
        pageParams: [undefined],
      });
    });

    it("should get proper value from isFetching", async () => {
      const { result } = customRenderHook(() =>
        simpleApiQuery.useInfiniteQuery([], {
          queryKey: ["isFetching1"],
        }),
      );

      customRenderHook(() =>
        simpleApiQuery.useInfiniteQuery([], {
          queryKey: ["isFetching2"],
        }),
      );

      const { result: isFetchingResult } = customRenderHook(() =>
        simpleApiQuery.useIsFetching(),
      );

      expect(result.current.isFetching).toEqual(true);
      expect(isFetchingResult.current).toEqual(2);
    });
  });

  describe("api with args", () => {
    const mockData = [
      { text: "1", id: 1, type: "a" },
      { text: "2", id: 2, type: "b" },
      { text: "3", id: 3, type: "b" },
      { text: "4", id: 4, type: "a" },
    ];
    const argApiQuery = queryToolkit(
      ["argApi"],
      (type: "a" | "b") =>
        ({ pageParam = 0 }) =>
          Promise.resolve(
            mockData
              .filter((v) => v.type === type)
              .slice(pageParam, pageParam + 1),
          ),
      { queryType: "infiniteQuery", passArgsToQueryKey: true },
    );

    it("should pass args to api func", async () => {
      const { result } = customRenderHook(() =>
        argApiQuery.useInfiniteQuery(["a"]),
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({
          pages: [[{ text: "1", id: 1, type: "a" }]],
          pageParams: [undefined],
        });
      });

      const data = argApiQuery.getQueryData(["a"]);

      expect(data).toEqual({
        pages: [[{ text: "1", id: 1, type: "a" }]],
        pageParams: [undefined],
      });

      const fetchedData = await argApiQuery.fetchInfiniteQuery(["b"]);

      expect(fetchedData).toEqual({
        pages: [[{ text: "2", id: 2, type: "b" }]],
        pageParams: [undefined],
      });
    });

    it("should pass proper queryKey by args", async () => {
      const { result: query1Res } = customRenderHook(() =>
        argApiQuery.useInfiniteQuery(["a"]),
      );
      const { result: query2Res } = customRenderHook(() =>
        argApiQuery.useInfiniteQuery(["b"]),
      );

      await waitFor(() => {
        expect(query1Res.current.data).not.toEqual(query2Res.current.data);
      });
    });

    it("should not pass args to queryKey", async () => {
      const queryNotPassArgsToQueryKey = queryToolkit(
        ["argApi"],
        (type: "a" | "b") =>
          ({ pageParam = 0 }) =>
            Promise.resolve(
              mockData
                .filter((v) => v.type === type)
                .slice(pageParam, pageParam + 1),
            ),
        {
          passArgsToQueryKey: false,
        },
      );
      const { result: query1Res } = customRenderHook(() =>
        queryNotPassArgsToQueryKey.useQuery(["a"]),
      );
      const { result: query2Res } = customRenderHook(() =>
        queryNotPassArgsToQueryKey.useQuery(["b"]),
      );

      await waitFor(() => {
        expect(query1Res.current.data).toEqual(query2Res.current.data);
      });
    });
  });
});
