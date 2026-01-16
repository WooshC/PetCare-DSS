FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["cuidador-service/PetCare.Cuidador/PetCare.Cuidador.csproj", "cuidador-service/PetCare.Cuidador/"]
RUN dotnet restore "cuidador-service/PetCare.Cuidador/PetCare.Cuidador.csproj"

COPY . .
WORKDIR "/src/cuidador-service/PetCare.Cuidador"
RUN dotnet build "PetCare.Cuidador.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PetCare.Cuidador.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PetCare.Cuidador.dll"] 