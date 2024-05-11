import { PopupChoiceMenu, PopupMenu, PopupMenuChoiceData } from "./PopupMenu";
import { PopupActions } from "reactjs-popup/dist/types";

export type DropdownButtonProps = {
  label: string;
  children: React.ReactNode;
  popupRef: React.RefObject<PopupActions>;
  className?: string;
  [key: string]: any;
};

export function DropdownButton({ label, children, popupRef, className, ...other }: DropdownButtonProps) {
  const dropdownButton = (isOpen: boolean) => {
    let dropdownClass = isOpen ? "dropdown selected" : "dropdown";
    if (className) dropdownClass = dropdownClass + " " + className;

    return (
      <button className={dropdownClass} {...other}>
        {label}
      </button>
    );
  };

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
  onItemSelect: (index: number) => void;
  className?: string;
  [key: string]: any;
};

export function DropdownChoiceButton({ label, items, onItemSelect, className, ...other }: DropdownChoiceButtonProps) {
  const dropdownButton = (isOpen: boolean) => {
    let dropdownClass = isOpen ? "dropdown selected" : "dropdown";
    if (className) dropdownClass = dropdownClass + " " + className;

    return (
      <button className={dropdownClass} {...other}>
        {label}
      </button>
    );
  };

  return (
    <>
      <PopupChoiceMenu button={dropdownButton} items={items} onItemSelect={onItemSelect} />
    </>
  );
}
