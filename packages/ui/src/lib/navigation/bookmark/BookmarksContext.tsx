


import { createContext, useEffect, useRef, useState } from 'react';
import { tBookmark, tBookmarkMetaData, bookmarkCue, bookmarkFormData, bookmarkGlobalData, clearAllFormData, clearBookmarks, saveFormData, clearFormData, appendBookmarkMetaData, clearBookmarkMetaData, pushBookmark, popBookmark } from './bookmarksReducer';
import { setModal } from '../../redux/commonAppReducer';
import { useSelector, useDispatch } from 'react-redux';

/**
 * @interface IBookmarksContext
 * @property { tBookmark[] } bookmarks Bookmark data
 * @property { [key: string]: string } formData Form field data
 * @property { [key: string]: string } globalData Form field data
 * @property {() => void} clearAllBookmarks Clear All Bookmark Data
 * @property {() => void} clearAllForms Clear All Form Data
 * @property {(key: string) => any} getFormDataByKey Get Form Field Data By Key
 * @property {()=> string} getLastBookMarkRecordId Returns the uuid of the last cued bookmark item
 * @property {(bookmark: tBookmark) => void} addBookmark Add a bookmark to the stack
 * @property {() => void} removeLastBookmark Remove bookmark from top of stack
 * @property {() => void} restoreBookmark Route to bookmark on top of stack
 * @property {(meta: tBookmarkMetaData) => void} addMetaDataToBookmark Append meta data to bookmark at top of stack
 * @property {(metaProperty: string) => any} getMetaDataFromBookmark  Get meta data to bookmark at top of stack
 * @property {(data: any) => void} addCreatedToBookmark Append meta data about a newly created object to the bookmark at top of stack
 * @property {() => void} clearCreatedFromBookmark Clear meta data about a newly created object to the bookmark at top of stack
 * @property {(meta:any) => void} addModalToBookmark Append meta data about a modal to the bookmark at top of stack
 * @property {() => void} clearModalFromBookmark Clear meta data about a modal to the bookmark at top of stack
 * @property {(key: string) => void} clearForm Clear Form Data By Key
 * @property {(key: string, value: any) => void} saveForm Save Form Data To Local Bookmarks State
 */
interface IBookmarksContext {
  bookmarks: tBookmark[];
  formData: { [key: string]: any };
  globalData: { [key: string]: any };
  clearAllBookmarks: () => void;
  clearAllForms: () => void;
  getLastBookMarkRecordId: () => string;
  getFormDataByKey: (key: string) => any;
  getGlobalDataByKey: (key: string) => any;
  getLastBookmark: () => tBookmark | null;
  addBookmark: (bookmark: tBookmark) => void;
  removeLastBookmark: () => void;
  restoreBookmark: () => void;
  restoreModal: () => boolean;
  addMetaDataToBookmark: (meta: tBookmarkMetaData) => void;
  getMetaDataFromBookmark: (metaProperty: string) => any;
  clearMetaFromBookmark: (metaProperty: string) => void;
  clearForm: (key: string) => void;
  closeForm: (data: any) => string | undefined; //submit or cancel form
  saveForm: (key: string, value: any) => void; //when form values change, persist
  // Convenience Methods - Refactor?
  addCreatedToBookmark: (data: any) => void;
  clearCreatedFromBookmark: () => void;
  addModalToBookmark: (meta: any) => void;
  clearModalFromBookmark: () => void;
}

/** @constant
 * Context for bookmarks
 *  @type {React.Context<IBookmarksContext>}
 */
export const BookmarksContext = createContext<IBookmarksContext>(
  {} as IBookmarksContext, // this allows us to create the context without having to default values
);

/**
 * @interface tProviderProps
 * @property {*} [children] Children
 */
interface tProviderProps {
  children?: any;
  disabled?: any;
}

/**
 * React context for bookmarks
 * @param {tProviderProps} props Component props
 * @return {JSX.Element} React context
 */
