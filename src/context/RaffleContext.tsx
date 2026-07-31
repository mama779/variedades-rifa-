import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { db, auth, googleProvider, OperationType, handleFirestoreError } from '../lib/firebase';
import {
  Raffle,
  Ticket,
  SocialLink,
  VerificationRequest,
  WinnerHistoryItem,
  Notification,
  UserProfile,
  MusicTrack,
} from '../types/raffle';
import {
  INITIAL_RAFFLES,
  INITIAL_SOCIAL_LINKS,
  INITIAL_WINNERS,
  INITIAL_MUSIC_TRACKS,
} from '../data/initialData';

// Helper to generate padded ticket numbers e.g., "00", "01" ... "99"
const generateTickets = (total: number, digits: number = 2): Ticket[] => {
  const tickets: Ticket[] = [];
  const sampleNames = [
    'Carlos M.', 'Ana P.', 'Sofia L.', 'Javier R.', 'Diego H.',
    'Valeria B.', 'Mateo G.', 'Camila S.', 'Gabriel K.', 'Isabella T.',
    'Lucas V.', 'Elena N.', 'Santiago D.', 'Mariana F.', 'Emilio Z.',
    'Paula C.', 'Andres Q.', 'Natalia J.', 'Joaquín M.', 'Daniela R.',
  ];

  for (let i = 0; i < total; i++) {
    const numStr = String(i).padStart(digits, '0');
    const isPreAssigned = i % 3 === 1 || (i > 10 && i < 35 && i % 2 === 0);
    
    if (isPreAssigned) {
      const name = sampleNames[i % sampleNames.length];
      tickets.push({
        number: numStr,
        status: 'assigned',
        userId: `user-sim-${i}`,
        userName: name,
        userPhone: `+57 3${(10 + i % 80)} *** ${(1000 + i * 47) % 9000}`,
        userHandle: `@${name.toLowerCase().replace(/[^a-z]/g, '')}_${i}`,
        assignedAt: new Date(Date.now() - (100 - i) * 3600000).toISOString(),
        verificationDetails: {
          whatsappJoined: true,
          socialsFollowed: true,
          postLiked: true,
          postShared: true,
          taggedFriends: ['@amigo_fan1', '@amigo_fan2'],
        },
      });
    } else {
      tickets.push({
        number: numStr,
        status: 'available',
      });
    }
  }

  return tickets;
};

interface RaffleContextType {
  raffles: Raffle[];
  ticketsMap: Record<string, Ticket[]>;
  socialLinks: SocialLink[];
  verificationRequests: VerificationRequest[];
  winnersHistory: WinnerHistoryItem[];
  notifications: Notification[];
  userProfile: UserProfile;
  currentUser: FirebaseUser | null;
  isAdminMode: boolean;
  autoApproveMode: boolean;
  
  // Auth Actions
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Actions
  toggleAdminMode: (pin?: string) => boolean;
  setAutoApproveMode: (enabled: boolean) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  submitParticipationRequest: (
    raffleId: string,
    reqDetails: {
      userName: string;
      userPhone: string;
      userHandle: string;
      preferredTicketNumber?: string;
      whatsappJoined: boolean;
      socialsFollowed: boolean;
      postLiked: boolean;
      postShared: boolean;
      commentUrl?: string;
      taggedFriends: string[];
    }
  ) => Promise<{ success: boolean; message: string; ticketNumber?: string }>;
  
  approveVerificationRequest: (requestId: string, overrideTicketNumber?: string) => Promise<void>;
  rejectVerificationRequest: (requestId: string, reason: string) => Promise<void>;
  assignTicketDirectly: (
    raffleId: string,
    ticketNumber: string,
    userName: string,
    userHandle: string,
    userPhone: string,
    userEmail?: string,
    userAvatar?: string
  ) => Promise<{ success: boolean; message: string }>;
  updateTicketParticipant: (
    raffleId: string,
    ticketNumber: string,
    userName: string,
    userHandle: string,
    userPhone?: string,
    userAvatar?: string
  ) => Promise<{ success: boolean; message: string }>;
  unassignTicket: (
    raffleId: string,
    ticketNumber: string
  ) => Promise<{ success: boolean; message: string }>;

