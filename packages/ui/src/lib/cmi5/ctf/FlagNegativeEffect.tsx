import ErrorIcon from '@mui/icons-material/Error';
import { useSmokeBurst } from '../../hooks/particles/useSmokeBurst';

/**
 * Flag Negative Particle Fx
 * @returns JSX.ELement
 */
export function FlagNegativeEffect() {
  const canvasRef = useSmokeBurst(true);

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <ErrorIcon color="error" />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}
