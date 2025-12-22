import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

// Definición de planes (en producción deberían venir de una config o API)
const PLANS = [
    {
        id: 'price_free', // ID ficticio, backend manejará fallback o error si no existe en Stripe
        name: 'Free',
        price: '$0',
        features: ['1 Neura Agent', 'Basic Chat', 'Community Support'],
        recommended: false,
        priceId: 'price_free_dummy'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$29',
        features: ['Unlimited Agents', 'Advanced Models (GPT-4)', 'Priority Support', 'API Access'],
        recommended: true,
        priceId: 'price_1Q...RequiredRealPriceIdFromStripe' // Placeholder
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        features: ['Dedicated Instance', 'SLA', 'Custom Integrations', 'White Label'],
        recommended: false,
        priceId: 'price_enterprise_dummy'
    }
];

export const PricingPage: React.FC = () => {
    const { user } = useAuth();
    const token = localStorage.getItem('econeura_token');
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async (priceId: string) => {
        if (!token) {
            // Redirigir a login o mostrar modal
            window.location.href = '/login?redirect=/pricing';
            return;
        }

        setLoading(priceId);
        setError(null);

        try {
            // Usar la URL relativa, asumiendo proxy o misma domain
            // Si estamos en dev con puertos distintos, usar env var
            const apiUrl = import.meta.env.VITE_API_URL || '';

            const response = await fetch(`${apiUrl}/api/billing/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ priceId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Checkout failed');
            }

            // Redirigir a Stripe Checkout
            window.location.href = data.url;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error starting checkout');
        } finally {
            setLoading(null);
        }
    };

    const handlePortal = async () => {
        if (!token) return;
        setLoading('portal');
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/billing/portal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success && data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Portal failed');
            }
        } catch (e) {
            setError('Error opening billing portal');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                        Planes y Precios
                    </h1>
                    <p className="text-xl text-gray-400">Escala tu negocio con Inteligencia Artificial</p>

                    {user && (
                        <div className="mt-8">
                            <button
                                onClick={handlePortal}
                                className="text-sm text-gray-500 underline hover:text-white"
                            >
                                {loading === 'portal' ? 'Cargando...' : 'Gestionar mi suscripción actual'}
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200 text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PLANS.map((plan) => (
                        <motion.div
                            key={plan.id}
                            whileHover={{ y: -10 }}
                            className={`relative p-8 rounded-2xl border ${plan.recommended
                                ? 'border-blue-500/50 bg-blue-900/10 shadow-2xl shadow-blue-900/20'
                                : 'border-white/10 bg-white/5'
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    Recomendado
                                </div>
                            )}

                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-500 font-normal">/mes</span></div>

                            <ul className="mb-8 space-y-4">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan.priceId)}
                                disabled={loading !== null}
                                className={`w-full py-3 rounded-lg font-bold transition-all ${plan.recommended
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading === plan.priceId ? 'Procesando...' : 'Elegir Plan'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