  addWinnerHistory: (winner: Omit<WinnerHistoryItem, 'id'>) => Promise<void>;
  deleteWinnerHistory: (winnerId: string) => Promise<void>;
  
  createRaffle: (raffleData: Omit<Raffle, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateRaffle: (raffleId: string, updatedFields: Partial<Raffle>) => Promise<void>;
  deleteRaffle: (raffleId: string) => Promise<void>;
  pauseRaffle: (raffleId: string) => Promise<void>;
  
  addSocialLink: (link: Omit<SocialLink, 'id'>) => Promise<void>;
  updateSocialLink: (id: string, updated: Partial<SocialLink>) => Promise<void>;
  deleteSocialLink: (id: string) => Promise<void>;
  
  runRandomDraw: (raffleId: string) => Promise<Ticket | null>;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  resetSystemData: () => Promise<void>;

  // Music Tracks Actions
  musicTracks: MusicTrack[];
  activeTrackId: string;
  setActiveTrackId: (id: string) => void;
  addMusicTrack: (track: Omit<MusicTrack, 'id'>) => Promise<void>;
  deleteMusicTrack: (id: string) => Promise<void>;
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

export const RaffleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  const [raffles, setRaffles] = useState<Raffle[]>(INITIAL_RAFFLES);
  const [ticketsMap, setTicketsMap] = useState<Record<string, Ticket[]>>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(INITIAL_SOCIAL_LINKS);
  const [winnersHistory, setWinnersHistory] = useState<WinnerHistoryItem[]>(INITIAL_WINNERS);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Music tracks state
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>(() => {
    const saved = localStorage.getItem('variedades_cs_music_tracks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_MUSIC_TRACKS;
  });

  const [activeTrackId, setActiveTrackId] = useState<string>(() => {
    return localStorage.getItem('variedades_cs_active_track') || INITIAL_MUSIC_TRACKS[0].id;
  });

  useEffect(() => {
    localStorage.setItem('variedades_cs_music_tracks', JSON.stringify(musicTracks));
  }, [musicTracks]);

  useEffect(() => {
    localStorage.setItem('variedades_cs_active_track', activeTrackId);
  }, [activeTrackId]);

  const addMusicTrack = async (trackData: Omit<MusicTrack, 'id'>) => {
    const newTrack: MusicTrack = {
      ...trackData,
      id: `track-${Date.now()}`,
      isCustom: true,
    };
    setMusicTracks((prev) => [...prev, newTrack]);
    setActiveTrackId(newTrack.id);
  };

  const deleteMusicTrack = async (id: string) => {
    setMusicTracks((prev) => prev.filter((t) => t.id !== id));
    if (activeTrackId === id) {
      const remaining = musicTracks.filter((t) => t.id !== id);
      if (remaining.length > 0) {
        setActiveTrackId(remaining[0].id);
      }
    }
  };

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr-guest',
    name: 'Usuario Participante',
    phone: '+57 310 000 0000',
    socialHandle: '@mi_usuario_oficial',
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [autoApproveMode, setAutoApproveMode] = useState<boolean>(true);

  // Track Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setUserProfile((prev) => ({
          ...prev,
          id: user.uid,
          name: user.displayName || prev.name,
          email: user.email || undefined,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Raffles from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'raffles'),
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial raffles into Firestore
          for (const r of INITIAL_RAFFLES) {
            try {
              await setDoc(doc(db, 'raffles', r.id), r);
              const generated = generateTickets(r.totalNumbers, r.digits);
              const batch = writeBatch(db);
              generated.forEach((t) => {
                const ticketRef = doc(db, 'raffles', r.id, 'tickets', t.number);
                batch.set(ticketRef, t);
              });
              await batch.commit();
            } catch (err) {
              console.error('Error seeding raffle:', err);
            }
          }
        } else {
          const list: Raffle[] = snapshot.docs.map((d) => d.data() as Raffle);
          setRaffles(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'raffles');
      }
    );
    return () => unsub();
  }, []);

  // Sync Tickets for all raffles in state
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    raffles.forEach((raffle) => {
      const ticketsRef = collection(db, 'raffles', raffle.id, 'tickets');
      const unsub = onSnapshot(
        ticketsRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Ticket[] = snapshot.docs.map((d) => d.data() as Ticket);
            setTicketsMap((prev) => ({
              ...prev,
              [raffle.id]: list.sort((a, b) => parseInt(a.number) - parseInt(b.number)),
            }));
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, `raffles/${raffle.id}/tickets`);
        }
      );
      unsubs.push(unsub);
    });

    return () => unsubs.forEach((u) => u());
  }, [raffles]);

  // Sync Social Links
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'social_links'),
      async (snapshot) => {
        if (snapshot.empty) {
          for (const s of INITIAL_SOCIAL_LINKS) {
            try {
              await setDoc(doc(db, 'social_links', s.id), s);
            } catch (err) {
              console.error('Error seeding social link:', err);
            }
          }
        } else {
          setSocialLinks(snapshot.docs.map((d) => d.data() as SocialLink));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'social_links');
      }
    );
    return () => unsub();
  }, []);

  // Sync Winners History
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'winners_history'),
      async (snapshot) => {
        if (snapshot.empty) {
          for (const w of INITIAL_WINNERS) {
            try {
              await setDoc(doc(db, 'winners_history', w.id), w);
            } catch (err) {
              console.error('Error seeding winner:', err);
            }
          }
        } else {
          setWinnersHistory(snapshot.docs.map((d) => d.data() as WinnerHistoryItem));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'winners_history');
      }
    );
    return () => unsub();
  }, []);

  // Sync Verification Requests
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'verification_requests'),
      (snapshot) => {
        setVerificationRequests(snapshot.docs.map((d) => d.data() as VerificationRequest));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'verification_requests');
      }
    );
    return () => unsub();
  }, []);

  // Sync Notifications
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        setNotifications(snapshot.docs.map((d) => d.data() as Notification));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      }
    );
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const toggleAdminMode = (pin?: string) => {
    if (isAdminMode) {
      setIsAdminMode(false);
      return false;
    }
    const validCredentials = ['190710', '1234', 'urielroques604@gmail.com'];
    if (!pin || validCredentials.includes(pin.trim())) {
      setIsAdminMode(true);
      return true;
    }
    return false;
  };

  const updateUserProfile = (fields: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...fields }));
  };

  const submitParticipationRequest = async (
    raffleId: string,
    reqDetails: {
      userName: string;
      userPhone: string;
      userHandle: string;
      preferredTicketNumber?: string;
      whatsappJoined: boolean;
      socialsFollowed: boolean;
      postLiked: boolean;
      postShared: boolean;
      commentUrl?: string;
      taggedFriends: string[];
      proofScreenshot?: string;
      proofScreenshots?: string[];
    }
  ) => {
    const raffle = raffles.find((r) => r.id === raffleId);
    if (!raffle || raffle.status !== 'active') {
      return { success: false, message: 'La rifa no está activa actualmente.' };
    }

    const raffleTickets = ticketsMap[raffleId] || [];
    
    const userExistingTickets = raffleTickets.filter(
      (t) => t.userId === userProfile.id && t.status === 'assigned'
    );

    if (userExistingTickets.length >= raffle.maxTicketsPerUser) {
      return {
        success: false,
        message: `Ya has recibido el límite de (${raffle.maxTicketsPerUser}) número(s) para esta rifa.`,
      };
    }

    let targetTicket: Ticket | undefined;
    if (reqDetails.preferredTicketNumber) {
      targetTicket = raffleTickets.find(
        (t) => t.number === reqDetails.preferredTicketNumber && t.status === 'available'
      );
      if (!targetTicket) {
        return {
          success: false,
          message: `El número ${reqDetails.preferredTicketNumber} ya no está disponible. Por favor elige otro.`,
        };
      }
    } else {
      targetTicket = raffleTickets.find((t) => t.status === 'available');
      if (!targetTicket) {
        return { success: false, message: '¡Lo sentimos! Todos los números para esta rifa han sido asignados.' };
      }
    }

    const assignedNum = targetTicket.number;
    const nowIso = new Date().toISOString();
    const ticketDocRef = doc(db, 'raffles', raffleId, 'tickets', assignedNum);

    if (autoApproveMode) {
      const updatedTicket: Ticket = {
        number: assignedNum,
        status: 'assigned',
        userId: userProfile.id,
        userName: reqDetails.userName,
        userPhone: reqDetails.userPhone,
        userHandle: reqDetails.userHandle,
        assignedAt: nowIso,
        verificationDetails: {
          whatsappJoined: reqDetails.whatsappJoined,
          socialsFollowed: reqDetails.socialsFollowed,
          postLiked: reqDetails.postLiked,
          postShared: reqDetails.postShared,
          commentUrl: reqDetails.commentUrl,
          taggedFriends: reqDetails.taggedFriends,
          proofScreenshot: reqDetails.proofScreenshot,
          proofScreenshots: reqDetails.proofScreenshots,
        },
      };

      try {
        await setDoc(ticketDocRef, updatedTicket);
        
        const notifId = `notif-${Date.now()}`;
        const newNotif: Notification = {
          id: notifId,
          title: '🎉 ¡Número Asignado Exitosamente!',
          message: `Se te ha asignado el número ${assignedNum} para la rifa: "${raffle.title}". ¡Buena suerte!`,
          timestamp: nowIso,
          type: 'ticket_assigned',
          read: false,
          raffleId,
          ticketNumber: assignedNum,
        };
        await setDoc(doc(db, 'notifications', notifId), newNotif);

        return {
          success: true,
          message: `¡Felicidades! Se te ha verificado y asignado el número ${assignedNum}.`,
          ticketNumber: assignedNum,
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `raffles/${raffleId}/tickets/${assignedNum}`);
        return { success: false, message: 'Error al actualizar el boleto en la base de datos.' };
      }
    } else {
      const requestId = `req-${Date.now()}`;
      const newRequest: VerificationRequest = {
        id: requestId,
        raffleId,
        raffleTitle: raffle.title,
        userId: userProfile.id,
        userName: reqDetails.userName,
        userPhone: reqDetails.userPhone,
        userHandle: reqDetails.userHandle,
        requestedTicketNumber: assignedNum,
        submittedAt: nowIso,
        status: 'pending',
        requirementsAnswers: {
          whatsappJoined: reqDetails.whatsappJoined,
          socialsFollowed: reqDetails.socialsFollowed,
          postLiked: reqDetails.postLiked,
          postShared: reqDetails.postShared,
          commentUrl: reqDetails.commentUrl,
          taggedFriends: reqDetails.taggedFriends,
          proofScreenshot: reqDetails.proofScreenshot,
          proofScreenshots: reqDetails.proofScreenshots,
        },
      };

      try {
        await setDoc(doc(db, 'verification_requests', requestId), newRequest);
        await updateDoc(ticketDocRef, {
          status: 'pending_verification',
          userId: userProfile.id,
          userName: reqDetails.userName,
        });

        return {
          success: true,
          message: `Solicitud recibida para el número ${assignedNum}. El administrador verificará tus requisitos en breve.`,
          ticketNumber: assignedNum,
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `verification_requests/${requestId}`);
        return { success: false, message: 'Error al enviar la solicitud.' };
      }
    }
  };

  const approveVerificationRequest = async (requestId: string, overrideTicketNumber?: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (!req) return;

    const raffleId = req.raffleId;
    const numToAssign = overrideTicketNumber || req.requestedTicketNumber;
    if (!numToAssign) return;

    const nowIso = new Date().toISOString();
    const ticketDocRef = doc(db, 'raffles', raffleId, 'tickets', numToAssign);

    const updatedTicket: Ticket = {
      number: numToAssign,
      status: 'assigned',
      userId: req.userId,
      userName: req.userName,
      userPhone: req.userPhone,
      userHandle: req.userHandle,
      assignedAt: nowIso,
      verificationDetails: req.requirementsAnswers,
    };

    try {
      await setDoc(ticketDocRef, updatedTicket);
      await updateDoc(doc(db, 'verification_requests', requestId), { status: 'approved' });

      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        title: '✅ ¡Requisitos Verificados!',
        message: `Tus requisitos han sido aprobados y se te asignó el número ${numToAssign} para ${req.raffleTitle}.`,
        timestamp: nowIso,
        type: 'ticket_assigned',
        read: false,
        raffleId,
        ticketNumber: numToAssign,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `verification_requests/${requestId}`);
    }
  };

  const rejectVerificationRequest = async (requestId: string, reason: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (!req) return;

    const raffleId = req.raffleId;

    try {
      if (req.requestedTicketNumber) {
        const ticketDocRef = doc(db, 'raffles', raffleId, 'tickets', req.requestedTicketNumber);
        await setDoc(ticketDocRef, {
          number: req.requestedTicketNumber,
          status: 'available',
        });
      }

      await updateDoc(doc(db, 'verification_requests', requestId), {
        status: 'rejected',
        rejectionReason: reason,
      });

      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        title: '❌ Solicitud No Aprobada',
        message: `Tu solicitud para "${req.raffleTitle}" no fue aprobada. Motivo: ${reason}`,
        timestamp: new Date().toISOString(),
        type: 'system',
        read: false,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `verification_requests/${requestId}`);
    }
  };

  const assignTicketDirectly = async (
    raffleId: string,
    ticketNumber: string,
    userName: string,
    userHandle: string,
    userPhone: string,
    userEmail?: string,
    userAvatar?: string
  ) => {
    const handleClean = userHandle.trim().startsWith('@')
      ? userHandle.trim()
      : `@${userHandle.trim()}`;

    const nowIso = new Date().toISOString();
    const assignedTicket: Ticket = {
      number: ticketNumber,
      status: 'assigned',
      userName: userName.trim(),
      userHandle: handleClean,
      userPhone: userPhone.trim(),
      userEmail: userEmail?.trim(),
      userAvatar: userAvatar || undefined,
      assignedAt: nowIso,
      verificationDetails: {
        whatsappJoined: true,
        socialsFollowed: true,
        postLiked: true,
        postShared: true,
        taggedFriends: ['@amigo1', '@amigo2'],
      },
    };

    // Optimistic UI update
    setTicketsMap((prev) => {
      const raffleTickets = prev[raffleId] || [];
      const updated = raffleTickets.map((t) =>
        t.number === ticketNumber ? assignedTicket : t
      );
      return { ...prev, [raffleId]: updated };
    });

    try {
      const ticketRef = doc(db, 'raffles', raffleId, 'tickets', ticketNumber);
      await setDoc(ticketRef, assignedTicket);
      return { success: true, message: `Participante ${userName} (${handleClean}) asignado exitosamente` };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `raffles/${raffleId}/tickets/${ticketNumber}`);
      return { success: false, message: 'Error al guardar en la base de datos' };
    }
  };

  const updateTicketParticipant = async (
    raffleId: string,
    ticketNumber: string,
    userName: string,
    userHandle: string,
    userPhone?: string,
    userAvatar?: string
  ) => {
    const handleClean = userHandle.trim().startsWith('@')
      ? userHandle.trim()
      : `@${userHandle.trim()}`;

    // Optimistic UI update
    setTicketsMap((prev) => {
      const raffleTickets = prev[raffleId] || [];
      const updated = raffleTickets.map((t) =>
        t.number === ticketNumber
          ? {
              ...t,
              userName: userName.trim(),
              userHandle: handleClean,
              userPhone: userPhone !== undefined ? userPhone.trim() : t.userPhone,
              userAvatar: userAvatar !== undefined ? userAvatar : t.userAvatar,
            }
          : t
      );
      return { ...prev, [raffleId]: updated };
    });

    try {
      const ticketRef = doc(db, 'raffles', raffleId, 'tickets', ticketNumber);
      await updateDoc(ticketRef, {
        userName: userName.trim(),
        userHandle: handleClean,
        ...(userPhone !== undefined && { userPhone: userPhone.trim() }),
        ...(userAvatar !== undefined && { userAvatar }),
      });
      return { success: true, message: `Participante actualizado a ${userName} (${handleClean})` };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `raffles/${raffleId}/tickets/${ticketNumber}`);
      return { success: false, message: 'Error al actualizar en la base de datos' };
    }
  };

  const addWinnerHistory = async (winnerData: Omit<WinnerHistoryItem, 'id'>) => {
    const newId = `win-${Date.now()}`;
    const newWinner: WinnerHistoryItem = {
      ...winnerData,
      id: newId,
    };
    // Optimistic
    setWinnersHistory((prev) => [newWinner, ...prev]);
    try {
      await setDoc(doc(db, 'winners_history', newId), newWinner);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `winners_history/${newId}`);
    }
  };

  const deleteWinnerHistory = async (winnerId: string) => {
    // Optimistic
    setWinnersHistory((prev) => prev.filter((w) => w.id !== winnerId));
    try {
      await deleteDoc(doc(db, 'winners_history', winnerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `winners_history/${winnerId}`);
    }
  };

  const unassignTicket = async (raffleId: string, ticketNumber: string) => {
    const availableTicket: Ticket = {
      number: ticketNumber,
      status: 'available',
    };

    // Optimistic UI update
    setTicketsMap((prev) => {
      const raffleTickets = prev[raffleId] || [];
      const updated = raffleTickets.map((t) =>
        t.number === ticketNumber ? availableTicket : t
      );
      return { ...prev, [raffleId]: updated };
    });

    try {
      const ticketRef = doc(db, 'raffles', raffleId, 'tickets', ticketNumber);
      await setDoc(ticketRef, availableTicket);
      return { success: true, message: `Boleto #${ticketNumber} liberado nuevamente.` };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `raffles/${raffleId}/tickets/${ticketNumber}`);
      return { success: false, message: 'Error al liberar boleto' };
    }
  };

  const createRaffle = async (data: Omit<Raffle, 'id' | 'createdAt' | 'status'>) => {
    const newId = `raf-${Date.now()}`;
    const newRaffle: Raffle = {
      ...data,
      id: newId,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const generated = generateTickets(newRaffle.totalNumbers, newRaffle.digits);

    // Optimistic UI state update
    setRaffles((prev) => [newRaffle, ...prev.filter((r) => r.id !== newId)]);
    setTicketsMap((prev) => ({ ...prev, [newId]: generated }));

    try {
      await setDoc(doc(db, 'raffles', newId), newRaffle);
      const batch = writeBatch(db);
      generated.forEach((t) => {
        const ticketRef = doc(db, 'raffles', newId, 'tickets', t.number);
        batch.set(ticketRef, t);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `raffles/${newId}`);
    }
  };

  const updateRaffle = async (raffleId: string, updatedFields: Partial<Raffle>) => {
    // Optimistic UI update
    setRaffles((prev) =>
      prev.map((r) => (r.id === raffleId ? { ...r, ...updatedFields } : r))
    );

    try {
      await updateDoc(doc(db, 'raffles', raffleId), updatedFields);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `raffles/${raffleId}`);
    }
  };

  const deleteRaffle = async (raffleId: string) => {
    // Optimistic UI update for instant removal
    setRaffles((prev) => prev.filter((r) => r.id !== raffleId));
    setTicketsMap((prev) => {
      const next = { ...prev };
      delete next[raffleId];
      return next;
    });

    try {
      await deleteDoc(doc(db, 'raffles', raffleId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `raffles/${raffleId}`);
    }
  };

  const pauseRaffle = async (raffleId: string) => {
    const raffle = raffles.find((r) => r.id === raffleId);
    if (!raffle) return;
    const nextStatus: Raffle['status'] = raffle.status === 'paused' ? 'active' : 'paused';

    // Optimistic UI update
    setRaffles((prev) =>
      prev.map((r) => (r.id === raffleId ? { ...r, status: nextStatus } : r))
    );

    try {
      await updateDoc(doc(db, 'raffles', raffleId), { status: nextStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `raffles/${raffleId}`);
    }
  };

  const addSocialLink = async (linkData: Omit<SocialLink, 'id'>) => {
    const newId = `soc-${Date.now()}`;
    const newLink: SocialLink = {
      ...linkData,
      id: newId,
    };
    try {
      await setDoc(doc(db, 'social_links', newId), newLink);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `social_links/${newId}`);
    }
  };

  const updateSocialLink = async (id: string, updated: Partial<SocialLink>) => {
    try {
      await updateDoc(doc(db, 'social_links', id), updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `social_links/${id}`);
    }
  };

  const deleteSocialLink = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'social_links', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `social_links/${id}`);
    }
  };

  const runRandomDraw = async (raffleId: string): Promise<Ticket | null> => {
    const raffle = raffles.find((r) => r.id === raffleId);
    if (!raffle) return null;

    const tickets = ticketsMap[raffleId] || [];
    const assignedTickets = tickets.filter((t) => t.status === 'assigned');

    if (assignedTickets.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * assignedTickets.length);
    const winningTicket = assignedTickets[randomIndex];
    const nowIso = new Date().toISOString();

    try {
      await updateDoc(doc(db, 'raffles', raffleId), {
        status: 'completed',
        winningNumber: winningTicket.number,
        winnerInfo: {
          name: winningTicket.userName || 'Ganador Registrado',
          phone: winningTicket.userPhone,
          ticketNumber: winningTicket.number,
          drawnAt: nowIso,
          proofLink: 'https://instagram.com/variedades_cs',
        },
      });

      const winId = `win-${Date.now()}`;
      const winnerItem: WinnerHistoryItem = {
        id: winId,
        raffleTitle: raffle.title,
        prizeValue: raffle.prizeValue,
        prizeImage: raffle.prizeImage,
        winnerName: winningTicket.userName || 'Ganador Afortunado',
        winnerPhoneMasked: winningTicket.userPhone
          ? winningTicket.userPhone.replace(/(\+\d{2}\s\d{3})\s\d{3}\s(\d{4})/, '$1 *** $2')
          : 'Confidencial',
        ticketNumber: winningTicket.number,
        drawDate: nowIso,
        proofUrl: 'https://instagram.com/variedades_cs',
        testimonial: '¡Ganador en el sorteo aleatorio transparente de Variedades CS Rifas!',
      };
      await setDoc(doc(db, 'winners_history', winId), winnerItem);

      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        title: '🏆 ¡TENEMOS GANADOR!',
        message: `El boleto #${winningTicket.number} de ${winningTicket.userName} ha ganado el premio: ${raffle.title}.`,
        timestamp: nowIso,
        type: 'winner_announced',
        read: false,
        raffleId,
        ticketNumber: winningTicket.number,
      });

      return winningTicket;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `raffles/${raffleId}`);
      return null;
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const clearAllNotifications = async () => {
    try {
      notifications.forEach(async (n) => {
        if (!n.read) {
          await updateDoc(doc(db, 'notifications', n.id), { read: true });
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications');
    }
  };

  const resetSystemData = async () => {
    // Re-seed default collections
    for (const r of INITIAL_RAFFLES) {
      await setDoc(doc(db, 'raffles', r.id), r);
    }
  };

  return (
    <RaffleContext.Provider
      value={{
        raffles,
        ticketsMap,
        socialLinks,
        verificationRequests,
        winnersHistory,
        notifications,
        userProfile,
        currentUser,
        isAdminMode,
        autoApproveMode,
        loginWithGoogle,
        logout,
        toggleAdminMode,
        setAutoApproveMode,
        updateUserProfile,
        submitParticipationRequest,
        approveVerificationRequest,
        rejectVerificationRequest,
        assignTicketDirectly,
        updateTicketParticipant,
        unassignTicket,
        addWinnerHistory,
        deleteWinnerHistory,
        createRaffle,
        updateRaffle,
        deleteRaffle,
        pauseRaffle,
        addSocialLink,
        updateSocialLink,
        deleteSocialLink,
        runRandomDraw,
        markNotificationRead,
        clearAllNotifications,
        resetSystemData,
        musicTracks,
        activeTrackId,
        setActiveTrackId,
        addMusicTrack,
        deleteMusicTrack,
      }}
    >
      {children}
    </RaffleContext.Provider>
  );
};

export const useRaffle = () => {
  const context = useContext(RaffleContext);
  if (!context) {
    throw new Error('useRaffle must be used within a RaffleProvider');
  }
  return context;
};
