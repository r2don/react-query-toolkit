import {
  QueryClient,
  QueryKey,
  useQuery,
  useInfiniteQuery,
  useIsFetching,
  defaultContext,
} from "react-query";
import { generateKey } from "./internal/generateKey";
import { returnByCondition } from "./internal/returnByCondition";
import { QueryCreator, QueryToolkit } from "./types/queryToolkit";

export function createQueryToolkit(queryClient: QueryClient): QueryCreator {
  return (queryKey, queryFn, options = {}) => {
    const {
      passArgsToQueryKey = true,
      queryType = "query",
      defaultOptions,
    } = options;

    const isInfiniteQuery = queryType === "infiniteQuery";
    const returnOnQuery = returnByCondition(!isInfiniteQuery);
    const returnOnInfiniteQuery = returnByCondition(isInfiniteQuery);

    const keyGenerator = generateKey(queryKey);
    const getKey = (queryKey?: QueryKey, args?: QueryKey) =>
      keyGenerator([
        ...(queryKey ? queryKey : []),
        ...(passArgsToQueryKey && args ? args : []),
      ]);

    const handleHooks = (hook: any) => (args?: any, queryOptions?: any) =>
      hook(getKey(queryOptions?.queryKey, args), queryFn(...(args || [])), {
        context: defaultContext,
        ...defaultOptions,
        ...queryOptions,
      });

    const hooks: Partial<
      Pick<QueryToolkit, "useQuery" | "useInfiniteQuery" | "useIsFetching">
    > = {
      useQuery: returnOnQuery(handleHooks(useQuery)),
      useInfiniteQuery: returnOnInfiniteQuery(handleHooks(useInfiniteQuery)),
      useIsFetching: (filters) =>
        useIsFetching(getKey(filters?.queryKey), filters, {
          context: defaultContext,
        }),
    };

    const handleFetchFunctions = (
      path: keyof QueryToolkit,
      conditionalReturnFunc: ReturnType<typeof returnByCondition>,
    ) =>
      conditionalReturnFunc((args: any, options: any) =>
        (queryClient as any)[path](
          getKey(options?.queryKey, args),
          queryFn(...(args || [])),
          { ...defaultOptions, ...options },
        ),
      );

    return new Proxy(hooks, {
      get(target: any, path: keyof QueryToolkit) {
        if (target[path]) return target[path];
        switch (path) {
          case "fetchQuery":
          case "prefetchQuery":
            return handleFetchFunctions(path, returnOnQuery);

          case "fetchInfiniteQuery":
          case "prefetchInfiniteQuery":
            return handleFetchFunctions(path, returnOnInfiniteQuery);

          case "getQueryData":
          case "getQueryState":
          case "setQueryData":
            return (queryKey: any, ...rest: any) =>
              (queryClient as any)[path](getKey(queryKey), ...rest);

          default:
            if (!(queryClient as any)[path])
              throw new Error("unknown property is given");
            return (...args: any) => (queryClient as any)[path](...args);
        }
      },
    });
  };
}
