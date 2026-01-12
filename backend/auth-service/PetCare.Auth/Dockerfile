FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copiar los csproj (incluyendo el compartido)
COPY ["shared-kernel/PetCare.Shared/PetCare.Shared.csproj", "shared-kernel/PetCare.Shared/"]
COPY ["auth-service/PetCare.Auth/PetCare.Auth.csproj", "auth-service/PetCare.Auth/"]

# 2. Restore
RUN dotnet restore "auth-service/PetCare.Auth/PetCare.Auth.csproj"

# 3. Copiar todo el código fuente
COPY . .

# 4. Build
WORKDIR "/src/auth-service/PetCare.Auth"
RUN dotnet build "PetCare.Auth.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PetCare.Auth.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PetCare.Auth.dll"] 