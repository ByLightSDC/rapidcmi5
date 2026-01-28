/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useState, useRef, useContext, useEffect, SyntheticEvent } from 'react';
import { useSelector } from 'react-redux';
import Draggable from 'react-draggable';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import Guacamole from 'guacamole-common-js';
import 'react-resizable/css/styles.css';


/** MUI */
import { Box } from '@mui/material';
import { Backdrop, Typography, AppBar, IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

/** Icons */
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import LoginIcon from '@mui/icons-material/Login';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import KeyboardHideIcon from '@mui/icons-material/KeyboardHide';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';

import keyboardData from './virtual-keyboard/en-us-qwerty.json';
import './virtual-keyboard/osk.css';
import { ConsoleWindowManager } from './ConsoleWindowManager';
import ConnectionAttemptDisplay from './ConnectionAttemptDisplay';
import { getTunnelErrorMessage } from './constants';
import { ConsoleContext } from './ConsoleContext';
import { authIdToken, isSSOEnabled } from '@rapid-cmi5/keycloak';
import { useToaster, debugLogSuccess, debugLogError, debugLog } from '@rapid-cmi5/ui';

// guacamole connection settings
const guacProtocol = 'wss';

// window default size
const DEFAULT_WINDOW_WIDTH = 800;
const DEFAULT_WINDOW_HEIGHT = 600;

// minimum acceptable initial window size
const MIN_WINDOW_WIDTH = 300;
const MIN_WINDOW_HEIGHT = 200;

// threshold for App Bar to be visible
const MIN_WIDTH_APP_BAR_VISIBLE = 200;

// app bar at top of window, height in pixels
const APP_BAR_HEIGHT = 28;

// if window is dragged offscreen, bring it back enough to see
const MAX_DRAG_BUFFER = 30;

// guacamole's cursor canvas is always 64 pixels wide
const CURSOR_DISPLAY_WIDTH = 64;

// nonsense base zoom value for init
const INIT_BASE_ZOOM = -999;

// ctrl-alt-delete keycode (just a made up number that won't clash with real keycodes)
const KEYCODE_CTRL_ALT_DEL = 99999;

const ICON_FONTSIZE = '22px';

type tProps = {
  connectionId: string;
  connectionType: string;
  connectionUrl: any;
  currentZIndex?: number;
  isRouteRelative?: boolean;
  routeDelim?: string;
  guacUserName?: string;
  guacPassword?: string;
  setCurrentZIndex: any;
  resizeMethod?: string | null;
  protocol?: string | null;
  isTab?: boolean;
  rangeId?: string;
  scenarioId?: string;
  title?: string;
  token?: string;
  windowNumber?: number;
};

export function ConsolePopup(props: tProps) {
  const ssoAuthIdToken = useSelector(authIdToken);
  const displayToaster = useToaster();

  const {
    connectionId,
    connectionType,
    connectionUrl,
    currentZIndex = 999,
    isRouteRelative = false,
    routeDelim = '/',
    guacUserName,
    guacPassword,
    setCurrentZIndex,
    resizeMethod,
    protocol,
    isTab,
    rangeId,
    scenarioId,
    title,
    token,
    windowNumber = 1,
  } = props;

  const {
    isDockingEnabled,
    getStoredWindowSettings,
    setStoredWindowSettings,
    screenToViewport,
    viewportToScreen,
    removeConsoleWindow,
    sendScenarioEvent,
  } = useContext(ConsoleContext);

  // is the aspect ratio locked?
  const isAspectRatioLocked =
    resizeMethod === null || resizeMethod === undefined;

  //if username and password supplied, use that instead of kk
  const credentialsStr =
    guacUserName && guacPassword
      ? `username=${guacUserName}&password=${guacPassword}`
      : undefined;
  //REF whether or not user is not authenticated with keycloak
  const isSSOEnabledSel = useSelector(isSSOEnabled);
  const [zIndex, setZIndex] = useState<number>(999);
  const [open, setOpen] = useState(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [dataError, setDataError] = useState<string>('');
  const nodeRef = useRef(null);
  const authTokenRef = useRef('');

  const hasInitedRef = useRef(false);
  const connectionIdRef = useRef(connectionId);
  const connectionUrlRef = useRef<string>(connectionUrl); //MICO??
  const [connectionCounter, setConnectionCounter] = useState<number>(-1);
  const [isConnected, setIsConnected] = useState(false);
  const [numConnectionAttempts, setNumConnectionAttempts] = useState(1);
  const shouldCleanupOnDismountRef = useRef(false);
  const isStoringPositionOnClose = useRef(false);

  // zooming the viewport
  const baseZoomRef = useRef(INIT_BASE_ZOOM);
  const lastZoomRef = useRef(1);
  const lastResizeToZoomRef = useRef({
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
  });

  // TODO: think about updating the info the server returns so parsing a URL isn't required
  const hostRef = useRef(connectionUrl.split('/')[2].split(':')[0]);
  const portRef = useRef(connectionUrl.split('/')[2].split(':')[1]);
  if (connectionUrl.split('/')[3] === 'console') {
    portRef.current = portRef.current + '/console';
  }

  const storedWindowSettings = getStoredWindowSettings(connectionIdRef.current);

  /**
   * If a stored size exists, use that.
   * Otherwise, calculate a size based on the browser window size.
   * Keep the initial size below a maximum and above a minimum acceptable size.
   */
  const getInitSizeForBrowserScreenSize = () => {
    let initWidth = window.innerWidth / 2;
    let initHeight: number;

    if (storedWindowSettings) {
      initWidth = storedWindowSettings.width;
      initHeight = storedWindowSettings.height;
    } else {
      // if the user has a very large browser screen, limit to default size
      if (initWidth > DEFAULT_WINDOW_WIDTH) {
        initWidth = DEFAULT_WINDOW_WIDTH;
      }

      // if the user has a very small browser screen, limit to a min acceptable size
      if (initWidth < MIN_WINDOW_WIDTH) {
        initWidth = MIN_WINDOW_WIDTH;
      }

      // use an aspect ratio based on width so the window doesn't look strangely
      // tall under certain odd browser window sizes
      initHeight = initWidth / (DEFAULT_WINDOW_WIDTH / DEFAULT_WINDOW_HEIGHT);
    }

    return {
      width: initWidth,
      height: initHeight,
    };
  };

  const initSize = getInitSizeForBrowserScreenSize();

  /**
   * Center the window, unless a stored position is found.
   * If docking is happening, convert the stored position to screen space.
   */
  const getInitialPosition = () => {
    let x = window.innerWidth / 2 - initSize.width / 2;
    let y = window.innerHeight / 2 - initSize.height / 2;

    if (storedWindowSettings) {
      x = storedWindowSettings.x;
      y = storedWindowSettings.y;

      if (isDockingEnabled()) {
        const convertedPos = viewportToScreen({
          x: x,
          y: y,
        });

        x = convertedPos.x;
        y = convertedPos.y;
      }
    }

    return {
      x: x,
      y: y,
    };
  };

  const initialWindowPositionRef = useRef(getInitialPosition());

  const [windowPosition, setWindowPosition] = useState(
    initialWindowPositionRef.current,
  );
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragScaleRef = useRef<number>(1);
  const aspectRatioRef = useRef<number>(initSize.width / initSize.height);

  // the display size of the client computer
  const displaySizeRef = useRef<any>({
    width: initSize.width,
    height: initSize.height,
  });

  // the local size
  const [resizeContainerSize, setResizeContainerSize] = useState<any>({
    width: initSize.width,
    height: initSize.height,
  });

  // used to un-maximize back down to last known size
  const isMaximizedRef = useRef<boolean>(isTab ? true : false);
  const [lastResizeContainerSize, setLastResizeContainerSize] = useState<any>({
    width: initSize.width,
    height: initSize.height,
  });

  // netmap viewport
  const netmapViewportPosRef = useRef({ x: 0, y: 0 });

  // mouse and key interactivity
  const mouseRef = useRef<any>(null);
  const keyboardRef = useRef<Guacamole.Keyboard | null>(null);
  const virtualKeyboardRef = useRef(
    // @ts-ignore
    new Guacamole.OnScreenKeyboard(keyboardData),
  );

  const tunnelRef = useRef(null);
  const guacClientRef = useRef<any>(null);

  /**
   * When mousing down on a window, bring the window to the top of the
   * z hierarchy and set that window as active.
   * @param e
   */
  const handleMouseDown = (e: MouseEvent) => {
    setCurrentZIndex((zIndex: number) => {
      const nextZIndex = zIndex + 1;
      setZIndex(nextZIndex);
      return nextZIndex;
    });

    ConsoleWindowManager.setActiveWindow(connectionIdRef.current);
  };

  /**
   * Close the console popup.
   * Clean up.
   * Store the position and size in case the console popup is opened again so
   * that it can appear in the same location at the same size, unless the popup
   * is currently maximized.
   */
  const handleClose = () => {
    guacamoleDisconnect();

    // handleClose can be called twice due to a cleanup UE, so check the value
    // isStoringPositionOnClose to avoid a double save. Note that the second
    // save could have erroneous data because components no longer exist.
    if (!isMaximizedRef.current && !isStoringPositionOnClose.current) {
      isStoringPositionOnClose.current = true;

      let posToStore = {
        x: windowPosition.x,
        y: windowPosition.y,
      };

      if (isDockingEnabled()) {
        posToStore = screenToViewport(posToStore);
      }

      setStoredWindowSettings(
        connectionIdRef.current,
        posToStore.x,
        posToStore.y,
        resizeContainerSize.width,
        resizeContainerSize.height,
        isMaximizedRef.current,
      );
    }

    ConsoleWindowManager.removeWindow(connectionIdRef.current);
    setOpen(false);
    removeConsoleWindow(windowNumber);
  };

  const handleLaunch = () => {
    if (connectionUrlRef.current) {
      handleClose();

      setTimeout(() => {
        if (isRouteRelative) {
          const params = `&console=${connectionIdRef.current}&rangeId=${rangeId}&scenarioId=${scenarioId}`;
          window.open(`${document.URL}${params}`);
        } else {
          window.open(
            `/console${routeDelim}${connectionIdRef.current}${routeDelim}${rangeId}${routeDelim}${scenarioId}${document.location.search}`,
          );
        }
      }, 500);
    }
  };

  /**
   * Simulate a Ctrl-Alt-Del entry.
   */
  const handleCtrlAltDeleteClick = () => {
    // key down
    guacClientRef.current.sendKeyEvent(1, 65507);
    guacClientRef.current.sendKeyEvent(1, 65513);
    guacClientRef.current.sendKeyEvent(1, 65535);

    // key up
    guacClientRef.current.sendKeyEvent(0, 65507);
    guacClientRef.current.sendKeyEvent(0, 65513);
    guacClientRef.current.sendKeyEvent(0, 65535);
  };

  const handleVirtualKeyboardToggle = () => {
    if (!isKeyboardOpen) {
      document
        .getElementById('keyboard-' + windowNumber)!
        .appendChild(virtualKeyboardRef.current.getElement());

      virtualKeyboardRef.current.resize(resizeContainerSize.width);

      // Keyboard
      virtualKeyboardRef.current.onkeydown = function (keysym: any) {
        if (keysym === KEYCODE_CTRL_ALT_DEL) {
          // special case: ctrl-alt-del
          guacClientRef.current.sendKeyEvent(1, 65507);
          guacClientRef.current.sendKeyEvent(1, 65513);
          guacClientRef.current.sendKeyEvent(1, 65535);
        } else {
          guacClientRef.current.sendKeyEvent(1, keysym);
        }
      };

      virtualKeyboardRef.current.onkeyup = function (keysym: any) {
        if (keysym === KEYCODE_CTRL_ALT_DEL) {
          // special case: ctrl-alt-del
          guacClientRef.current.sendKeyEvent(0, 65507);
          guacClientRef.current.sendKeyEvent(0, 65513);
          guacClientRef.current.sendKeyEvent(0, 65535);
        } else {
          guacClientRef.current.sendKeyEvent(0, keysym);
        }
      };

      setIsKeyboardOpen(true);
    } else {
      // remove event listeners
      virtualKeyboardRef.current.onkeydown = null;
      virtualKeyboardRef.current.onkeyup = null;

      // remove the keyboard
      const keyboardElement = document.getElementById(
        'keyboard-' + windowNumber,
      );
      // @ts-ignore
      keyboardElement?.removeChild(keyboardElement.firstChild);
      setIsKeyboardOpen(false);
    }
  };

  /**
   * The window has begun to be dragged by the user.
   * Capture its position at the very beginning of the drag so that total
   * drag distance can be measured.
   * @param props
   */
  const handleDragStart = (props: any) => {
    dragStartRef.current = { x: props.screenX, y: props.screenY };
  };

  /**
   * The user has stopped dragging the window.
   * Calculate the total drag distance and update the window's position.
   * If the window is NOT docked to a netmap, keep the window in bounds of the
   * browser window.
   * @param props
   */
  const handleDragStop = (props: any) => {
    const dragDistance = {
      x: dragStartRef.current.x - props.screenX,
      y: dragStartRef.current.y - props.screenY,
    };

    const newPos = {
      x: windowPosition.x - dragDistance.x,
      y: windowPosition.y - dragDistance.y,
    };

    // don't allow drag offscreen unless docked to a netmap
    if (!isDockingEnabled()) {
      if (newPos.x < -resizeContainerSize.width + MAX_DRAG_BUFFER) {
        newPos.x = -resizeContainerSize.width + MAX_DRAG_BUFFER;
      }

      if (newPos.x > window.innerWidth) {
        newPos.x = window.innerWidth - MAX_DRAG_BUFFER;
      }

      if (newPos.y < 0) {
        newPos.y = 0;
      }

      if (newPos.y > window.innerHeight) {
        newPos.y = window.innerHeight - MAX_DRAG_BUFFER;
      }
    } else {
      // update the window's location in the viewport space of react flow
      netmapViewportPosRef.current = screenToViewport({
        x: newPos.x,
        y: newPos.y,
      });
    }

    updatePosition(newPos.x, newPos.y);
  };

  /**
   * Set the window's scale.
   * @param width
   * @param height
   * @param shouldStoreLastSize
   */
  const updateSize = (
    width: number,
    height: number,
    shouldStoreLastSize = true,
  ) => {
    let scale = width / displaySizeRef.current.width;

    // if the aspect ratio is not locked, take the smallest scale value of width
    // or height so that the display will stay within the bounds of the resize
    // area
    if (!isAspectRatioLocked) {
      const heightScale = height / displaySizeRef.current.height;
      if (heightScale < scale) {
        scale = heightScale;
      }
    }

    setResizeContainerSize({
      width: width,
      height: height,
    });

    if (shouldStoreLastSize) {
      setLastResizeContainerSize({
        width: width,
        height: height,
      });
    }

    dragScaleRef.current = scale;

    // @ts-ignore
    guacClientRef.current.getDisplay().scale(scale);

    virtualKeyboardRef.current.resize(width);
  };

  /**
   * If the console window is not already maximized, make it full screen and
   * position at top-left of browser window (0, 0).
   * Full screen will use the entire browser window width, but the height will
   * be based on the aspect ratio.
   * If the console window is already maximized, unmaximize by setting the size
   * back to its previous dimensions and return it to its original position.
   */
  const handleMaximizeToggle = () => {
    if (isMaximizedRef.current) {
      isMaximizedRef.current = false;
      updateSize(
        lastResizeContainerSize.width,
        lastResizeContainerSize.height,
        false,
      );

      if (!isAspectRatioLocked) {
        guacClientRef.current.sendSize(
          lastResizeContainerSize.width,
          lastResizeContainerSize.height,
        );
      }

      let previousPosition = getStoredWindowSettings(connectionIdRef.current);

      if (isDockingEnabled()) {
        previousPosition = viewportToScreen(previousPosition);
      }

      updatePosition(previousPosition.x, previousPosition.y);
    } else {
      isMaximizedRef.current = true;

      // keep the aspect ratio, unless the aspect ratio is unlocked
      let width = window.innerWidth;
      let height = width / aspectRatioRef.current;
      if (!isAspectRatioLocked) {
        height = window.innerHeight - APP_BAR_HEIGHT;
        guacClientRef.current.sendSize(width, height);
      } else {
        // if the screen is too big vertically to be completely seen, reduce the size
        if (height > window.innerHeight) {
          height = window.innerHeight - APP_BAR_HEIGHT;
          width = height * aspectRatioRef.current;
        }
      }

      updateSize(width, height, false);

      let posToStore = {
        x: windowPosition.x,
        y: windowPosition.y,
      };

      if (isDockingEnabled()) {
        posToStore = screenToViewport(posToStore);
      }

      setStoredWindowSettings(
        connectionIdRef.current,
        posToStore.x,
        posToStore.y,
        resizeContainerSize.width,
        resizeContainerSize.height,
        isMaximizedRef.current,
      );

      // center the window horizontally
      const horizontalPos = window.innerWidth / 2 - width / 2;
      updatePosition(horizontalPos, 0);
    }
  };

  /**
   * Helper function to know when the browser window is done resizing.
   * @param func
   */
  const debounce = (func: any) => {
    let timer: ReturnType<typeof setTimeout>;
    return function (event: any) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(func, 100, event);
    };
  };

  // handle resizing the browser window when the console popup is maximized
  useEffect(() => {
    const handleWindowResize = () => {
      if (isMaximizedRef.current) {
        let width = window.innerWidth;
        let height = width / aspectRatioRef.current;
        if (!isAspectRatioLocked) {
          height = window.innerHeight - APP_BAR_HEIGHT;
        } else {
          // if the screen is too big vertically to be completely seen, reduce the size
          if (height > window.innerHeight) {
            height = window.innerHeight - APP_BAR_HEIGHT;
            width = height * aspectRatioRef.current;
          }
        }

        const newDragScale = width / displaySizeRef.current.width;

        setResizeContainerSize({
          width: width,
          height: height,
        });

        dragScaleRef.current = newDragScale;

        guacClientRef.current.getDisplay().scale(newDragScale);

        virtualKeyboardRef.current.resize(width);

        // center the window horizontally
        const horizontalPos = window.innerWidth / 2 - width / 2;
        updatePosition(horizontalPos, 0);
      }
    };

    const handleWindowResizeEnd = debounce(function (e: any) {
      if (isMaximizedRef.current && !isAspectRatioLocked) {
        guacClientRef.current.sendSize(
          window.innerWidth,
          window.innerHeight - APP_BAR_HEIGHT,
        );
        const scale = 1;
        dragScaleRef.current = scale;
        // @ts-ignore
        guacClientRef.current.getDisplay().scale(scale);
      }
    });

    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('resize', handleWindowResizeEnd);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('resize', handleWindowResizeEnd);
    };
  }, []);

  // UE used to ensure that cleanup happens even if the user navigates away
  // without properly closing the console window
  useEffect(() => {
    // this flag ensures cleanup only happens once, and not twice in the case of
    // a development environment where React calls useEffects twice
    setTimeout(() => {
      shouldCleanupOnDismountRef.current = true;
    }, 1000);

    return () => {
      if (shouldCleanupOnDismountRef.current) {
        handleClose();
      }
    };
  }, []);

  /**
   * Called when the size of the window has been changed in a manner other than
   * zooming. Clear out the base zoom value and store a new size from which to
   * zoom.
   * @param width
   * @param height
   */
  const updateBaseZoom = (width: number, height: number) => {
    lastResizeToZoomRef.current = {
      width: width,
      height: height,
    };
    baseZoomRef.current = INIT_BASE_ZOOM;
  };

  //ts-ignore
  const handleResize = (e: SyntheticEvent, data: ResizeCallbackData) => {
    let width = data.size.width;
    let height = data.size.height;

    // don't let locked aspect ratio windows change aspect ratios
    if (isAspectRatioLocked) {
      if (width <= MIN_WINDOW_WIDTH) {
        width = MIN_WINDOW_WIDTH;
        height = width / aspectRatioRef.current;
      }

      if (height <= MIN_WINDOW_HEIGHT) {
        height = MIN_WINDOW_HEIGHT;
        width = height * aspectRatioRef.current;
      }
    }

    updateSize(width, height);
    updateBaseZoom(width, height);
    isMaximizedRef.current = false;
  };

  /**
   * The user has let go of the bottom-right drag handle by releasing the mouse.
   * If the aspect ratio is locked, do nothing.
   * If the aspect ratio is NOT locked, send the new display size to the server
   * and handle the new size.
   * @param e
   * @param data
   */
  const handleResizeStop = (e: SyntheticEvent, data: ResizeCallbackData) => {
    if (!isAspectRatioLocked) {
      if (guacClientRef.current) {
        guacClientRef.current.sendSize(data.size.width, data.size.height);

        displaySizeRef.current = {
          width: data.size.width,
          height: data.size.height,
        };

        aspectRatioRef.current = data.size.width / data.size.height;
      }
    }
  };

  const guacamoleDisconnect = () => {
    // @ts-ignore
    guacClientRef.current.disconnect();
  };

  /**
   * Likely called when the user is trying to open a window that already exists.
   * Instead of opening a second copy, this function is called to center the
   * window in the browser.
   */
  const centerWindow = () => {
    setResizeContainerSize((containerSize: any) => {
      const horizontalPos = window.innerWidth / 2 - containerSize.width / 2;
      const verticalPos = window.innerHeight / 2 - containerSize.height / 2;

      // if docked to a netmap, update the position in viewport space as well
      if (isDockingEnabled()) {
        netmapViewportPosRef.current = screenToViewport({
          x: horizontalPos,
          y: verticalPos,
        });
      }

      updatePosition(horizontalPos, verticalPos);

      return containerSize;
    });
  };

  /**
   * Copy the text contents of the local clipboard to the remote clipboard.
   */
  const handleLocalClipboardPaste = async () => {
    try {
      const textFromLocalClipboard = await navigator.clipboard.readText();

      if (!textFromLocalClipboard) {
        displayToaster({
          message: 'Local clipboard is empty.',
          severity: 'warning',
        });

        return;
      }

      await sendScenarioEvent('copy_paste_change', {
        clipboardContent: 'copied text',
      });

      const stream = guacClientRef.current.createClipboardStream('text/plain');
      const writer = new Guacamole.StringWriter(stream);
      writer.sendText(textFromLocalClipboard);
      writer.sendEnd();

      displayToaster({
        message: 'Local clipboard copied to remote clipboard',
        severity: 'success',
      });
    } catch (err) {
      displayToaster({
        message: 'Local clipboard could NOT be copied to remote clipboard',
        severity: 'error',
      });
    }
  };

  const activateForMouseAndKeyboard = () => {
    // WARNING: the guacamole javascript library has some oddities that
    // require strange workarounds.
    // Notice below that mouse movements require an offset compensation,
    // but clicks do not. There appears to be a bug within the lib.

    // Mouse
    if (mouseRef.current === null) {
      // @ts-ignore
      const mEl = guacClientRef.current.getDisplay().getElement();
      mouseRef.current = new Guacamole.Mouse(mEl);
    }

    // @ts-ignore
    mouseRef.current.onmousedown = mouseRef.current.onmouseup = function (
      mouseState: any,
    ) {
      // @ts-ignore
      guacClientRef.current.sendMouseState(mouseState);
    };

    // @ts-ignore
    mouseRef.current.onmousemove = function (mouseState) {
      // account for the drag offset of the console window
      mouseState.x += dragOffsetRef.current.x;
      mouseState.y += dragOffsetRef.current.y;

      // account for the initial position of the console window when opened
      mouseState.x -= initialWindowPositionRef.current.x;
      mouseState.y -= initialWindowPositionRef.current.y;

      // handle scale
      mouseState.x /= dragScaleRef.current;
      mouseState.y /= dragScaleRef.current;

      // @ts-ignore
      guacClientRef.current.sendMouseState(mouseState);
    };

    // Keyboard
    if (keyboardRef.current) {
      keyboardRef.current.onkeydown = function (keysym: any) {
        // @ts-ignore
        guacClientRef.current.sendKeyEvent(1, keysym);
      };

      keyboardRef.current.onkeyup = function (keysym: any) {
        // @ts-ignore
        guacClientRef.current.sendKeyEvent(0, keysym);
      };
    }

    // focus the display
    guacClientRef.current.getDisplay().getElement().focus();
  };

  /**
   * Deactivate by removing mouse and keyboard listeners.
   */
  const deactivateForMouseAndKeyboard = () => {
    if (mouseRef.current !== null) {
      const mouse = mouseRef.current;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = null;
    }

    if (keyboardRef.current) {
      keyboardRef.current.onkeydown = null;
      keyboardRef.current.onkeyup = null;
    }
  };

  const guacamoleConnect = (
    authToken: string,
    windowNumber: number,
    connectionId: string,
    connectionType: string,
  ) => {
    const connectionData =
      `token=${authToken}&GUAC_ID=${connectionId}` +
      '&GUAC_DATA_SOURCE=postgresql' +
      `&GUAC_TYPE=${connectionType}` +
      '&GUAC_WIDTH=800' +
      '&GUAC_HEIGHT=600' +
      '&GUAC_DPI=96' +
      '&GUAC_TIMEZONE=America%2FNew_York' +
      '&GUAC_IMAGE=image%2Fpng';

    const guacClient = guacClientRef.current;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    guacClient.connect(connectionData);

    // grab the div for THIS ConsolePopup
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mEl = guacClient.getDisplay().getElement();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.getElementById('display-' + windowNumber)!.appendChild(mEl);

    // attach the keyboard to the display element instead of the document to
    // avoid blocking keyboard interactivity with other components
    const displayElement = guacClientRef.current.getDisplay().getElement();
    displayElement.tabIndex = 0; // make focusable
    keyboardRef.current = new Guacamole.Keyboard(displayElement);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    guacClientRef.current.getDisplay().showCursor(false);

    guacClientRef.current.getDisplay().onresize = (
      width: number,
      height: number,
    ) => {
      if (!isAspectRatioLocked) {
        if (guacClientRef.current) {
          const scale = 1;
          dragScaleRef.current = scale;
          // @ts-ignore
          guacClientRef.current.getDisplay().scale(scale);
        }
      }
    };
  };

  const guacamoleLogin = async (
    windowNumber: number,
    connectionId: string,
    connectionType: string,
    token?: string,
  ) => {
    if (token) {
      authTokenRef.current = token;
      guacamoleConnect(token, windowNumber, connectionId, connectionType);
      ConsoleWindowManager.setActiveWindow(connectionIdRef.current, true);
    } else {
      const baseUrl = `https://${hostRef.current}:${portRef.current}`;
      //autho can be with keycloak token or guacamole user and password
      const reqHeaders: HeadersInit = {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      if (credentialsStr) {
        //override keycloak credentials
        debugLogSuccess('[ConsolePopUp] Basic Auth');
      } else if (isSSOEnabledSel && ssoAuthIdToken) {
        reqHeaders['Authorization'] = `${ssoAuthIdToken}`;
        debugLogSuccess('[ConsolePopUp] SSO Auth Token');
      } else {
        debugLogError('[ConsolePopUp] Missing Auth');
      }

      fetch(`${baseUrl}/api/tokens`, {
        method: 'POST',
        headers: reqHeaders,
        body: credentialsStr,
      })
        .then((response) => response.json())
        .then((json) => {
          authTokenRef.current = json.authToken;
          guacamoleConnect(
            json.authToken,
            windowNumber,
            connectionId,
            connectionType,
          );
          ConsoleWindowManager.setActiveWindow(connectionIdRef.current, true);
        });
    }
  };

  /**
   * The guacamole javascript lib has a terrible feature where the canvas
   * of the display element has a z-index of -1. If left as is, the canvas
   * won't be seen as it will be below react.
   * Fix the situation by iterating through all the display element's
   * children and zeroing out the z-index.
   * @param element
   */
  const fixGuacElementZindex = (element: HTMLElement) => {
    element.style.zIndex = '0';

    // @ts-ignore
    for (const child of element.children) {
      fixGuacElementZindex(child);
    }
  };

  /**
   * Update the display size based on the size of the first canvas found that is
   * NOT the canvas for the mouse cursor.
   *
   * NOTE: The guacamole client library has the following oddity: the canvas is
   * usually bigger than the actual display size. The parent of the canvas has
   * the true size and cuts off the overflow. Thus, you must find the canvas and
   * use the size of it's parent div.
   * @param element
   */
  const updateDisplaySize = (element: HTMLElement) => {
    if (element instanceof HTMLCanvasElement) {
      let displayWidth = element.width;
      let displayHeight = element.height;

      if (displayWidth > 0 && displayWidth !== CURSOR_DISPLAY_WIDTH) {
        const parentElement = element.parentElement;
        if (parentElement) {
          displayWidth = parentElement.offsetWidth;
          displayHeight = parentElement.offsetHeight;
        }

        displaySizeRef.current = {
          width: displayWidth,
          height: displayHeight,
        };

        aspectRatioRef.current = displayWidth / displayHeight;

        // if a size is stored, use that size, else initial size
        let w = initSize.width;
        let h = w / aspectRatioRef.current;
        if (storedWindowSettings) {
          w = storedWindowSettings.width;
          h = storedWindowSettings.height;
        }

        setResizeContainerSize({
          width: w,
          height: h,
        });
        setLastResizeContainerSize({
          width: w,
          height: h,
        });

        updateBaseZoom(w, h);

        const scale = w / displaySizeRef.current.width;
        dragScaleRef.current = scale;

        // @ts-ignore
        guacClientRef.current.getDisplay().scale(scale);

        virtualKeyboardRef.current.resize(w);

        // @ts-ignore
        guacClientRef.current.getDisplay().showCursor(false);

        if (isTab) {
          // For unknown reasons, after a successful guacamole connection,
          // sendSize is ignored by the server for around 2 seconds.
          // The method below will call sendSize once per second for 5 seconds,
          // or until the display is updated correctly.
          const updateSizePerSecond = () => {
            const MAX_COUNT = 5;
            let count = 0;

            const intervalId = setInterval(() => {
              if (count < MAX_COUNT) {
                const desiredWidth = window.innerWidth;
                const desiredHeight = window.innerHeight - APP_BAR_HEIGHT;

                // was the display size already successfully updated?
                if (
                  (guacClientRef.current.getDisplay().getWidth() ===
                    desiredWidth ||
                    // due to an unknown oddity with guacamole, the width may be one pixel less than what is requested in sendSize
                    guacClientRef.current.getDisplay().getWidth() ===
                      desiredWidth - 1) &&
                  guacClientRef.current.getDisplay().getHeight() ===
                    desiredHeight
                ) {
                  clearInterval(intervalId);
                } else {
                  window.dispatchEvent(new Event('resize'));
                }
              } else {
                clearInterval(intervalId);
              }

              count++;
            }, 1000);
          };

          updateSizePerSecond();
        }

        // was this console maximized and then closed?
        if (storedWindowSettings && storedWindowSettings.isMaximized) {
          handleMaximizeToggle();
        }
      } else if (displayWidth !== CURSOR_DISPLAY_WIDTH) {
        // account for not yet having the canvas element
        setTimeout(() => {
          updateDisplaySize(element);
        }, 1);
      }
      return true;
    } else {
      // @ts-ignore
      for (const child of element.children) {
        if (updateDisplaySize(child)) {
          break;
        }
      }
      return false;
    }
  };

  // UE to log in to guacamole and listen for connection errors
  useEffect(() => {
    if (!hasInitedRef.current) {
      hasInitedRef.current = true;

      // @ts-ignore
      tunnelRef.current = new Guacamole.WebSocketTunnel(
        `${guacProtocol}://${hostRef.current}:${portRef.current}/websocket-tunnel`,
      );
      // @ts-ignore
      guacClientRef.current = new Guacamole.Client(tunnelRef.current);

      // start out at a small scale so the user doesn't notice a 'flicker' when
      // true scale is set
      guacClientRef.current.getDisplay().scale(0.1);

      // @ts-ignore
      tunnelRef.current.onerror = function (tunnelError: any) {
        console.log('tunnel error', tunnelError);
        setDataError(
          getTunnelErrorMessage(tunnelError.code) + ': ' + tunnelError.message,
        );
      };

      // @ts-ignore
      guacClientRef.current.onerror = (error) => {
        // alert(error);
        console.log('client error: ', error);
        setDataError(error.message);
      };

      // @ts-ignore
      guacClientRef.current.onstatechange = (state: Guacamole.Client.State) => {
        let stateString = '';
        switch (state) {
          case 0:
            stateString = 'IDLE';
            break;
          case 1:
            stateString = 'CONNECTING';
            break;
          case 2:
            stateString = 'WAITING';
            break;
          case 3:
            stateString = 'CONNECTED';
            //do something MICO
            setConnectionCounter(0);
            setIsConnected(true);
            break;
          case 4:
            stateString = 'DISCONNECTING';
            break;
          case 5:
            stateString = 'DISCONNECTED';
            break;
        }
      };

      // listen for remote clipboard changes and copy to local clipboard
      guacClientRef.current.onclipboard = (stream: any, mimetype: string) => {
        if (mimetype !== 'text/plain') return;

        const reader = new Guacamole.StringReader(stream);
        let clipboardText = '';

        reader.ontext = (textPart: string) => {
          clipboardText += textPart;
        };

        reader.onend = () => {
          debugLog('Received clipboard text from remote:', clipboardText);

          // Optionally write to local clipboard
          navigator.clipboard.writeText(clipboardText).then(() => {
            debugLog('Copied remote clipboard to local clipboard!');
          });
        };
      };

      // put this new window on top of any others
      const nextZIndex = currentZIndex + 1;
      // @ts-ignore
      setCurrentZIndex(nextZIndex);
      setZIndex(nextZIndex);

      ConsoleWindowManager.addWindow(
        connectionIdRef.current,
        activateForMouseAndKeyboard,
        deactivateForMouseAndKeyboard,
        centerWindow,
      );

      guacamoleLogin(windowNumber, connectionId, connectionType, token);
    }
  });

  // UE to set the display size of the console window and fix the z-index
  // bug that the guacamole element has
  useEffect(() => {
    const guacClient = guacClientRef.current;
    if (connectionCounter >= 0 && guacClient) {
      if (guacClient) {
        const gualEl = guacClient.getDisplay();
        if (gualEl) {
          // @ts-ignore
          updateDisplaySize(guacClientRef.current.getDisplay().getElement());

          // IMPORTANT: fix Guacamole's stupid -1 z-index for it's canvas
          // @ts-ignore
          fixGuacElementZindex(guacClientRef.current.getDisplay().getElement());

          setConnectionCounter(-1);
          return;
        }
      }

      setConnectionCounter(connectionCounter + 1);
    }
  }, [connectionCounter]);

  /**
   * The user has started to move the netmap.
   * No changes have yet taken place (that will happen in onNetmapMove).
   * In order for zooming of the netmap to properly scale this window, store
   * some information about the netmap's zoom settings before changes take place.
   * @param e
   */
  const onNetmapMoveStart = (e: any) => {
    if (baseZoomRef.current === INIT_BASE_ZOOM) {
      baseZoomRef.current = e.detail.zoom;
      lastZoomRef.current = e.detail.zoom;
    }
  };

  /**
   * The netmap is moving.
   * Update the position of the window based on it's position in the viewport
   * space. This will cause the window to appear to be docked to the netmap.
   * If the viewport is being zoomed, alter the size of the window accordingly.
   * @param e
   */
  const onNetmapMove = (e: any) => {
    if (e.detail.zoom !== lastZoomRef.current) {
      lastZoomRef.current = e.detail.zoom;
      const percentageChange = lastZoomRef.current / baseZoomRef.current;

      updateSize(
        lastResizeToZoomRef.current.width * percentageChange,
        lastResizeToZoomRef.current.height * percentageChange,
      );
    }

    // what is the new position of the window in screen space?
    setWindowPosition((position) => {
      const updatedPos = viewportToScreen(netmapViewportPosRef.current);

      dragOffsetRef.current = {
        x: initialWindowPositionRef.current.x - updatedPos.x,
        y: initialWindowPositionRef.current.y - updatedPos.y,
      };

      return updatedPos;
    });
  };

  /**
   * Set the window's position and scale.
   * @param x The x position on screen
   * @param y The y position on screen
   * @param forceOffset A plain object with an x and y property
   */
  const updatePosition = (x: number, y: number, forceOffset: any = null) => {
    setWindowPosition((oldPosition) => {
      if (forceOffset) {
        dragOffsetRef.current = {
          x: forceOffset.x,
          y: forceOffset.y,
        };
      } else {
        dragOffsetRef.current = {
          x: initialWindowPositionRef.current.x - x,
          y: initialWindowPositionRef.current.y - y,
        };
      }

      return { x: x, y: y };
    });
  };

  // UE to store the window's position in viewport space
  useEffect(() => {
    if (isDockingEnabled()) {
      netmapViewportPosRef.current = screenToViewport(windowPosition);
    }
  }, []);

  // UE to add and clean up listeners
  useEffect(() => {
    window.addEventListener('netmapMoveStart', onNetmapMoveStart);
    window.addEventListener('netmapMove', onNetmapMove);

    return () => {
      window.removeEventListener('netmapMoveStart', onNetmapMoveStart);
      window.removeEventListener('netmapMove', onNetmapMove);
    };
  }, []);

  return open ? (
    <div
      id="total-container"
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: zIndex,
        overflowX: 'hidden',
        overflowY: 'hidden',
        width: '100%',
        height: '100%',
      }}
    >
      <div>
        <Backdrop
          open={isMaximizedRef.current}
          style={{
            pointerEvents: 'all',
          }}
        />
      </div>
      <Draggable
        nodeRef={nodeRef}
        handle="#draggable-dialog-title"
        defaultPosition={{ x: 0, y: 0 }}
        position={{ x: windowPosition.x, y: windowPosition.y }}
        onMouseDown={handleMouseDown}
        onStart={handleDragStart}
        onStop={handleDragStop}
        disabled={isMaximizedRef.current}
        // bounds={{ left: 0, top: 0 }}
      >
        <div
          id="window-container"
          ref={nodeRef}
          style={{
            borderColor: 'grey',
            borderWidth: '1px',
            borderStyle: 'solid',
            pointerEvents: 'all',
            zIndex: zIndex,
            position: 'absolute',
          }}
        >
          {resizeContainerSize.width >= MIN_WIDTH_APP_BAR_VISIBLE && (
            <AppBar
              position="static"
              id="draggable-dialog-title"
              elevation={0}
              sx={{
                //dont try to add a border here, it wont look good
                backgroundColor: (theme: any) => `${theme.header.default}`,
                padding: '0px',
                margin: '0px',
                height: APP_BAR_HEIGHT + 'px',
                boxShadow: 0,
                shapeRendering: 'crispEdges',
              }}
            >
              <Box //REF was Toolbar
                sx={{
                  margin: '0px',
                  padding: '0px',
                  display: 'flex',
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  //REF sx={{ flexGrow: 1 }}
                  sx={{ padding: '8px' }}
                  style={{ userSelect: 'none' }}
                >
                  {title}
                </Typography>

                {!isTab && (
                  <>
                    <Tooltip
                      arrow
                      enterDelay={500}
                      enterNextDelay={500}
                      title="Close"
                      slotProps={{
                        popper: {
                          style: { zIndex },
                        },
                      }}
                    >
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: 6,
                          color: 'white',
                          fontSize: ICON_FONTSIZE,
                        }}
                        onClick={handleClose}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      arrow
                      enterDelay={500}
                      enterNextDelay={500}
                      title="Open in New Tab"
                      slotProps={{
                        popper: {
                          style: { zIndex },
                        },
                      }}
                    >
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: 36,
                          color: 'white',
                          fontSize: ICON_FONTSIZE,
                        }}
                        onClick={handleLaunch}
                      >
                        <LaunchIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      arrow
                      enterDelay={500}
                      enterNextDelay={500}
                      title="Fullscreen Toggle"
                      slotProps={{
                        popper: {
                          style: { zIndex },
                        },
                      }}
                    >
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: 66,
                          color: 'white',
                          fontSize: ICON_FONTSIZE,
                        }}
                        onClick={handleMaximizeToggle}
                      >
                        {isMaximizedRef.current ? (
                          <CloseFullscreenIcon fontSize="inherit" />
                        ) : (
                          <OpenInFullIcon fontSize="inherit" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </>
                )}

                <Tooltip
                  arrow
                  enterDelay={500}
                  enterNextDelay={500}
                  title="Keyboard"
                  slotProps={{
                    popper: {
                      style: { zIndex },
                    },
                  }}
                >
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: isTab ? 36 : 96,
                      color: 'white',
                      fontSize: ICON_FONTSIZE,
                    }}
                    onClick={handleVirtualKeyboardToggle}
                  >
                    {!isKeyboardOpen && <KeyboardIcon fontSize="inherit" />}
                    {isKeyboardOpen && <KeyboardHideIcon fontSize="inherit" />}
                  </IconButton>
                </Tooltip>

                <Tooltip
                  arrow
                  enterDelay={500}
                  enterNextDelay={500}
                  title="Ctrl-Alt-Del"
                  slotProps={{
                    popper: {
                      style: { zIndex },
                    },
                  }}
                >
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: isTab ? 6 : 126,
                      color: 'white',
                      fontSize: ICON_FONTSIZE,
                    }}
                    onClick={handleCtrlAltDeleteClick}
                  >
                    <LoginIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>

                {protocol === 'RDP' && (
                  <Tooltip
                    arrow
                    enterDelay={500}
                    enterNextDelay={500}
                    title="Copy to Clipboard"
                    slotProps={{
                      popper: {
                        style: { zIndex },
                      },
                    }}
                  >
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: isTab ? 66 : 156,
                        color: 'white',
                        fontSize: ICON_FONTSIZE,
                      }}
                      onClick={handleLocalClipboardPaste}
                    >
                      <ContentPasteGoIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </AppBar>
          )}
          <div
            style={{
              // terminal area background
              backgroundColor: 'black',
              padding: '0px',
              margin: '0px',
            }}
          >
            <Resizable
              width={resizeContainerSize.width}
              height={resizeContainerSize.height}
              onResize={handleResize}
              onResizeStop={handleResizeStop}
              lockAspectRatio={isAspectRatioLocked}
              axis={isTab ? 'none' : 'both'}
              handle={isTab ? <div /> : undefined} // hide handle for a console in a tab
            >
              <div>
                <ConnectionAttemptDisplay
                  isConnected={isConnected}
                  numConnectionAttempts={numConnectionAttempts}
                  errorMsg={dataError}
                  connectionFunction={() => {
                    setDataError('');
                    setNumConnectionAttempts((numAttempts) => {
                      return numAttempts + 1;
                    });
                    guacamoleConnect(
                      authTokenRef.current,
                      windowNumber,
                      connectionId,
                      connectionType,
                    );
                  }}
                />
                <div
                  id={'display-' + windowNumber}
                  style={{
                    width: resizeContainerSize.width + 'px',
                    height: resizeContainerSize.height + 'px',
                    overflow: 'hidden',
                  }}
                  onClick={() => {
                    guacClientRef.current?.getDisplay().getElement().focus();
                  }}
                ></div>
              </div>
            </Resizable>
          </div>
          <div
            style={{
              backgroundColor: '#000000C4',
              borderRadius: '12px',
              width: 'auto',
              height: 'auto',
              position: 'absolute',
              bottom: 0,
              left: 12,
            }}
            id={'keyboard-' + windowNumber}
          ></div>
        </div>
      </Draggable>
    </div>
  ) : (
    <></>
  );
}

export default ConsolePopup;
