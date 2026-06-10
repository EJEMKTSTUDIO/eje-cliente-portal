import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useClientData() {
  const { session } = useAuth();
  const [client, setClient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Get client record for this auth user
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, nombre, tipo_cliente')
          .eq('auth_user_id', session.user.id)
          .single();

        if (clientError) throw clientError;
        setClient(clientData);

        // Get performance records for this client
        const { data: recordsData, error: recordsError } = await supabase
          .from('performance_records')
          .select('*')
          .eq('client_id', clientData.id)
          .order('periodo', { ascending: false });

        if (recordsError) throw recordsError;
        setRecords(recordsData || []);
      } catch (err) {
        setError(err.message || 'Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session?.user?.id]);

  return { client, records, loading, error };
}