export const BookmarksContextProvider: any = (props: tProviderProps) => {
  const { children, disabled = false } = props;
  const bookmarkData: tBookmark[] = useSelector(bookmarkCue);
  const formData: { [key: string]: any } = useSelector(bookmarkFormData);
  const globalData: { [key: string]: any } = useSelector(bookmarkGlobalData);
  const [lastBookmarkCount, setLastBookmarkCount] = useState(0);
  const [lastBookmarkKey, setLastBookmarkKey] = useState('');

  const dispatch: any = useDispatch();
  /** @constant
   * Timer for reducing number of saves when form fields are updated in quick succession
   * @type {NodeJS.Timeout}
   * @default
   */
  const notifyTimeout = useRef<NodeJS.Timeout>();
  const timeOutSeconds = 1000;

  //#region Form
  /**
   * Clear all form data from local state
   */
  const clearAllForms = () => {
    dispatch(clearAllFormData());
  };

  /**
   * Clear all bookmarks from redux
   */
  const clearAllBookmarks = () => {
    dispatch(clearBookmarks());
    clearAllForms();
  };

  /**
   * Returns form data for this key
   * @param {string} key Unique Key, typically testId used when persisting form data
   * @return {*} Persisted Form Data
   */
  const getFormDataByKey = (key: string): any => {
    if (formData?.hasOwnProperty(key)) {
      return formData[key];
    } else {
      return null;
    }
  };

  /**
   * Returns the uuid of the last cued bookmark item
   * @param {tBookmark[]} bookmarks current bookmark cue data
   * @returns
   */
  const getLastBookMarkRecordId = () => {
    let bookmarkUuid = '';
    if (bookmarkData && bookmarkData.length > 0) {
      const lastBookmark = bookmarkData[bookmarkData.length - 1];
      // uuid can be found  in two ways
      // 1: as part of meta object (optional)
      // Example:
      //  meta:
      //     author: "rangeos@bylight.com"
      //     ...
      //    uuid: "1aa8150e-742a-4707-ae2b-f65ad406408d"
      // 2: as part of the key
      // Examples
      // with a slash
      //  key: "/components/vm_specifications/582cfe61-d1c0-45f2-8c5e-243dc2a41e42"
      // or with leading "label" (and possible array index)
      //  key: "Edit VM Image21aa8150e-742a-4707-ae2b-f65ad406408d"
      //  label: "Edit VM Image"
      if (lastBookmark?.meta?.uuid) {
        bookmarkUuid = lastBookmark.meta.uuid;
      } else {
        const lastSlash = lastBookmark.key.lastIndexOf('/');
        if (lastSlash > -1) {
          bookmarkUuid = lastBookmark.key.substring(lastSlash + 1);
        } else {
          // 36 character UUID (key may have an index such as Edit Ansible Playbook2, so cant just strip label)
          bookmarkUuid = lastBookmark.key.slice(-36);
        }
      }
    }
    return bookmarkUuid;
  };

  /**
   * Returns global data for this key
   * @param {string} key Unique Key, typically testId used when persisting global data
   * @return {*} Persisted Form Data
   */
  const getGlobalDataByKey = (key: string): any => {
    if (globalData?.hasOwnProperty(key)) {
      return globalData[key];
    } else {
      return null;
    }
  };

  const getLastBookmark = () => {
    return bookmarkData?.length >= 1
      ? bookmarkData[bookmarkData?.length - 1]
      : null;
  };

  /**
   * Save form data to local state with associated key
   * @param {string} key Unique Key
   */
  const saveForm = (key: string, value: any) => {
    if (disabled) {
      return;
    }
    if (notifyTimeout.current !== undefined) {
      clearTimeout(notifyTimeout.current);
    }

    notifyTimeout.current = setTimeout(() => {
      //replace if already exists
      dispatch(saveFormData({ key: key, value: value }));
    }, timeOutSeconds);
  };

  /**
   * Clear for data by associated key
   * @param {string} key Unique Key
   */
  const clearForm = (key: string) => {
    dispatch(clearFormData(key));
  };

  /**
   * Close form
   * Remove last bookmark
   * Add newly created data to bookmark in stack
   * Return route of return bookmark
   * @param {string} key Unique Key
   */
  const closeForm = (data: any) => {
    const numBookMarks = bookmarkData?.length;
    if (!disabled && numBookMarks > 0) {
      //look for form to return to
      const potentialNext =
        numBookMarks >= 2 ? bookmarkData[numBookMarks - 2] : null;

      removeLastBookmark();

      //check newly created data to previous selection
      if (potentialNext?.meta) {
        addCreatedToBookmark(data);
      }

      return potentialNext?.route;
    }
    return undefined;
  };
  //#endregion

  /**
   * useEffect listens for view to change after bookmark popped/pushed
   * and routes to top bookmark
   */
  useEffect(() => {
    //only restore when forms are popping off of the list
    if (bookmarkData.length < lastBookmarkCount) {
      restoreBookmark();
    }
    setLastBookmarkCount(bookmarkData.length);
  }, [bookmarkData.length, lastBookmarkCount]);

  /**
   * Saved a newly created object in the last bookmark pushed to the stack
   * @param {*} data Created object
   */
  const addCreatedToBookmark = (data: any) => {
    dispatch(
      appendBookmarkMetaData({ metaProperty: 'created', metaValue: data }),
    );
  };

  /**
   * Clear a newly created object from the last bookmark pushed to the stack
   */
  const clearCreatedFromBookmark = () => {
    dispatch(clearBookmarkMetaData('created'));
  };

  /**
   * Saved selection data in the last bookmark pushed to the stack
   * @param {*} modal Information about a selection modal
   */
  const addModalToBookmark = (modal: any) => {
    dispatch(
      appendBookmarkMetaData({ metaProperty: 'modal', metaValue: modal }),
    );
  };

  /**
   * Clear selection data from the last bookmark pushed to the stack
   */
  const clearModalFromBookmark = () => {
    dispatch(clearBookmarkMetaData('modal'));
  };

  /**
   * Saved value in the last bookmark pushed to the stack
   * @param {tBookmarkMetaData} meta Key Value pair
   */
  const addMetaDataToBookmark = (meta: tBookmarkMetaData) => {
    dispatch(appendBookmarkMetaData(meta));
  };

  /**
   * Return value from the last bookmark pushed to the stack
   * @param {string} metaProperty Property Key
   */
  const getMetaDataFromBookmark = (metaProperty: string) => {
    if (bookmarkData?.length > 0) {
      if (bookmarkData[bookmarkData.length - 1].hasOwnProperty('meta')) {
        if (
          bookmarkData[bookmarkData.length - 1].meta &&
          bookmarkData[bookmarkData.length - 1].meta.hasOwnProperty(
            metaProperty,
          )
        ) {
          return bookmarkData[bookmarkData.length - 1].meta[metaProperty];
        }
      }
    } else {
      return getGlobalDataByKey(metaProperty);
    }
    return null;
  };

  /**
   * Clear value from the last bookmark pushed to the stack
   * @param {string} metaProperty Property Key
   */
  const clearMetaFromBookmark = (metaProperty: string) => {
    dispatch(clearBookmarkMetaData(metaProperty));
  };

  /**
   * Push a bookmark to the top of the stack
   * @param {tBookmark} bookmark Bookmark
   */
  const addBookmark = (bookmark: tBookmark) => {
    if (disabled) {
      return;
    }

    setLastBookmarkKey(bookmark.key);
    dispatch(pushBookmark(bookmark));
  };

  /**
   * Pop last bookmark off the stack
   */
  const removeLastBookmark = () => {
    setLastBookmarkKey('');
    dispatch(popBookmark());
  };

  /**
   * Route to the bookmark on top of stack
   * checks to see of there is an associated selection modal to pop
   * dispatches modal message accordingly
   */
  const restoreBookmark = () => {
    // close current modal first
    dispatch(setModal({ type: '', id: null, name: null }));

    if (bookmarkData && bookmarkData?.length >= 1) {
      const bookmarkChildModal =
        bookmarkData[bookmarkData.length - 1].meta?.modal;
      const bookmarkAltModal = bookmarkData[bookmarkData.length - 1].altModal;

      if (bookmarkChildModal) {
        //for Selection Modals
        dispatch(
          setModal({
            id: bookmarkChildModal.id,
            meta: bookmarkChildModal.meta,
            name: bookmarkChildModal.name,
            topic: bookmarkChildModal.topic,
            type: bookmarkChildModal.type,
            crudType: bookmarkChildModal.crudType,
          }),
        );
      } else if (bookmarkAltModal) {
        //for Form Modals
        dispatch(
          setModal({
            id: bookmarkAltModal.id,
            meta: bookmarkAltModal.meta,
            name: bookmarkAltModal.name,
            topic: bookmarkAltModal.topic,
            type: bookmarkAltModal.type,
            crudType: bookmarkAltModal.crudType,
          }),
        );
      }
    }
  };

  const restoreModal = (): boolean => {
    const top =
      bookmarkData?.length >= 1 ? bookmarkData[bookmarkData?.length - 1] : null;

    if (top && top.altModal) {
      //if top of bookmarks has a modal, reinstate it
      dispatch(
        setModal({
          id: top.altModal.id,
          meta: top.altModal.meta,
          name: top.altModal.name,
          type: top.altModal.type,
          crudType: top.altModal.crudType,
          topic: top.altModal.topic,
        }),
      );
      return true;
    }
    return false;
  };

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks: bookmarkData,
        clearAllForms: clearAllForms,
        clearAllBookmarks: clearAllBookmarks,
        formData: formData,
        globalData: globalData,
        getFormDataByKey: getFormDataByKey,
        getLastBookMarkRecordId: getLastBookMarkRecordId,
        getGlobalDataByKey: getGlobalDataByKey,
        getLastBookmark: getLastBookmark,
        addCreatedToBookmark: addCreatedToBookmark,
        clearCreatedFromBookmark: clearCreatedFromBookmark,
        addModalToBookmark: addModalToBookmark,
        clearModalFromBookmark: clearModalFromBookmark,
        addMetaDataToBookmark: addMetaDataToBookmark,
        getMetaDataFromBookmark: getMetaDataFromBookmark,
        clearMetaFromBookmark: clearMetaFromBookmark,
        addBookmark: addBookmark,
        removeLastBookmark: removeLastBookmark,
        restoreBookmark: restoreBookmark,
        restoreModal: restoreModal,
        clearForm: clearForm,
        closeForm: closeForm,
        saveForm: saveForm,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
};
