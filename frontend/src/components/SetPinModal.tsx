import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../utils/AuthContext';

interface SetPinModalProps {
  isOpen: boolean;
  isClosable?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SetPinModal({ isOpen, isClosable = false, onClose, onSuccess }: SetPinModalProps) {
  const { updateUserPinStatus } = useAuth();
  const [pinCode, setPinCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPinCode('');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const appendNum = (num: string) => {
    if (pinCode.length < 4) {
      setPinCode((prev) => prev + num);
    }
    setErrorMessage('');
  };

  const deleteNum = () => {
    setPinCode((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const submitPin = async () => {
    if (pinCode.length !== 4) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await api.post('/me/pin', {
        pin_code: pinCode,
      });

      updateUserPinStatus(true);
      onSuccess();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Ошибка при сохранении ПИН-кода');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (isClosable) onClose();
        }}
      ></div>

      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-extrabold text-gray-900">Задайте ПИН-код</h3>
            <p className="mt-2 text-sm text-gray-500">
              Это нужно для быстрого входа в систему без пароля.
            </p>
          </div>

          <div className="flex justify-center mb-6 space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-12 h-14 rounded-xl flex items-center justify-center text-3xl font-bold border-2 ${
                  pinCode.length >= i
                    ? 'border-bakery-600 bg-bakery-50 text-bakery-900'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {pinCode.length >= i ? '•' : ''}
              </div>
            ))}
          </div>

          {errorMessage && (
            <p className="text-center text-red-600 text-sm font-bold mb-4">{errorMessage}</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                className="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
                onClick={() => appendNum(num)}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              className="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-xl font-bold text-gray-500 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
              onClick={() => setPinCode('')}
            >
              Сброс
            </button>
            <button
              type="button"
              className="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
              onClick={() => appendNum('0')}
            >
              0
            </button>
            <button
              type="button"
              className="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-700 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
              onClick={deleteNum}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </button>
          </div>

          <div className="mt-6 flex gap-3">
            {isClosable && (
              <button
                type="button"
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                onClick={onClose}
              >
                Позже
              </button>
            )}
            <button
              type="button"
              className="flex-1 rounded-2xl bg-bakery-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-bakery-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pinCode.length !== 4 || isLoading}
              onClick={submitPin}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить ПИН'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
