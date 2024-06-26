import { PopupBase, PopupChoiceMenu, PopupMenu, PopupMenuChoiceData } from "./PopupMenu";
import { PopupActions } from "reactjs-popup/dist/types";

type DropdownButtonTriggerProps = {
  label: string;
  className?: string;
  [key: string]: any;
};

function DropdownButtonTrigger({ label, className, ...other }: DropdownButtonTriggerProps) {
  return (isOpen: boolean) => {
    let dropdownClass = isOpen ? "dropdown selected" : "dropdown";
    if (className) dropdownClass = dropdownClass + " " + className;

    return (
      <button className={dropdownClass} {...other}>
        {label}
      </button>
    );
  };
}

export type DropdownButtonProps = {
  label: string;
  children: React.ReactNode;
  popupRef: React.RefObject<PopupActions>;
  className?: string;
  [key: string]: any;
};

export function DropdownButton({ label, children, popupRef, className, ...other }: DropdownButtonProps) {
  const dropdownButton = DropdownButtonTrigger({ label, className, ...other });

  return (
    <>
      <PopupBase button={dropdownButton} popupRef={popupRef}>
        {children}
      </PopupBase>
    </>
  );
}

export function DropdownMenuButton({ label, children, popupRef, className, ...other }: DropdownButtonProps) {
  const dropdownButton = DropdownButtonTrigger({ label, className, ...other });

  return (
    <>
      <PopupMenu button={dropdownButton} popupRef={popupRef}>
        {children}
      </PopupMenu>
    </>
  );
}

export type DropdownChoiceButtonProps = {
  label: string;
  items: readonly PopupMenuChoiceData[];
  current?: number;
  onItemSelect: (index: number) => void;
  className?: string;
  [key: string]: any;
};

export function DropdownChoiceButton({
  label,
  items,
  current,
  onItemSelect,
  className,
  ...other
}: DropdownChoiceButtonProps) {
  const dropdownButton = DropdownButtonTrigger({ label, className, ...other });

  return (
    <>
      <PopupChoiceMenu button={dropdownButton} items={items} current={current} onItemSelect={onItemSelect} />
    </>
  );
}
