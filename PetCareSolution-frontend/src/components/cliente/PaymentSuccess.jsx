// components/cliente/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';
import { clienteSolicitudService } from '../../services/api/clienteSolicitudAPI';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const solicitudId = searchParams.get('solicitudId');

    useEffect(() => {
        const confirmPayment = async () => {
            if (!solicitudId) {
                setError("Falta el ID de la solicitud.");
                setLoading(false);
                return;
            }

            try {
                // Confirm payment in backend
                await clienteSolicitudService.markAsPaid(solicitudId);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Hubo un problema confirmando el pago. Es posible que ya se haya registrado.");
                setLoading(false);
            }
        };

        confirmPayment();
    }, [solicitudId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                    <p className="text-green-800 font-bold text-xl">Confirmando tu pago...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4">¡Pago Exitoso!</h1>

                {error ? (
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                ) : (
                    <p className="text-slate-600 mb-8 text-lg">
                        Hemos recibido tu pago correctamente. Ahora puedes calificar el servicio.
                    </p>
                )}

                <div className="space-y-4">
                    {/* Assuming we might want to go to rating directly, but for now go to history */}
                    <button
                        onClick={() => navigate('/cliente/historial')}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center"
                    >
                        <Star className="w-5 h-5 mr-2" />
                        Ir a Calificar
                    </button>

                    <button
                        onClick={() => navigate('/cliente/dashboard')}
                        className="w-full py-4 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-lg transition-all"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
