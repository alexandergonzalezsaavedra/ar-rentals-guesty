'use client';

import { useState } from 'react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconCheck,
  IconCopy,
  IconShare3,
} from '@tabler/icons-react';

interface ShareButtonProps {
  title: string;
  className?: string;
  variant?: 'floating' | 'nav';
}

const ShareButton = ({
  title,
  className = '',
  variant = 'floating',
}: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const getUrl = () =>
    typeof window !== 'undefined' ? window.location.href : '';

  const handleAction = async (key: string) => {
    const url = getUrl();

    if (key === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank',
        'noopener,noreferrer',
      );
      return;
    }

    if (key === 'whatsapp') {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
        '_blank',
        'noopener,noreferrer',
      );
      return;
    }

    if (key === 'instagram' || key === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard API unavailable (e.g. insecure context); nothing else to fall back to.
      }
    }
  };

  return (
    <Dropdown placement='bottom-end'>
      <DropdownTrigger>
        {variant === 'nav' ? (
          <button
            type='button'
            aria-label='Compartir'
            className={`flex flex-col items-center gap-1 px-1 py-1 text-default-500 active:scale-95 ${className}`}
          >
            <IconShare3 size={20} />
            <span className='text-[9px] font-medium'>Compartir</span>
          </button>
        ) : (
          <Button
            isIconOnly
            radius='full'
            className={`bg-white/90 text-slate-900 shadow ${className}`}
            aria-label='Compartir'
          >
            <IconShare3 size={18} />
          </Button>
        )}
      </DropdownTrigger>
      <DropdownMenu
        aria-label='Opciones para compartir'
        onAction={(key) => handleAction(String(key))}
      >
        <DropdownItem
          key='facebook'
          startContent={
            <IconBrandFacebook
              size={18}
              className='text-[#1877F2]'
            />
          }
        >
          Facebook
        </DropdownItem>
        <DropdownItem
          key='whatsapp'
          startContent={
            <IconBrandWhatsapp
              size={18}
              className='text-[#25D366]'
            />
          }
        >
          WhatsApp
        </DropdownItem>
        <DropdownItem
          key='instagram'
          startContent={
            <IconBrandInstagram
              size={18}
              className='text-[#E1306C]'
            />
          }
          description='Copia el enlace para pegarlo en tu historia'
        >
          Instagram
        </DropdownItem>
        <DropdownItem
          key='copy'
          startContent={
            copied ? (
              <IconCheck
                size={18}
                className='text-success'
              />
            ) : (
              <IconCopy size={18} />
            )
          }
        >
          {copied ? 'Enlace copiado' : 'Copiar enlace'}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ShareButton;
