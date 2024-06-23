import { ChangeEvent, useCallback, useRef } from "react";
import { Updater } from "use-immer";
import { PopupActions } from "reactjs-popup/dist/types";

import {
  PALETTE_MAX_HEIGHT,
  PALETTE_MAX_WIDTH,
  PALETTE_MIN_HEIGHT,
  PALETTE_MIN_WIDTH,
  Palette,
} from "../../model/Palette";
import { CelIndex } from "../../util/cel";
import { PaletteView } from "./PaletteView";
import { PaletteAction, PaletteActionType } from "../../reducers/PaletteReducer";
import { DropdownButton } from "../common/DropdownButton";
import { CelSelector } from "../common/CelSelector";
import { PaletteToolType, PaletteViewState } from "../../model/ProjectViewState";

type PaletteToolbarButtonProps = {
  tool: PaletteToolType;
  title: string;
  icon: string;
  viewState: PaletteViewState;
  onViewStateChange: Updater<PaletteViewState>;
};

function PaletteToolbarButton(props: PaletteToolbarButtonProps) {
  const active = props.tool === props.viewState.tool;

  function handleClick() {
    props.onViewStateChange((draft) => {
      draft.tool = props.tool;
    });
  }

  return (
    <>
      <button onClick={handleClick} className={active ? "thin-button selected" : "thin-button"} title={props.title}>
        <i className={props.icon}></i>
      </button>
    </>
  );
}

type PaletteToolbarProps = {
  viewState: PaletteViewState;
  onViewStateChange: Updater<PaletteViewState>;
};

function PaletteToolbar(props: PaletteToolbarProps) {
  return (
    <>
      <div className="palette-toolbar">
        <PaletteToolbarButton tool={PaletteToolType.Select} title="Select cel" icon="icon-mouse" {...props} />
        <PaletteToolbarButton tool={PaletteToolType.Paint} title="Paint color on cels" icon="icon-paint" {...props} />
        <PaletteToolbarButton
          tool={PaletteToolType.FloodFill}
          title="Flood fill color over cels"
          icon="icon-bucket"
          {...props}
        />
      </div>
    </>
  );
}

type AppPaletteProps = {
  palette: Palette;
  onPaletteChange: React.Dispatch<PaletteAction>;
  viewState: PaletteViewState;
  onViewStateChange: Updater<PaletteViewState>;
};

