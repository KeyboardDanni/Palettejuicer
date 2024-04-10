import { AppBody } from "./widgets/AppBody";
import { AppHeader } from "./widgets/AppHeader";

export function App() {
  return (
    <>
      <div id="app-wrapper">
        <AppHeader />
        <AppBody />
      </div>
    </>
  );
}
