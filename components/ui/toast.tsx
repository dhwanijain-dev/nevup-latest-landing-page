import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import GlassSurface from "@/app/components/GlassSurface";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    style={{
      position: "fixed",
      left: "50%",
      top: "16px",
      transform: "translateX(-50%)",
      zIndex: 100,
      display: "flex",
      width: "calc(100% - 2rem)",
      maxWidth: "420px",
      maxHeight: "100vh",
      flexDirection: "column",
      gap: "12px",
      padding: 0,
    }}
    className={className}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant = "default", children, ...props }, ref) => {
  const isDestructive = variant === "destructive";

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        padding: 0,
        color: isDestructive ? "#7f1d1d" : "#ffffff",
      }}
      {...props}
    >
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={20}
        borderWidth={0.07}
        brightness={50}
        opacity={0.93}
        blur={11}
        displace={0.5}
        backgroundOpacity={0.12}
        saturation={1.1}
        distortionScale={-180}
        redOffset={0}
        greenOffset={10}
        blueOffset={20}
        mixBlendMode="screen"
        style={{
          width: "100%",
          color: isDestructive ? "#7f1d1d" : "#ffffff",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "6px",
            padding: "14px 16px 14px 14px",
          }}
        >
          {children}
        </div>
      </GlassSurface>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    style={{
      display: "inline-flex",
      height: "32px",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      border: "1px solid rgba(255,255,255,0.22)",
      background: "rgba(255,255,255,0.14)",
      padding: "0 12px",
      fontSize: "14px",
      fontWeight: 500,
      color: "#ffffff",
      cursor: "pointer",
      transition: "background-color 150ms ease, border-color 150ms ease, transform 150ms ease",
    }}
    className={className}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    style={{
      position: "absolute",
      right: "8px",
      top: "8px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      padding: "4px",
      color: "rgba(255,255,255,0.75)",
      opacity: 0.8,
      background: "transparent",
      cursor: "pointer",
      border: "none",
      transition: "opacity 150ms ease, color 150ms ease, transform 150ms ease",
    }}
    toast-close=""
    className={className}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    style={{
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      color: "inherit",
      lineHeight: 1.4,
    }}
    className={className}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    style={{
      fontSize: "14px",
      lineHeight: 1.5,
      color: "rgba(255,255,255,0.75)",
    }}
    className={className}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
