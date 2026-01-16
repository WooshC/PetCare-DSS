// components/cliente/PaymentSummary.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    DollarSign, Clock, Calendar, User, CheckCircle,
    CreditCard, ArrowLeft, Receipt, Star
} from 'lucide-react';
import { clienteSolicitudService } from '../../services/api/clienteSolicitudAPI';

const PaymentSummary = () => {
    const { solicitudId } = useParams();
    const navigate = useNavigate();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        loadSolicitud();
    }, [solicitudId]);

    const loadSolicitud = async () => {
        try {
            setLoading(true);
            const data = await clienteSolicitudService.getMisSolicitudes();
            const found = data.find(s => s.solicitudID === parseInt(solicitudId));

            if (!found) {
                setError('Solicitud no encontrada');
                return;
            }

            if (found.estado !== 'Finalizada') {
                setError('Esta solicitud aún no ha sido finalizada');
                return;
            }

            setSolicitud(found);
        } catch (err) {
            setError(err.message || 'Error cargando la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!solicitud) return 0;
        return (solicitud.duracionHoras || 0) * (solicitud.tarifaPorHora || 0);
    };

    const handlePayment = async () => {
        setProcessingPayment(true);
        // Aquí se integrará con PayPal o el método de pago
        setTimeout(() => {
            alert('Pago procesado exitosamente!');
            navigate('/cliente/historial');
        }, 2000);
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Fecha no disponible';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-bold">Cargando información del servicio...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-md text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Receipt className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Error</h2>
                    <p className="text-slate-600 mb-8">{error}</p>
                    <button
                        onClick={() => navigate('/cliente')}
                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate('/cliente/historial')}
                    className="flex items-center text-slate-600 hover:text-slate-900 font-bold mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver al Historial
                </button>

                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                    {/* Success Banner */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">¡Servicio Completado!</h1>
                        <p className="text-emerald-100 font-medium">Tu mascota recibió el mejor cuidado</p>
                    </div>

                    {/* Service Details */}
                    <div className="p-8 md:p-12">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
                            <Receipt className="w-6 h-6 mr-3 text-blue-600" />
                            Resumen del Servicio
                        </h2>

                        <div className="space-y-6 mb-8">
                            {/* Cuidador Info */}
                            <div className="flex items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mr-4">
                                    {solicitud.nombreCuidador?.charAt(0) || 'C'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Cuidador</p>
                                    <p className="text-lg font-bold text-slate-900">{solicitud.nombreCuidador || 'Cuidador'}</p>
                                    <div className="flex items-center mt-1">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1" />
                                        <span className="text-sm font-bold text-slate-600">
                                            {solicitud.calificacionPromedio?.toFixed(1) || '5.0'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl">
                                    <div className="flex items-center text-slate-400 text-xs font-black uppercase tracking-widest mb-2">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Fecha del Servicio
                                    </div>
                                    <p className="text-slate-900 font-bold">{formatDate(solicitud.fechaHoraInicio)}</p>
                                </div>

                                <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl">
                                    <div className="flex items-center text-slate-400 text-xs font-black uppercase tracking-widest mb-2">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Duración
                                    </div>
                                    <p className="text-slate-900 font-bold">{solicitud.duracionHoras} horas</p>
                                </div>

                                <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl">
                                    <div className="flex items-center text-slate-400 text-xs font-black uppercase tracking-widest mb-2">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Tarifa por Hora
                                    </div>
                                    <p className="text-slate-900 font-bold">{formatCurrency(solicitud.tarifaPorHora || 0)}</p>
                                </div>

                                <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl">
                                    <div className="flex items-center text-slate-400 text-xs font-black uppercase tracking-widest mb-2">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Tipo de Servicio
                                    </div>
                                    <p className="text-slate-900 font-bold">{solicitud.tipoServicio}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="border-t-2 border-slate-100 pt-8">
                            <h3 className="text-xl font-black text-slate-900 mb-6">Desglose de Pago</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 font-medium">Subtotal ({solicitud.duracionHoras}h × {formatCurrency(solicitud.tarifaPorHora || 0)})</span>
                                    <span className="text-slate-900 font-bold">{formatCurrency(total)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 font-medium">Comisión de servicio</span>
                                    <span className="text-emerald-600 font-bold">$0.00</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-black text-slate-900">Total a Pagar</span>
                                    <span className="text-3xl font-black text-blue-600">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Button */}
                        <div className="mt-8 space-y-4">
                            <button
                                onClick={handlePayment}
                                disabled={processingPayment}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                            >
                                {processingPayment ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                ) : (
                                    <>
                                        <CreditCard className="w-6 h-6 mr-3" />
                                        Proceder al Pago
                                    </>
                                )}
                            </button>

                            <p className="text-center text-sm text-slate-500">
                                Pago seguro procesado por <span className="font-bold">PayPal</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;
