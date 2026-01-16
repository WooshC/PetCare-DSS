using AutoMapper;
using PetCareServicios.Models.Solicitudes;

namespace PetCareServicios.Config
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Mapeo de Solicitud a SolicitudResponse
            CreateMap<Solicitud, SolicitudResponse>()
                .ForMember(dest => dest.NombreCliente, opt => opt.Ignore())
                .ForMember(dest => dest.EmailCliente, opt => opt.Ignore())
                .ForMember(dest => dest.TelefonoCliente, opt => opt.Ignore())
                .ForMember(dest => dest.NombreCuidador, opt => opt.Ignore())
                .ForMember(dest => dest.EmailCuidador, opt => opt.Ignore())
                .ForMember(dest => dest.TelefonoCuidador, opt => opt.Ignore());

            // Mapeo de SolicitudRequest a Solicitud (para creación)
            CreateMap<SolicitudRequest, Solicitud>()
                .ForMember(dest => dest.SolicitudID, opt => opt.Ignore())
                .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => "Pendiente"))
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.FechaActualizacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaAceptacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaInicioServicio, opt => opt.Ignore())
                .ForMember(dest => dest.FechaFinalizacion, opt => opt.Ignore());
        }
    }
} 