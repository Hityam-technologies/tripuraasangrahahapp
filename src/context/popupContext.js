import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PopupModal from '../components/popupModal';

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [popupState, setPopupState] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    icon: null,
    type: 'default',
    cancelable: true,
  });

  const hidePopup = useCallback(() => {
    setPopupState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showPopup = useCallback(({
    title = '',
    message = '',
    buttons = [{ text: 'OK', style: 'default' }],
    icon = null,
    type = 'default',
    cancelable = true,
  }) => {
    setPopupState({
      visible: true,
      title,
      message,
      buttons,
      icon,
      type,
      cancelable,
    });
  }, []);

  /**
   * Convenience helper for 1-button alerts:
   * showAlert({ title, message, buttonText, onPress, icon, type })
   */
  const showAlert = useCallback(({
    title = '',
    message = '',
    buttonText = 'OK',
    onPress,
    icon,
    type = 'default',
  }) => {
    showPopup({
      title,
      message,
      buttons: [
        {
          text: buttonText,
          style: 'default',
          onPress,
        },
      ],
      icon,
      type,
      cancelable: true,
    });
  }, [showPopup]);

  /**
   * Convenience helper for 2-button confirmations (OK / Cancel, Delete / Cancel):
   * showConfirm({ title, message, confirmText, cancelText, destructive, onConfirm, onCancel, icon })
   */
  const showConfirm = useCallback(({
    title = '',
    message = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive = false,
    onConfirm,
    onCancel,
    icon,
  }) => {
    showPopup({
      title,
      message,
      buttons: [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: confirmText,
          style: destructive ? 'destructive' : 'default',
          onPress: onConfirm,
        },
      ],
      icon,
      type: destructive ? 'destructive' : 'default',
      cancelable: true,
    });
  }, [showPopup]);

  const value = useMemo(
    () => ({
      showPopup,
      showAlert,
      showConfirm,
      hidePopup,
    }),
    [showPopup, showAlert, showConfirm, hidePopup],
  );

  return (
    <PopupContext.Provider value={value}>
      {children}
      <PopupModal
        visible={popupState.visible}
        title={popupState.title}
        message={popupState.message}
        buttons={popupState.buttons}
        icon={popupState.icon}
        type={popupState.type}
        cancelable={popupState.cancelable}
        onDismiss={hidePopup}
      />
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}

export default PopupContext;
