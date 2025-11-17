interface tProps {
  testId?: string;
}

import ReactFlow, { useStore } from 'reactflow';
//return <div>{`${zoomLevel * 100.0}%`}</div>;
export function NetworkVizDetails({ testId = 'network_viz' }: tProps) {
  const zoomLevel = useStore((store) => store.transform[2]);
  return <div />;
  //return (<div>{`${zoomLevel * 100.0}%`}</div>);
}
export default NetworkVizDetails;
