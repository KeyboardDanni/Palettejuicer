import { useRef } from "react";
import Popup from "reactjs-popup";
import { EventType, PopupActions } from "reactjs-popup/dist/types";

export function PopupMenuSeparatorItem() {
  return (
    <>
      <li className="menu-separator"></li>
    </>
  );
}

export type PopupMenuItemProps = {
  index: number;
  name: string;
  description: string;
  popupRef?: React.RefObject<PopupActions>;
  onItemSelect: (index: number) => void;
};

export function PopupMenuItem(props: PopupMenuItemProps) {
  function handleKey(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Enter":
        handleSelect();
        break;
    }
  }

  function handleSelect() {
    props.onItemSelect(props.index);
    props.popupRef?.current?.close();
  }

  return (
    <>
      <li
        className="menu-item"
        title={props.description}
        data-id={props.index}
        tabIndex={0}
        onMouseUp={handleSelect}
        onKeyDown={handleKey}
      >
        <div>{props.name}</div>
      </li>
    </>
  );
}

export type PopupMenuChoiceData = {
  name: string;
  description: string;
  beginGroup?: boolean;
};

export type PopupMenuProps = {
  button?: JSX.Element | ((isOpen: boolean) => JSX.Element);
  on?: EventType | EventType[];
  open?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  popupRef: React.RefObject<PopupActions>;
};

export function PopupMenu({ button, on, open, onClose, children, popupRef }: PopupMenuProps) {
  const ref = useRef<HTMLUListElement>(null);

  function handleKey(event: React.KeyboardEvent) {
    if (!ref.current) {
      return;
    }

    const currentId = parseInt((event.target as HTMLElement).dataset["id"] ?? "0");
    const items = ref.current.querySelectorAll(".menu-item");

    switch (event.key) {
      case "ArrowUp":
        (items[Math.max(0, currentId - 1)] as HTMLElement).focus();
        event.preventDefault();
        break;
      case "ArrowDown":
        (items[Math.min(currentId + 1, items.length - 1)] as HTMLElement).focus();
        event.preventDefault();
        break;
    }
  }

  return (
    <>
      <Popup
        trigger={button}
        on={on}
        open={open}
        onClose={onClose}
        ref={popupRef}
        position="bottom left"
        arrow={false}
        keepTooltipInside="#app-wrapper"
      >
        <div className="popup">
          <div className="menu" onKeyDown={handleKey}>
            <ul ref={ref}>{children}</ul>
          </div>
        </div>
      </Popup>
    </>
  );
}

export type PopupChoiceMenuProps = {
  button: (isOpen: boolean) => JSX.Element;
  items: readonly PopupMenuChoiceData[];
  onItemSelect: (index: number) => void;
};

export function PopupChoiceMenu(props: PopupChoiceMenuProps) {
  const popupRef = useRef<PopupActions>(null);
  const itemProps = [];

  for (const [id, item] of props.items.entries()) {
    const menuItem = (
      <PopupMenuItem
        key={id}
        name={item.name}
        description={item.description}
        index={id}
        popupRef={popupRef}
        onItemSelect={props.onItemSelect}
      />
    );

    if (item.beginGroup && id > 0) {
      itemProps.push(<PopupMenuSeparatorItem key={`separator ${id}`} />);
    }

    itemProps.push(menuItem);
  }

  return (
    <>
      <PopupMenu button={props.button} popupRef={popupRef}>
        {itemProps}
      </PopupMenu>
    </>
  );
}
