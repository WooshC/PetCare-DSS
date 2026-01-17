// components/cliente/CalificarModal.jsx
import React, { useState, useEffect } from 'react';
import { Star, X, MessageSquare, Send, Sparkles } from 'lucide-react';
import { ratingsService } from '../../services/api';
import { clienteSolicitudService } from '../../services/api/clienteSolicitudAPI';

const CalificarModal = ({ solicitud, onClose, onSuccess }) => {
    const [calificacion, setCalificacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(0);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (calificacion === 0) {
            setError('Por favor selecciona una puntuación');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const ratingData = {
                requestId: solicitud.solicitudID,
                cuidadorId: solicitud.cuidadorID,
                score: calificacion,
                comment: comentario
            };

            await ratingsService.createRating(token, ratingData);

            // Asegurar que se marque como calificada también en el servicio de solicitudes
            // Se llama como fallback del backend
            await clienteSolicitudService.markAsRated(solicitud.solicitudID);

            // Éxito
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al calificar:', err);
            // Mostrar mensaje limpio al usuario
            const msg = err.message || 'No pudimos procesar tu calificación';
            // Si el error es "ya existe una calificación", podríamos considerarlo "éxito" para fines prácticos o mostrarlo
            if (msg.includes("Ya existe una calificación")) {
                setError('Ya has calificado esta solicitud anteriormente.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const getRecommendationMsg = () => {
        if (calificacion === 5) return "¡Increíble! Les avisaremos que hicieron un gran trabajo.";
        if (calificacion === 4) return "¡Mucha gracias! Nos alegra que te gustara.";
        if (calificacion > 0) return "Gracias por tu honestidad, nos ayuda a mejorar.";
        return "¿Cómo calificarías el servicio?";
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Elegant Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            {/* Modal Card */}
            <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100 transition-all duration-300 transform scale-100">

                {/* Visual Accent */}
                <div className="h-24 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center relative">
                    <div className="absolute top-4 right-4 focus:outline-none">
                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-2xl absolute -bottom-10 flex items-center justify-center group overflow-hidden">
                        <Star className={`w-10 h-10 transition-all duration-500 ${calificacion > 0 ? 'text-yellow-400 fill-current scale-110 drop-shadow-md' : 'text-slate-100'}`} />
                        {calificacion === 5 && <Sparkles className="absolute w-12 h-12 text-yellow-300 animate-pulse" />}
                    </div>
                </div>

                <div className="p-10 pt-16">
                    <div className="text-center space-y-2 mb-10">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Danos tu opinión</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Servicio de {solicitud.nombreCuidador}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Interactive Star Rating */}
                        <div className="text-center">
                            <div className="flex justify-center space-x-3 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setCalificacion(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        className="focus:outline-none transition-all duration-300 active:scale-90"
                                    >
                                        <Star
                                            className={`w-12 h-12 transition-all duration-300 ${star <= (hoveredStar || calificacion)
                                                ? 'text-amber-400 fill-current drop-shadow-sm scale-110'
                                                : 'text-slate-100 hover:text-slate-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className={`text-sm font-black transition-colors duration-300 ${calificacion > 0 ? 'text-purple-600' : 'text-slate-300'}`}>
                                {getRecommendationMsg()}
                            </p>
                        </div>

                        {/* Comment Section */}
                        <div className="relative group">
                            <div className="absolute left-4 top-4 text-purple-600 transition-transform group-focus-within:scale-110">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <textarea
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                placeholder="Comparte tu experiencia (opcional)..."
                                rows={4}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-500/30 focus:bg-white rounded-3xl focus:ring-0 transition-all text-slate-700 font-medium placeholder:text-slate-400"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 p-4 rounded-2xl flex items-center text-red-600 text-sm font-bold animate-shake">
                                <span className="mr-3">⚠️</span> {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || calificacion === 0}
                            className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-lg transition-all active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300 shadow-xl shadow-slate-100 flex items-center justify-center group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Publicar reseña
                                    <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer brand area */}
                <div className="bg-slate-50 px-10 py-4 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Tu feedback ayuda a la comunidad PetCare</p>
                </div>
            </div>
        </div>
    );
};

export default CalificarModal;
