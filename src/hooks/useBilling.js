import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useBilling() {
  const { session } = useAuth();
  const [clientId, setClientId] = useState(null);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBilling = useCallback(async (cid) => {
    const { data, error: err } = await supabase
      .from('billing_records')
      .select('*')
      .eq('client_id', cid)
      .not('estado', 'ilike', 'facturado')
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (err) throw err;
    setBilling(data);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('auth_user_id', session.user.id)
          .single();
        if (clientError) throw clientError;
        setClientId(clientData.id);
        await fetchBilling(clientData.id);
      } catch (err) {
        setError(err.message || 'Error al cargar la facturación.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [session?.user?.id, fetchBilling]);

  const uploadComprobante = async (file) => {
    if (!clientId || !billing) throw new Error('Sin datos de cliente o cobro.');
    const ext = file.name.split('.').pop();
    const path = `${clientId}/comprobante/${billing.mes}-${billing.anio}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('billing-files')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) throw upErr;
    const { data: urlData } = supabase.storage.from('billing-files').getPublicUrl(path);
    const { error: updErr } = await supabase
      .from('billing_records')
      .update({ comprobante_url: urlData.publicUrl, estado: 'comprobante_recibido' })
      .eq('id', billing.id);
    if (updErr) throw updErr;
    await fetchBilling(clientId);
  };

  return { billing, loading, error, uploadComprobante, refresh: () => fetchBilling(clientId) };
}
