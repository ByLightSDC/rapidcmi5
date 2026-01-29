import { useEffect, useRef } from 'react';
import { Dispatch } from '@reduxjs/toolkit';
import {
  setApiUrl,
  setEventKey,
  setWardenEventKey,
  setDeploymentKey,
  setReceivedSharedRequest,
} from './FrontendEnvironment.slice';
import { useDispatch } from 'react-redux';

type Message = {
  uuid?: string;
  messageId?: number;
  type?: string;
  data?: {
    MetovaApiUrl?: string;
    MetovaEventKey?: string;
    MetovaWardenEventKey?: string;
    MetovaDeploymentKey?: string;
  };
};

function isMessageForMe({
  messageEvent,
  uuid,
}: {
  messageEvent: MessageEvent<Message>;
  uuid: string | null;
}) {
2
  // Check actually got a UUID
  if (uuid === null) {
    return false;
  }
  // Didn't come for this widget
  if (messageEvent?.data?.uuid !== uuid) {
    return false;
  }
  return true;
}

function sharedRequest({
  dispatch,
  messageEvent,
}: {
  dispatch: Dispatch;
  messageEvent: MessageEvent<Message>;
}) {
  // Only process if it is a shared request message
  if (messageEvent.data?.type !== 'sharedRequests') {
    return;
  }
  // Set items from shared request
  if (typeof messageEvent.data?.data?.MetovaApiUrl === 'string') {
    dispatch(setApiUrl(messageEvent.data.data.MetovaApiUrl));
  }
  if (typeof messageEvent?.data?.data?.MetovaEventKey === 'string') {
    dispatch(setEventKey(messageEvent.data.data.MetovaEventKey));
  }
  if (typeof messageEvent.data?.data?.MetovaWardenEventKey === 'string') {
    dispatch(setWardenEventKey(messageEvent.data.data.MetovaWardenEventKey));
  }
  if (messageEvent.data?.data?.MetovaDeploymentKey) {
    dispatch(setDeploymentKey(messageEvent.data.data.MetovaDeploymentKey));
  }
  setReceivedSharedRequest(true);
}

function processMessage({
  dispatch,
  messageEvent,
  uuid,
}: {
  dispatch: Dispatch;
  messageEvent: MessageEvent<Message>;
  uuid: string | null;
}) {
  // Check that the message is proper and for this widget
  if (!isMessageForMe({ messageEvent, uuid })) {
    return;
  }
  // Attach redux writers
  sharedRequest({ dispatch, messageEvent });
  // Ack message
  const environment = window.top;
  if (environment) {
    environment.postMessage(
      { messageId: messageEvent.data?.messageId, type: 'confirmId', uuid },
      '*',
    );
  }
}

export function FrontendEnvironment() {
  const dispatch = useDispatch();
  const uuid = useRef<string | null>(null);

  // On initial load check for who we are
  useEffect(() => {
    // Get values from query and then env
    const urlParams = new URLSearchParams(window.location.search);

    uuid.current = urlParams.get('uuid');
    // Dispatch updates

  }, [dispatch]);

  // Add opendash support
  useEffect(() => {
    // Define a wrapper so that it can be removed on component un-mount
    function wrapMessage(messageEvent: MessageEvent<Message>) {
      processMessage({ dispatch, messageEvent, uuid: uuid.current });
    }
    // Listen for widget proxy messages
    window.addEventListener('message', wrapMessage);
    // Cleanup on component un-mount
    return () => {
      window.removeEventListener('message', wrapMessage);
    };
  }, [dispatch]);

  // Just does backend logic, nothing is shown
  return null;
}
