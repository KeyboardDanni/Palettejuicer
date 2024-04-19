import { useRef } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";

function PopupMenuSeparatorItem() {
  return (
    <>
      <li className="menu-separator"></li>
    </>
  );
}

type PopupMenuItemProps = {
  index: number;
  name: string;
  description: string;
  popupRef: React.RefObject<PopupActions>;
  onItemSelect: (index: number) => void;
};

function PopupMenuItem(props: PopupMenuItemProps) {
  function handleKey(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Enter":
        handleSelect();
        break;
    }
  }

  function handleSelect() {
    props.onItemSelect(props.index);
    props.popupRef.current?.close();
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

export type PopupMenuItemData = {
  name: string;
  description: string;
  beginGroup?: boolean;
};

export type PopupMenuProps = {
  button: (isOpen: boolean) => JSX.Element;
  items: readonly PopupMenuItemData[];
  onItemSelect: (index: number) => void;
};

export function PopupMenu(props: PopupMenuProps) {
  const ref = useRef<HTMLUListElement>(null);
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
      itemProps.push(
        <>
          <PopupMenuSeparatorItem key={`separator ${id}`} />
          {menuItem}
        </>
      );
    } else {
      itemProps.push(menuItem);
    }
  }

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
        trigger={props.button}
        ref={popupRef}
        position="bottom left"
        arrow={false}
        keepTooltipInside="#app-wrapper"
      >
        <div className="popup">
          <div className="menu" onKeyDown={handleKey}>
            <ul ref={ref}>{itemProps}</ul>
          </div>
        </div>
      </Popup>
    </>
  );
}
