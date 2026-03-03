import * as React from "react"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variantStyles = variant === "destructive"
      ? "border-red-500 bg-red-50 text-red-900"
      : "border-blue-500 bg-blue-50 text-blue-900";

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 ${variantStyles} ${className}`}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

export { Alert }
