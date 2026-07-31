import { Raffle, SocialLink, WinnerHistoryItem, ParticipationRequirement } from '../types/raffle';

// Import generated images
import iphoneImg from '../assets/images/prize_iphone_15_1785455102017.jpg';
import ps5Img from '../assets/images/prize_ps5_console_1785455113103.jpg';
import smartTvImg from '../assets/images/prize_smart_tv_1785455124020.jpg';

export const INITIAL_SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'soc-1',
    name: 'WhatsApp Comunidad',
    platform: 'whatsapp',
    url: 'https://whatsapp.com/channel/variedades-cs-oficial',
    label: 'Únete al Canal Oficial de WhatsApp Variedades CS',
    isActive: true,
  },
  {
    id: 'soc-2',
    name: 'Facebook Oficial',
    platform: 'facebook',
    url: 'https://facebook.com/variedadesCSoficial',
    label: 'Sigue nuestra Página de Facebook',
    isActive: true,
  },
  {
    id: 'soc-3',
    name: 'Instagram Oficial',
    platform: 'instagram',
    url: 'https://instagram.com/variedades_cs',
    label: 'Síguenos en Instagram @variedades_cs',
    isActive: true,
  },
  {
    id: 'soc-4',
    name: 'TikTok Oficial',
    platform: 'tiktok',
    url: 'https://tiktok.com/@variedadescs',
    label: 'Síguenos en TikTok',
    isActive: true,
  },
  {
    id: 'soc-5',
    name: 'YouTube Oficial',
    platform: 'youtube',
    url: 'https://youtube.com/@variedadescs',
    label: 'Suscríbete a nuestro canal de YouTube',
    isActive: true,
  },
];

export const STANDARD_REQUIREMENTS: ParticipationRequirement[] = [
  {
    id: 'req-wa',
    type: 'whatsapp_group',
    title: 'Unirse a la Comunidad de WhatsApp',
    description: 'Debes pertenecer al canal/comunidad oficial de Variedades CS para recibir alertas del sorteo.',
    url: 'https://whatsapp.com/channel/variedades-cs-oficial',
    isMandatory: true,
    iconName: 'MessageCircle',
  },
  {
    id: 'req-soc',
    type: 'follow_instagram',
    title: 'Seguir Redes Oficiales (FB, IG, TikTok, YT)',
    description: 'Seguir a Variedades CS en Facebook, Instagram, TikTok y YouTube.',
    url: 'https://instagram.com/variedades_cs',
    isMandatory: true,
    iconName: 'Share2',
  },
  {
    id: 'req-like',
    type: 'like_post',
    title: 'Dar "Me Gusta" a la Publicación Oficial',
    description: 'Dale Like a la imagen promocional de la rifa en Facebook e Instagram.',
    url: 'https://instagram.com/variedades_cs',
    isMandatory: true,
    iconName: 'Heart',
  },
  {
    id: 'req-share',
    type: 'share_post',
    title: 'Compartir la Publicación en tu Perfil o Historia',
    description: 'Comparte de forma pública en Facebook o en tus Historias de Instagram etiquetándonos.',
    url: 'https://facebook.com/variedadesCSoficial',
    isMandatory: true,
    iconName: 'Share',
  },
  {
    id: 'req-tag',
    type: 'comment_tag_friends',
    title: 'Comentar Etiquetando a 2 o más Amigos',
    description: 'Escribe un comentario en la publicación mencionando mínimo a 2 amigos reales (no famosos).',
    url: 'https://instagram.com/variedades_cs',
    isMandatory: true,
    requiredTagCount: 2,
    iconName: 'Users',
  },
  {
    id: 'req-screenshot',
    type: 'upload_screenshot',
    title: 'Adjuntar Captura de Pantalla de los Pasos Cumplidos',
    description: 'Sube una captura de pantalla desde tu celular demostrando que seguiste las redes y compartiste.',
    url: '',
    isMandatory: true,
    iconName: 'Camera',
  },
];

// Helper to generate future date
const getFutureDate = (daysAhead: number, hoursAhead = 18) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hoursAhead, 0, 0, 0);
  return d.toISOString();
};

