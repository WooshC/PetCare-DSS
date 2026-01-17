FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["calificar-servicie/PetCare.Calificar/PetCare.Calificar.csproj", "calificar-servicie/PetCare.Calificar/"]
RUN dotnet restore "calificar-servicie/PetCare.Calificar/PetCare.Calificar.csproj"

COPY . .
WORKDIR "/src/calificar-servicie/PetCare.Calificar"
RUN dotnet build "PetCare.Calificar.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PetCare.Calificar.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PetCare.Calificar.dll"]
