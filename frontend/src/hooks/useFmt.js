import useAuthStore from '../store/authStore';
import { fmt } from '../utils/helpers';

export function useFmt() {
  const currency = useAuthStore(s => s.user?.currency || 'UAH');
  return (amount) => fmt(amount, currency);
}
