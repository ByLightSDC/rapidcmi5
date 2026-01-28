import { AnimationConfig } from "@rapid-cmi5/ui";

/**
 * Compare two animation arrays to see if they have meaningful changes
 * Ignores targetNodeKey changes (from stable ID resolution) as those don't represent user edits
 *
 * @param a - First animation array
 * @param b - Second animation array
 * @returns true if animations are equal (ignoring targetNodeKey differences)
 */
export function areAnimationsEqual(
  a: AnimationConfig[],
  b: AnimationConfig[],
): boolean {
  if (a.length !== b.length) return false;

  // Compare each animation (ignoring targetNodeKey which changes on resolution)
  return a.every((animA, index) => {
    const animB = b[index];
    if (!animB) return false;

    // Compare all fields EXCEPT targetNodeKey (which changes legitimately on resolution)
    return (
      animA.id === animB.id &&
      animA.order === animB.order &&
      animA.stableId === animB.stableId &&
      animA.targetLabel === animB.targetLabel &&
      animA.entranceEffect === animB.entranceEffect &&
      animA.exitEffect === animB.exitEffect &&
      animA.trigger === animB.trigger &&
      animA.duration === animB.duration &&
      animA.delay === animB.delay &&
      animA.easing === animB.easing &&
      animA.direction === animB.direction &&
      animA.enabled === animB.enabled
    );
  });
}



