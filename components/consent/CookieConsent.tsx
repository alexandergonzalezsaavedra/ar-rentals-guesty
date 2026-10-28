'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from '@heroui/react';
import { IconCookie, IconLock, IconMapPin } from '@tabler/icons-react';
import { EASE_BRAND } from '@/lib/easing';
import { requestVisitorLocation } from '@/lib/location';
import { trackVisit } from '@/lib/tracking';
import {
  acceptAllConsent,
  CONSENT_CATEGORIES,
  readConsent,
  rejectOptionalConsent,
  REQUIRED_CATEGORIES,
  writeConsent,
  type ConsentCategory,
} from '@/lib/storage';
import { CONSENT_COPY, onOpenCookieSettings } from './cookieSettings';

// The cookie notice (until the visitor answers) and the settings window
// (from the notice, or later from the footer / "Mis datos"). Choices are
// saved in the consent section of the single storage object.
const CookieConsent = () => {
  const [isNoticeVisible, setIsNoticeVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [draft, setDraft] = useState<Record<ConsentCategory, boolean> | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only storage after mount
    setIsNoticeVisible(readConsent().decidedAt === null);

    return onOpenCookieSettings(() => {
      setDraft(readConsent().categories);
      setIsSettingsOpen(true);
    });
  }, []);

  // Once the choice is saved: what the page load couldn't record before the
  // visitor answered (device, the campaign in this URL) is recorded now, as
  // far as the new consent allows.
  const finish = () => {
    setIsNoticeVisible(false);
    setIsSettingsOpen(false);
    trackVisit();
  };

  const askLocationIfAllowed = async () => {
    if (!readConsent().categories.location) return;

    setIsLocating(true);
    await requestVisitorLocation();
    setIsLocating(false);
  };

  const handleAcceptAll = async () => {
    acceptAllConsent();
    finish();
    await askLocationIfAllowed();
  };

  const handleRejectOptional = () => {
    rejectOptionalConsent();
    finish();
  };

  const handleOpenSettings = () => {
    setDraft(readConsent().categories);
    setIsSettingsOpen(true);
  };

  const handleSave = async () => {
    if (!draft) return;

    const hadLocation = readConsent().categories.location;

    writeConsent(draft);
    finish();

    if (draft.location && !hadLocation) {
      await askLocationIfAllowed();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isNoticeVisible && !isSettingsOpen && (
          <motion.div
            role='dialog'
            aria-label='Aviso de cookies'
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5, ease: EASE_BRAND }}
            className='fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-default-200 bg-content1 p-4 shadow-2xl sm:bottom-6 sm:p-5 dark:border-default-100/20'
          >
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
              <div className='flex flex-1 items-start gap-3'>
                <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-arena text-arena-tostada dark:bg-arena-tostada/30 dark:text-arena'>
                  <IconCookie size={22} />
                </span>
                <p className='text-sm text-default-600'>
                  Usamos cookies y almacenamiento local para que el sitio funcione, recordar tus preferencias y, si lo
                  aceptas, personalizar tu experiencia y medir nuestra publicidad.{' '}
                  <Link
                    href='/terminos-y-condiciones#cookies'
                    className='font-medium text-primary underline underline-offset-2'
                  >
                    Conoce más
                  </Link>
                </p>
              </div>
              {/* Three buttons of the same size. Phones: the main one on its own full-width row, the other two
                  sharing the row below. sm+: one column under each other, the main one on top. */}
              <div className='grid grid-cols-2 gap-2 sm:w-44 sm:shrink-0 sm:grid-cols-1'>
                <Button
                  radius='full'
                  size='md'
                  className='col-span-2 bg-sierra font-semibold text-white sm:col-span-1 dark:bg-arena dark:text-sierra'
                  onPress={handleAcceptAll}
                >
                  Aceptar todas
                </Button>
                <Button
                  radius='full'
                  size='md'
                  variant='bordered'
                  className='border-default-300 font-medium'
                  onPress={handleRejectOptional}
                >
                  Solo necesarias
                </Button>
                <Button
                  radius='full'
                  size='md'
                  variant='light'
                  className='font-medium text-default-600'
                  onPress={handleOpenSettings}
                >
                  Configurar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        placement='auto'
        scrollBehavior='inside'
        size='2xl'
        classNames={{ base: 'max-sm:m-0 max-sm:max-h-[92dvh] max-sm:rounded-b-none' }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1 pr-12'>
            <span className='flex items-center gap-2'>
              <IconCookie
                size={20}
                className='text-arena-tostada dark:text-arena'
              />
              Configuración de cookies
            </span>
            <span className='text-sm font-normal text-default-500'>
              Elige qué información podemos guardar. Puedes cambiarlo cuando quieras desde el pie de página.
            </span>
          </ModalHeader>
          <ModalBody>
            <ul className='flex flex-col gap-3'>
              {draft &&
                CONSENT_CATEGORIES.map((category) => {
                  const isRequired = REQUIRED_CATEGORIES.includes(category);

                  return (
                    <li
                      key={category}
                      className='flex items-start justify-between gap-3 rounded-xl border border-default-200 p-3 sm:gap-4 sm:p-4 dark:border-default-100/20'
                    >
                      <div>
                        <p className='flex items-center gap-1.5 font-semibold text-foreground'>
                          {CONSENT_COPY[category].title}
                          {isRequired && (
                            <IconLock
                              size={14}
                              className='text-default-400'
                            />
                          )}
                          {category === 'location' && (
                            <IconMapPin
                              size={14}
                              className='text-primary'
                            />
                          )}
                        </p>
                        <p className='mt-1 text-xs text-default-500 sm:text-sm'>{CONSENT_COPY[category].description}</p>
                      </div>
                      <Switch
                        aria-label={CONSENT_COPY[category].title}
                        isSelected={draft[category]}
                        isDisabled={isRequired}
                        onValueChange={(value) => setDraft({ ...draft, [category]: value })}
                        className='shrink-0'
                        classNames={{ wrapper: 'group-data-[selected=true]:bg-sierra dark:group-data-[selected=true]:bg-secondary' }}
                      />
                    </li>
                  );
                })}
            </ul>
          </ModalBody>
          <ModalFooter className='grid grid-cols-2 gap-2 border-t border-default-100 sm:flex sm:justify-end dark:border-default-100/20'>
            <Button
              radius='full'
              isLoading={isLocating}
              className='order-first col-span-2 bg-sierra font-semibold text-white sm:order-last dark:bg-arena dark:text-sierra'
              onPress={handleSave}
            >
              Guardar preferencias
            </Button>
            <Button
              radius='full'
              variant='bordered'
              className='border-default-300 font-medium'
              onPress={handleRejectOptional}
            >
              Solo necesarias
            </Button>
            <Button
              radius='full'
              variant='bordered'
              className='border-default-300 font-medium'
              onPress={handleAcceptAll}
            >
              Aceptar todas
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CookieConsent;
