import { PopupMenu, PopupMenuItemData } from "./PopupMenu";

export type DropdownButtonProps = {
  label: string;
  items: readonly PopupMenuItemData[];
  onItemSelect: (index: number) => void;
  [key: string]: any;
};

export function DropdownButton({ label, items, onItemSelect, ...other }: DropdownButtonProps) {
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
      <PopupMenu button={dropdownButton} items={items} onItemSelect={onItemSelect} />
    </>
  );
}
