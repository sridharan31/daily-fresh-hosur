import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../lib/supabase/store';
import { checkSession } from '../../../lib/supabase/store/actions/authActions';

export function SessionInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initSession = async () => {
      try {
        console.log('Initializing session on app startup');
        await dispatch(checkSession());
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    initSession();
  }, [dispatch]);

  // This is a "headless" component, it doesn't render anything
  return null;
}

export default SessionInitializer;