export const INITIAL_RAFFLES: Raffle[] = [
  {
    id: 'raf-001',
    title: 'Set Perfume Elegance Luxury Edition 100ml',
    description: '¡Participa en la ruleta por un exclusivo Perfume Luxury de Lujo! Sigue nuestras redes oficiales para estar presente en el sorteo.',
    prizeValue: '$180 USD',
    prizeImage: iphoneImg,
    category: 'Perfumes',
    totalNumbers: 100,
    digits: 2,
    drawDate: getFutureDate(3, 20),
    status: 'active',
    maxTicketsPerUser: 1,
    requirements: STANDARD_REQUIREMENTS,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'raf-002',
    title: 'Bolso Exclusivo de Cuero Italiano Designer',
    description: 'Hermoso bolso de diseñador en tono rosa pastel con acabados premium. Rifa en vivo 100% transparente.',
    prizeValue: '$250 USD',
    prizeImage: ps5Img,
    category: 'Bolsos',
    totalNumbers: 100,
    digits: 2,
    drawDate: getFutureDate(7, 19),
    status: 'active',
    maxTicketsPerUser: 1,
    requirements: STANDARD_REQUIREMENTS,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'raf-003',
    title: 'Colección Exclusiva Ropa & Lencería Fina',
    description: 'Set completo de prendas de alta costura a elección del ganador. ¡Particpa en la ruleta en directo!',
    prizeValue: '$320 USD',
    prizeImage: smartTvImg,
    category: 'Lencería',
    totalNumbers: 100,
    digits: 2,
    drawDate: getFutureDate(12, 21),
    status: 'active',
    maxTicketsPerUser: 1,
    requirements: STANDARD_REQUIREMENTS,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const INITIAL_WINNERS: WinnerHistoryItem[] = [
  {
    id: 'win-101',
    raffleTitle: 'Nintendo Switch OLED + 3 Juegos',
    prizeValue: '$420 USD',
    prizeImage: ps5Img,
    winnerName: 'María Fernanda Gómez',
    winnerPhoneMasked: '+57 312 *** 8921',
    ticketNumber: '047',
    drawDate: '2026-07-20T20:00:00Z',
    proofUrl: 'https://instagram.com/variedades_cs',
    testimonial: '¡Pensé que era mentira pero me llegó mi consola en 3 días! Muchísimas gracias a Variedades CS por sus rifas gratuitas reales.',
  },
  {
    id: 'win-102',
    raffleTitle: 'AirPods Pro 2da Generación USB-C',
    prizeValue: '$249 USD',
    prizeImage: iphoneImg,
    winnerName: 'Carlos Eduardo Ramírez',
    winnerPhoneMasked: '+52 55 *** 4410',
    ticketNumber: '083',
    drawDate: '2026-07-10T19:30:00Z',
    proofUrl: 'https://facebook.com/variedadesCSoficial',
    testimonial: 'Cumplí todos los pasos en Facebook e Instagram y me asignaron el número 83. ¡Ganador en el sorteo en vivo!',
  },
  {
    id: 'win-103',
    raffleTitle: 'Bono de Compra Variedades CS $300 USD',
    prizeValue: '$300 USD',
    prizeImage: smartTvImg,
    winnerName: 'Valentina Mendoza',
    winnerPhoneMasked: '+58 414 *** 9932',
    ticketNumber: '012',
    drawDate: '2026-06-28T21:00:00Z',
    proofUrl: 'https://tiktok.com/@variedadescs',
    testimonial: 'Excelente organización y máxima transparencia. ¡100% recomendados!',
  },
];

export const INITIAL_MUSIC_TRACKS = [
  {
    id: 'lounge-cs',
    name: 'Variedades CS Lounge 🌸',
    genre: 'Relajante',
    synthBpm: 90,
    synthScale: [261.63, 329.63, 392.00, 493.88, 523.25, 659.25],
    isCustom: false,
  },
  {
    id: 'fiesta-sorteo',
    name: 'Sorteo Fiesta Pop 🎉',
    genre: 'Alegre & Dinámico',
    synthBpm: 115,
    synthScale: [293.66, 369.99, 440.00, 554.37, 587.33, 739.99],
    isCustom: false,
  },
  {
    id: 'lofi-chill',
    name: 'Lofi Chill Ruleta ☕',
    genre: 'Chill Synth',
    synthBpm: 75,
    synthScale: [220.00, 261.63, 329.63, 392.00, 440.00, 523.25],
    isCustom: false,
  },
];
