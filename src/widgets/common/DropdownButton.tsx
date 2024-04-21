import { PopupChoiceMenu, PopupMenu, PopupMenuChoiceData } from "./PopupMenu";
import { PopupActions } from "reactjs-popup/dist/types";

export type DropdownButtonProps = {
  label: string;
  children: React.ReactNode;
  popupRef: React.RefObject<PopupActions>;
  [key: string]: any;
};

export function DropdownButton({ label, children, popupRef, ...other }: DropdownButtonProps) {
  const dropdownButton = (isOpen: boolean) => {
    const className = isOpen ? "dropdown selected" : "dropdown";

    return (
      <button className={className} {...other}>
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
  [key: string]: any;
};

export function DropdownChoiceButton({ label, items, onItemSelect, ...other }: DropdownChoiceButtonProps) {
  const dropdownButton = (isOpen: boolean) => {
    const className = isOpen ? "dropdown selected" : "dropdown";

    return (
      <button className={className} {...other}>
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
