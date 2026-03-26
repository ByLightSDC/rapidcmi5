import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import { usePositiveParticleBurst } from '../../hooks/particles/usePositiveParticleBurst';

/**
 * Flag Positive Particle Fx
 * @returns JSX.ELement
 */
export function FlagPositiveEffect() {
  const canvasRef = usePositiveParticleBurst(true);

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <OutlinedFlagIcon color="success" />
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
