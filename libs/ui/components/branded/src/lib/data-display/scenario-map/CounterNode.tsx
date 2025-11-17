import { NodeProps } from 'reactflow';
import { useState } from 'react';

export type CounterData = {
  initialCount?: number;
};

export default function CounterNode(props: NodeProps<CounterData>) {
  const [count, setCount] = useState(props.data?.initialCount ?? 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button className="nodrag" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
