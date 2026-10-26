const { heroui } = require('@heroui/theme');

// AR Rentals palette. The same six colors are also available as plain
// Tailwind colors (bg-sierra, text-arena-tostada…) via @theme in
// app/globals.css — keep both in sync.
//
//   Sierra         #243A2C  principal: texts, buttons, dark backgrounds
//   Arena          #E3D3B8  principal cálido: piece backgrounds and highlights
//   Salvia         #7C9A82  secundario: color blocks, illustration, details (never small text)
//   Arena tostada  #7A6246  acento: the italic word, labels and figures
//   Lino           #F4F5EF  fondo: default page background
//   Noche          #1A2B20  apoyo: footers and long texts
module.exports = heroui({
    themes: {
        light: {
            colors: {
                background: '#F4F5EF',
                foreground: '#1A2B20',
                content1: '#FFFFFF',
                primary: {
                    DEFAULT: '#243A2C',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#7C9A82',
                    foreground: '#FFFFFF',
                },
                focus: '#7C9A82',
            },
        },
        dark: {
            colors: {
                // Near-black greens rather than Noche/Sierra themselves: those read as
                // a saturated green wash over a whole screen. Salvia stays as the accent.
                background: '#0A0F0C',
                foreground: '#F4F5EF',
                content1: '#111814',
                content2: '#17201A',
                content3: '#1D2820',
                content4: '#243026',
                // Sierra disappears against Noche, so on dark the lighter Salvia leads.
                primary: {
                    DEFAULT: '#7C9A82',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#7C9A82',
                    foreground: '#FFFFFF',
                },
                focus: '#7C9A82',
            },
        },
    },
});
