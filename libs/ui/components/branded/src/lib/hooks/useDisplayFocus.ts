export const useDisplayFocus = () => {
  /**
   * Scrolls Display to given element
   * @param {string} id Id of html element to scroll to
   * @returns {boolean} Success indication
   */
  const scrollToElementById = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView(false); // false indicates do NOT align to top of page
      return true;
    }
    return false;
  };

  /**
   * Focused Display on given element
   * @param {string} id Id of html element to scroll to
   * @returns {boolean} Success indication
   */
  const focusOnElementById = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      (element as HTMLElement).focus({ preventScroll: true });
      return true;
    }
    return false;
  };

  return {
    scrollToElementById,
    focusOnElementById,
  };
};
