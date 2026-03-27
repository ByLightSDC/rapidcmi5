import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import ErrorIcon from '@mui/icons-material/Error';
import { usePositiveParticleBurst } from '../../hooks/particles/usePositiveParticleBurst';
import { useSmokeBurst } from '../../hooks/particles/useSmokeBurst';

/**
 * Renders a canvas-based particle effect to indicate a correct or incorrect answer.
 * @param isSuccess - When `true`, displays a celebratory burst effect. When `false`, displays a smoke dissolve effect. Defaults to `true`.
 * @returns A positioned canvas element with an animated particle effect.
 */
export function FlagEffect({ isSuccess = true }: { isSuccess?: boolean }) {
  const canvasRefPositive = usePositiveParticleBurst(true);
  const canvasRefNegative = useSmokeBurst(true);

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {isSuccess ? (
        <OutlinedFlagIcon color="success" />
      ) : (
        <ErrorIcon color="error" />
      )}

      <canvas
        ref={isSuccess ? canvasRefPositive : canvasRefNegative}
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
