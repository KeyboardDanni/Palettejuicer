import { useRef } from "react";
import Popup from "reactjs-popup";
import { EventType, PopupActions, PopupPosition } from "reactjs-popup/dist/types";

export type PopupProps = {
  button?: JSX.Element | ((isOpen: boolean) => JSX.Element);
  on?: EventType | EventType[];
  open?: boolean;
  onClose?: () => void;
  position?: PopupPosition | PopupPosition[];
  children: React.ReactNode;
  popupRef: React.RefObject<PopupActions>;
};

export function PopupBase(props: PopupProps) {
  return (
    <>
      <Popup
        trigger={props.button}
        on={props.on}
        open={props.open}
        onClose={props.onClose}
        ref={props.popupRef}
        position={props.position ?? "bottom left"}
        arrow={false}
        keepTooltipInside="#app-wrapper"
        nested={true}
      >
        <div className="popup">{props.children}</div>
      </Popup>
    </>
  );
}

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
  description?: string;
  checked?: boolean;
  children?: React.ReactNode;
  popupRef?: React.RefObject<PopupActions>;
  onItemSelect?: (index: number) => void;
};

export function PopupMenuItem(props: PopupMenuItemProps) {
  const nestedPopupRef = useRef<PopupActions>(null);

  function handleKey(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Enter":
        handleSelect();
        break;
    }
  }

  function handleSelect() {
    if (props.onItemSelect) {
      props.onItemSelect(props.index);
    }
    nestedPopupRef.current?.open();
    props.popupRef?.current?.close();
  }

  const menuItem = (isOpen: boolean) => {
    let className = "menu-item";

    if (isOpen) className += " menu-item-open";
    if (props.children) className += " menu-item-submenu";

    return (
      <li
        className={className}
        title={props.description}
        data-id={props.index}
        tabIndex={0}
        onMouseUp={handleSelect}
        onKeyDown={handleKey}
        aria-checked={props.checked}
      >
        {props.name}
        {props.checked && (
          <>
            &nbsp;&nbsp;<i className="icon-check"></i>
          </>
        )}
      </li>
    );
  };

  if (!props.children) {
    return <>{menuItem(false)}</>;
  }

  return (
    <>
      <PopupMenu button={menuItem} on={"hover"} popupRef={nestedPopupRef} position="right top">
        {props.children}
      </PopupMenu>
    </>
  );
}

export type PopupMenuChoiceData = {
  name: string;
  description: string;
  beginGroup?: boolean;
};

export function PopupMenu(props: PopupProps) {
  const ref = useRef<HTMLUListElement>(null);

  function handleKey(event: React.KeyboardEvent) {
    if (!ref.current) {
      return;
    }

    // Stop this menu from stealing keystrokes if it's not the topmost
    if (ref.current.closest(".popup-content")?.nextElementSibling?.classList.contains("popup-content")) {
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
      <PopupBase {...props}>
        <div className="menu" onKeyDown={handleKey}>
          <ul ref={ref}>{props.children}</ul>
        </div>
      </PopupBase>
    </>
  );
}

export type PopupChoiceMenuProps = {
  button: (isOpen: boolean) => JSX.Element;
  items: readonly PopupMenuChoiceData[];
  current?: number;
  onItemSelect: (index: number) => void;
};

export function PopupChoiceMenu(props: PopupChoiceMenuProps) {
  const popupRef = useRef<PopupActions>(null);
  const itemProps = [];

  for (const [id, item] of props.items.entries()) {
    const menuItem = (
      <PopupMenuItem
        key={id}
        index={id}
        name={item.name}
        description={item.description}
        checked={id === props.current}
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
