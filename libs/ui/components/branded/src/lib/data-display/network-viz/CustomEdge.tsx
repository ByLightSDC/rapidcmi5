import { FC } from 'react';
import {
  EdgeProps,
  getStraightPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';

const CustomEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceHandleId,
  data,
}) => {
  // const [edgePath, labelX, labelY] = getBezierPath({
  //   sourceX,
  //   sourceY,
  //   sourcePosition,
  //   targetX,
  //   targetY,
  //   targetPosition,
  // });
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  //console.log('sourceHandleId', sourceHandleId);
  //console.log('targetHandleId', targetHandleId);
  //console.log('connection id', id);
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        //style={{ stroke: 'red', strokeWidth: 2, strokeDasharray: 5 }}
        //style={{ strokeDasharray: sourceHandleId === 'package'       ? 5:0 }}
        style={{ strokeWidth: sourceHandleId === 'package' ? 0.5 : 2 }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            //background: '#ffcc00',
            padding: 10,
            paddingBottom: 22,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
          }}
          className="nodrag nopan"
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
