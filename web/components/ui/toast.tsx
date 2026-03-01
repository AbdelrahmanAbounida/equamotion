import { toast } from "sonner";

type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastContent {
  title: string;
  description: string;
  position?: Position;
  richColors?: boolean;
  action?: ToastAction;
}

const toastContent = (title: string, description: string) => (
  <div className="flex flex-col gap-1">
    <p className="font-semibold">{title}</p>
    <p className="text-sm text-muted-foreground wrap-break-word">
      {description}
    </p>
  </div>
);

const toastAction = (action?: ToastAction) =>
  action
    ? {
        action: {
          label: action.label,
          onClick: action.onClick,
        },
      }
    : {};

export const showSuccessToast = (
  { title, description, position, action }: ToastContent,
  options?: Parameters<typeof toast.success>[1],
) => {
  toast.success(toastContent(title, description), {
    position: position || "bottom-right",
    ...toastAction(action),
    ...options,
  });
};

export const showErrorToast = (
  { title, description, position, richColors, action }: ToastContent,
  options?: Parameters<typeof toast.error>[1],
) => {
  toast.error(toastContent(title, description), {
    position: position || "bottom-right",
    richColors,
    ...toastAction(action),
    ...options,
  });
};

export const showInfoToast = (
  { title, description, position, action }: ToastContent,
  options?: Parameters<typeof toast.info>[1],
) => {
  toast.info(toastContent(title, description), {
    position: position || "bottom-right",
    ...toastAction(action),
    ...options,
  });
};

export const showWarningToast = (
  { title, description, position, action }: ToastContent,
  options?: Parameters<typeof toast.warning>[1],
) => {
  toast.warning(toastContent(title, description), {
    position: position || "bottom-right",
    ...toastAction(action),
    ...options,
  });
};
