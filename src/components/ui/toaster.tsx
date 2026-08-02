import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-bg-main group-[.toaster]:text-text-primary group-[.toaster]:border-border-light group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-text-secondary",
          actionButton:
            "group-[.toast]:bg-accent-blue group-[.toast]:text-text-light",
          cancelButton:
            "group-[.toast]:bg-bg-input group-[.toast]:text-text-secondary",
          error:
            "group-[.toaster]:bg-bg-main group-[.toaster]:text-text-primary group-[.toaster]:border-rose-300",
        },
      }}
      {...props}
    />
  );
}
