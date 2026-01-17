// pages/Home/components/FAQ.jsx
import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, CreditCard, MessageCircleQuestion } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      icon: ShieldCheck,
      question: "¿Cómo se verifican los cuidadores?",
      answer: "Cada profesional atraviesa un protocolo de seguridad donde un administrador o gestor del sistema se encarga de validar rigurosamente sus documentos de identidad antes de ser activado en la plataforma."
    },
    {
      icon: MessageCircleQuestion,
      question: "¿Puedo elegir al mismo cuidador?",
      answer: "Absolutamente. Puedes marcar perfiles como favoritos. El 70% de nuestros usuarios mantiene un cuidador recurrente para fortalecer el vínculo con la mascota."
    },
    {
      icon: HelpCircle,
      question: "¿Qué pasa ante una emergencia?",
      answer: "Contamos con una red de apoyo 24/7. Cada cuidador tiene protocolos de respuesta inmediata y acceso a telemedicina veterinaria integrada en su aplicativo."
    },
    {
      icon: CreditCard,
      question: "¿Cómo funcionan los pagos?",
      answer: "Utilizamos una pasarela de pago encriptada. El monto se mantiene en custodia por PetCare y solo se libera al cuidador una vez que marcas el servicio como completado."
    }
  ];

  return (
    <section id="faq" className="py-32 bg-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-slate-50 rounded-full -z-10"></div>

      <div className="max-w-4xl w-full mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 border border-slate-200">
            Support & FAQ
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tighter leading-none mb-6">
            ¿Tienes dudas? <br />
            <span className="text-slate-400">Tenemos respuestas.</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group rounded-[2.5rem] transition-all duration-500 overflow-hidden border ${openIndex === index
                ? 'bg-white shadow-2xl shadow-slate-200 border-brand-200 scale-105 z-10'
                : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                }`}
            >
              <button
                className="w-full px-10 py-8 text-left flex justify-between items-center outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center space-x-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${openIndex === index ? 'bg-brand-500 text-white' : 'bg-white text-slate-400'
                    }`}>
                    <faq.icon className="w-5 h-5" />
                  </div>
                  <h3 className={`text-lg font-black tracking-tight transition-colors ${openIndex === index ? 'text-slate-900' : 'text-slate-600'
                    }`}>
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-500 ${openIndex === index ? 'rotate-180 text-brand-500' : ''
                  }`} />
              </button>

              <div className={`transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="px-10 pb-10">
                  <p className="text-slate-500 font-medium leading-relaxed italic border-l-4 border-brand-500 pl-6 ml-6">
                    "{faq.answer}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;