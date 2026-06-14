import { supabase } from '../../../lib/supabase'

export async function fetchPayouts() {
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
