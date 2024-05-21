import { useEffect, useRef } from "react";

export type PageTabProps = {
  pageName: string;
  displayName?: string;
  onPageChange: (value: string) => void;
  activePage: string;
};

export function PageTab(props: PageTabProps) {
  const ref = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (props.pageName === props.activePage && ref.current && navigator.userActivation.isActive) {
      const tabBar = ref.current.parentElement;

      if (tabBar && tabBar.scrollWidth > tabBar.clientWidth) {
        ref.current.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    }
  }, [props.pageName, props.activePage]);

  function handlePageChange(event: React.ChangeEvent<HTMLInputElement>) {
    props.onPageChange(event.target.value);
  }

  return (
    <>
      <label className="tabbar-tab" ref={ref}>
        <input
          type="radio"
          value={props.pageName}
          onChange={handlePageChange}
          checked={props.pageName === props.activePage}
        />
        <span>{props.displayName ?? props.pageName}</span>
      </label>
    </>
  );
}
