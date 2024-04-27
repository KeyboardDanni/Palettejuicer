export type PageTabProps = {
  groupName: string;
  pageName: string;
  displayName?: string;
  onPageChange: (value: string) => void;
  activePage: string;
};

export function PageTab(props: PageTabProps) {
  function handlePageChange(event: React.ChangeEvent<HTMLInputElement>) {
    props.onPageChange(event.target.value);
  }

  return (
    <>
      <label className="tabbar-tab">
        <input
          type="radio"
          name={props.groupName}
          value={props.pageName}
          onChange={handlePageChange}
          checked={props.pageName === props.activePage}
        />
        <span>{props.displayName ?? props.pageName}</span>
      </label>
    </>
  );
}
