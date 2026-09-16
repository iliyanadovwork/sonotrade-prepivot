"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    icon?: React.ComponentType;
  };
}

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

interface ChartContainerProps
  extends React.ComponentPropsWithoutRef<"div"> {
  config: ChartConfig;
  children: React.ReactElement;
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className = "", config, children, ...props }, ref) => {
    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          className={className}
          style={{ outline: 'none', ...props.style }}
          {...props}
        >
          <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
            {React.cloneElement(children as React.ReactElement<any>, { tabIndex: -1 })}
          </RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

export { ChartContainer, ChartContext, useChart };
