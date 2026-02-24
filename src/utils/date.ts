import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateString: string) => {
  return format(parseISO(dateString), 'd MMM yyyy', { locale: fr });
};

export const timeAgo = (dateString: string) => {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: fr });
};
