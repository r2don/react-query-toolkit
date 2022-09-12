import React from "react";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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
  options?,
) => {
  return renderHook<TResult, TProps>(hook, {
    ...options,
    wrapper,
  });
};
