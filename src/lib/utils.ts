import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  } else if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffInDays < 30) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  } else {
    return date.toLocaleDateString('pt-BR');
  }
}