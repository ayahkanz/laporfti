# Landing Page Redesign - Lapor Handri

## Overview
Redesign landing page sesuai instruksi proyek dan design system yang telah ditetapkan. Fokus pada nuansa institusional yang modern, rapi, dan terpercaya.

## Perubahan Utama

### 1. **Struktur Landing Page (HomeView.tsx)**
Diubah dari layout kompleks menjadi flow yang lebih linear dan fokus:

- **Hero Section**: Portal identity dengan judul, deskripsi integrasi sistem akademik, dan primary CTAs
- **Ticket Tracking**: Input untuk melacak status aduan dengan visual yang jelas
- **Trust Pillars** (3 kolom): Privasi, Transparansi, Respons Berkelanjutan
- **Category Grid**: 8 kategori laporan dengan jumlah aktif
- **Dean's Message**: Pesan dekanat yang hangat, humanis, namun formal dan kredibel

### 2. **Design System Implementation**

#### Color Palette (Sesuai Design System)
| Role | Color | Usage |
|------|-------|-------|
| Primary CTA | `#4F39F6` | Tombol utama, aksen |
| Text Primary | `#1D293D` | Heading, body text |
| Background | `#FAFCFD` | Page background, cards |
| Border/Muted | `#A8A8CC` | Input borders, dividers |
| Secondary CTA | `#E5E7EB` | Tombol sekunder |

#### Typography
- **Font Family**: Inter (headlines & body), JetBrains Mono (codes)
- **Size Hierarchy**:
  - Hero: 3xl-4xl (text-3xl md:text-4xl)
  - Section: lg (text-lg)
  - Body: sm (text-sm)
  - Label: xs (text-xs)

#### Spacing
- Base unit: 8px (Tailwind default)
- Card padding: 20px (p-5) → 32px (p-8) untuk section besar
- Gap antara sections: 32px (space-y-8)

#### Border Radius
- Buttons & Inputs: 12px (rounded-[12px])
- Subtle: 6-8px (rounded-[6px], rounded-[8px])
- Cards: 12px (rounded-[12px])

### 3. **Component Updates**

#### Buttons
- **Primary**: `bg-[#4F39F6] hover:bg-[#3d2acc]` dengan shadow
- **Secondary**: `bg-[#E5E7EB] hover:bg-[#D1D5DB]`
- Radius: 12px
- Padding: py-3 px-6

#### Cards
- Background: white
- Border: `border-[#A8A8CC]/20` (subtle)
- Radius: 12px
- Padding: p-5 atau p-8

#### Inputs
- Background: `bg-[#FAFCFD]`
- Border: `border-[#A8A8CC]`
- Focus: `focus:ring-2 focus:ring-[#4F39F6]/20`
- Radius: 12px

### 4. **CSS Enhancements (index.css)**
Ditambahkan:
- CSS custom properties untuk design system colors
- Utility classes (`.btn-primary`, `.card-subtle`, etc.)
- Animation: `slideIn` & `fadeIn`
- Global smooth transitions

### 5. **Modal Styling**
Category action modal menggunakan:
- Backdrop: `bg-[#1D293D]/40 backdrop-blur-sm`
- Card styling konsisten dengan design system
- Close button subtle

## Design Principles Diterapkan

✅ **Clean & Minimal**: Menghilangkan complexity yang tidak perlu
✅ **Institutional Trust**: Typography & color yang formal namun modern
✅ **High Contrast**: Text readability dengan #1D293D di background terang
✅ **Consistent Spacing**: 8px grid system
✅ **Action Emphasis**: Purple primary color yang kuat untuk CTAs
✅ **Responsive**: Mobile-first approach dengan proper breakpoints

## Browser Compatibility
- Modern browsers dengan Tailwind CSS 4
- CSS Grid & Flexbox
- CSS Custom Properties

## Performance Considerations
- Minimal custom CSS (rely on Tailwind)
- Smooth animations (GPU-accelerated transforms)
- No heavy imagery
- Optimized SVG icons via Lucide

## Future Enhancements
1. Dark mode support (jika diperlukan)
2. Advanced animations dengan Motion library
3. Accessibility audit (WCAG 2.1)
4. Loading states untuk async operations
5. Toast notifications untuk feedback

---

**Last Updated**: August 7, 2026
**Design System Reference**: GitReverse Design System
**Font**: Inter (Google Fonts) + JetBrains Mono
