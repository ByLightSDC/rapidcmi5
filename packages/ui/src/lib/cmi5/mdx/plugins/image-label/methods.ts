import { imageLabelKeys$ } from "./vars";


/**
 * Checks to see ifimage id has content open
 * imageLabelKeys maps imageIds to labelIds
 * Triggers closing open label if click is outside label area, but within the image
 * this click outside handling enables use of tool bar buttons when content is open
 */
export const onCheckClickOutsideImageLabel = (imageId: string) => {
  let wasActive = false;
  if (Object.prototype.hasOwnProperty.call(imageLabelKeys$.value, imageId)) {
    wasActive = imageLabelKeys$.value[imageId] !== null;
    imageLabelKeys$.value = {
      ...imageLabelKeys$.value,
      [imageId]: null,
    };
    return wasActive;
  }
  return false;
};