function PaletteResizer(props: AppPaletteProps) {
  const [oldWidth, oldHeight] = props.palette.dimensions;
  const canShrinkX = oldWidth > PALETTE_MIN_WIDTH;
  const canShrinkY = oldHeight > PALETTE_MIN_HEIGHT;
  const canGrowX = oldWidth < PALETTE_MAX_WIDTH;
  const canGrowY = oldHeight < PALETTE_MAX_HEIGHT;
  const activeIndex = props.viewState.activeIndex;
  const cursorIndex = props.viewState.cursorIndex;

  function resize(widthDiff: number, heightDiff: number, offsetX: number, offsetY: number) {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.ResizePalette,
        args: {
          newWidth: oldWidth + widthDiff,
          newHeight: oldHeight + heightDiff,
          offsetX,
          offsetY,
        },
      })
    );
    props.onViewStateChange((draft) => {
      draft.activeIndex = { x: activeIndex.x + offsetX, y: activeIndex.y + offsetY };
      draft.cursorIndex = { x: cursorIndex.x + offsetX, y: cursorIndex.y + offsetY };
    });
  }

  return (
    <>
      <div className="palette-resizer-outside">
        <div className="palette-resizer-updown">
          <button className="thin-button" title="Add to Top" disabled={!canGrowY} onClick={() => resize(0, 1, 0, 1)}>
            <i className="icon-plus"></i>
          </button>
        </div>
        <div className="palette-resizer-leftright">
          <button className="thin-button" title="Add to Left" disabled={!canGrowX} onClick={() => resize(1, 0, 1, 0)}>
            <i className="icon-plus"></i>
          </button>
        </div>
        <div className="palette-resizer-inside">
          <div className="palette-resizer-updown">
            <button
              className="thin-button"
              title="Shrink from Top"
              disabled={!canShrinkY}
              onClick={() => resize(0, -1, 0, -1)}
            >
              <i className="icon-minus"></i>
            </button>
          </div>
          <div className="palette-resizer-leftright">
            <button
              className="thin-button"
              title="Shrink from Left"
              disabled={!canShrinkX}
              onClick={() => resize(-1, 0, -1, 0)}
            >
              <i className="icon-minus"></i>
            </button>
          </div>
          <div className="palette-resizer-inside-label">
            Size:
            <br />
            {props.palette.width}x{props.palette.height}
          </div>
          <div className="palette-resizer-leftright">
            <button
              className="thin-button"
              title="Shrink from Right"
              disabled={!canShrinkX}
              onClick={() => resize(-1, 0, 0, 0)}
            >
              <i className="icon-minus"></i>
            </button>
          </div>
          <div className="palette-resizer-updown">
            <button
              className="thin-button"
              title="Shrink from Bottom"
              disabled={!canShrinkY}
              onClick={() => resize(0, -1, 0, 0)}
            >
              <i className="icon-minus"></i>
            </button>
          </div>
        </div>
        <div className="palette-resizer-leftright">
          <button className="thin-button" title="Add to Right" disabled={!canGrowX} onClick={() => resize(1, 0, 0, 0)}>
            <i className="icon-plus"></i>
          </button>
        </div>
        <div className="palette-resizer-updown">
          <button className="thin-button" title="Add to Bottom" disabled={!canGrowY} onClick={() => resize(0, 1, 0, 0)}>
            <i className="icon-plus"></i>
          </button>
        </div>
      </div>
    </>
  );
}

function PaletteExportRange(props: AppPaletteProps) {
  function startChanged(index: CelIndex) {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.SetExportRange,
        args: {
          exportStart: index,
          exportEnd: props.palette.exportEnd,
        },
      })
    );
  }

  function endChanged(index: CelIndex) {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.SetExportRange,
        args: {
          exportStart: props.palette.exportStart,
          exportEnd: index,
        },
      })
    );
  }

  return (
    <>
      <div className="palette-export-range">
        Export range
        <CelSelector noPicker={true} index={props.palette.exportStart} onIndexChange={startChanged} />
        to
        <CelSelector noPicker={true} index={props.palette.exportEnd} onIndexChange={endChanged} />
      </div>
    </>
  );
}

export function AppPalette(props: AppPaletteProps) {
  const popupRef = useRef<PopupActions>(null);
  const onPaletteChange = props.onPaletteChange;

  const handleNameChange = useCallback(
    function (event: ChangeEvent<HTMLInputElement>) {
      onPaletteChange(
        new PaletteAction({
          actionType: PaletteActionType.RenamePalette,
          args: { paletteName: event.target.value },
        })
      );
    },
    [onPaletteChange]
  );

  return (
    <>
      <div id="document-palette" className="section">
        <div className="palette-header">
          <PaletteToolbar viewState={props.viewState} onViewStateChange={props.onViewStateChange} />
          <DropdownButton label="Palette" className="thin-button" popupRef={popupRef}>
            <div className="palette-menu">
              <PaletteResizer {...props} />
              <PaletteExportRange {...props} />
            </div>
          </DropdownButton>
          <input
            className="palette-rename flat-text"
            type="text"
            value={props.palette.paletteName}
            onChange={handleNameChange}
            placeholder={"Untitled Palette"}
          />
        </div>
        <div id="palette-inner-bg" className="section-gray-background">
          <PaletteView
            palette={props.palette}
            onPaletteChange={props.onPaletteChange}
            viewState={props.viewState}
            onViewStateChange={props.onViewStateChange}
            autoFocus={true}
          />
        </div>
      </div>
    </>
  );
}
