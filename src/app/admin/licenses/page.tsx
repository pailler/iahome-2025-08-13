"use client";
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@iahome/utils/supabaseClient';

interface LicenseItem {
  id?: string;
  user_id?: string;
  user_email: string;
  module_name: string;
  plan: string;
  license_jwt: string;
  created_at?: string;
}

export default function LicensesAdminPage() {
  const [items, setItems] = useState<LicenseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string>('');

  const [email, setEmail] = useState('');
  const [moduleName, setModuleName] = useState('ruinedfooocus');
  const [plan, setPlan] = useState('pro');
  const [validityDays, setValidityDays] = useState(30);

  const bearer = useMemo(() => {
    return accessToken ? `Bearer ${accessToken}` : '';
  }, [accessToken]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      if (!bearer) throw new Error('Non authentifié');
      const res = await fetch(`/api/licenses/list`, { headers: { Authorization: bearer } });
      if (!res.ok) throw new Error('Erreur lors du chargement des licences');
      const json = await res.json();
      setItems(json.items || []);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const issueLicense = async () => {
    try {
      setLoading(true);
      if (!bearer) throw new Error('Non authentifié');
      const res = await fetch(`/api/licenses/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: bearer },
        body: JSON.stringify({ targetUserEmail: email, moduleName, plan, validityDays }),
      });
      if (!res.ok) throw new Error('Erreur lors de l\'émission');
      await fetchLicenses();
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      setAccessToken(token);
      if (token) {
        fetchLicenses();
      } else {
        setError('Connectez-vous pour voir les licences');
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-blue-900">Licenses</h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Email utilisateur" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Module" value={moduleName} onChange={(e) => setModuleName(e.target.value)} />
        <select className="border rounded px-3 py-2" value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="pro">pro</option>
          <option value="basic">basic</option>
        </select>
        <input className="border rounded px-3 py-2" type="number" min={1} value={validityDays} onChange={(e) => setValidityDays(parseInt(e.target.value || '30', 10))} />
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={issueLicense} className="bg-blue-600 text-white px-4 py-2 rounded">Émettre</button>
        <button onClick={fetchLicenses} className="bg-gray-100 px-4 py-2 rounded">Rafraîchir</button>
      </div>

      {loading && <p className="mt-4 text-gray-600">Chargement…</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}

      <div className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">Email</th>
              <th className="py-2">Module</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Token (début)</th>
              <th className="py-2">Créé</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2">{it.user_email}</td>
                <td className="py-2">{it.module_name}</td>
                <td className="py-2">{it.plan}</td>
                <td className="py-2 font-mono">{it.license_jwt?.slice(0, 20)}…</td>
                <td className="py-2">{it.created_at ? new Date(it.created_at).toLocaleString() : ''}</td>
                <td className="py-2">
                  {it.module_name?.toLowerCase() === 'ruinedfooocus' && it.license_jwt ? (
                    <a
                      className="inline-flex items-center px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      href={`/api/proxy-ruinedfooocus?license=${encodeURIComponent(it.license_jwt)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ouvrir
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


