import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "react-query";

export const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children?: any }) => (
  <QueryClientProvider client={mockQueryClient}>{children}</QueryClientProvider>
);

export const customRenderHook = <TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?
) => {
  return renderHook<TProps, TResult>(hook, {
    ...options,
    wrapper,
  });
};
