import { useState } from 'react'

import AppHeader from './widgets/AppHeader.tsx'
import ColorSelector from './widgets/ColorSelector.tsx'
import Color from './model/Color.ts';

function App() {
  const [count, setCount] = useState(0);
  const [color, setColor] = useState(new Color());

  return (
    <>
      <AppHeader />
      <div className="section">
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
      </div>
      <div className="section">
        <ColorSelector color={color} colorChanged={(color) => setColor(color)} />
      </div>
      <div className="section">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}

export default App
