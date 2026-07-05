import { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useI18n } from '../i18n';

export default function DesktopUpdater() {
  const { t } = useI18n();
  const [status, setStatus] = useState<'idle' | 'available' | 'downloading' | 'downloaded' | 'error'>('idle');
  const [versionInfo, setVersionInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const isVisible = status !== 'idle';

  const title = (() => {
    switch (status) {
      case 'available': return t('updater.updateAvailable');
      case 'downloading': return t('updater.downloading');
      case 'downloaded': return t('updater.downloaded');
      case 'error': return t('updater.error');
      default: return '';
    }
  })();

  const description = (() => {
    switch (status) {
      case 'available': return t('updater.updateAvailableDesc', { version: versionInfo?.version || '' });
      case 'downloading': return t('updater.downloadingDesc');
      case 'downloaded': return t('updater.downloadedDesc');
      case 'error': return errorMessage || t('updater.error');
      default: return '';
    }
  })();

  const startDownload = async () => {
    const desktop = (window as any).daurennanDesktop;
    if (desktop) {
      setStatus('downloading');
      await desktop.downloadUpdate();
    }
  };

  const installUpdate = async () => {
    const desktop = (window as any).daurennanDesktop;
    if (desktop) {
      await desktop.installUpdate();
    }
  };

  const close = () => {
    setStatus('idle');
  };

  useEffect(() => {
    const desktop = (window as any).daurennanDesktop;
    if (desktop) {
      desktop.onUpdateAvailable((info: any) => {
        setVersionInfo(info);
        setStatus('available');
      });

      desktop.onUpdateDownloaded(() => {
        setStatus('downloaded');
      });

      desktop.onUpdateError((msg: string) => {
        setErrorMessage(msg);
        setStatus('error');
      });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-bakery-100 text-bakery-600">
          {status === 'available' && <Download className="h-7 w-7" />}
          {status === 'downloading' && <RefreshCw className="h-7 w-7 animate-spin" />}
          {status === 'downloaded' && <CheckCircle2 className="h-7 w-7 text-green-600" />}
          {status === 'error' && <AlertTriangle className="h-7 w-7 text-red-600" />}
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900">
          {title}
        </h3>
        <p className="mb-6 text-sm font-medium text-gray-500 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col gap-3">
          {status === 'available' && (
            <button
              onClick={startDownload}
              className="flex w-full min-h-[3rem] items-center justify-center rounded-xl bg-bakery-600 px-4 py-2 font-bold text-white transition hover:bg-bakery-700 active:scale-[0.98]"
            >
              {t('updater.downloadBtn')}
            </button>
          )}

          {status === 'downloaded' && (
            <button
              onClick={installUpdate}
              className="flex w-full min-h-[3rem] items-center justify-center rounded-xl bg-green-600 px-4 py-2 font-bold text-white transition hover:bg-green-700 active:scale-[0.98]"
            >
              {t('updater.installBtn')}
            </button>
          )}

          {(status === 'available' || status === 'error') && (
            <button
              onClick={close}
              className="flex w-full min-h-[3rem] items-center justify-center rounded-xl bg-gray-100 px-4 py-2 font-bold text-gray-700 transition hover:bg-gray-200 active:scale-[0.98]"
            >
              {t('updater.cancelBtn')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
