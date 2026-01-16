FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copiar los csproj
COPY ["shared-kernel/PetCare.Shared/PetCare.Shared.csproj", "shared-kernel/PetCare.Shared/"]
COPY ["payment-service/PetCare.Payment/PetCare.Payment.csproj", "payment-service/PetCare.Payment/"]

# 2. Restore
RUN dotnet restore "payment-service/PetCare.Payment/PetCare.Payment.csproj"

# 3. Copiar todo
COPY . .

# 4. Build
WORKDIR "/src/payment-service/PetCare.Payment"
RUN dotnet build "PetCare.Payment.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PetCare.Payment.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PetCare.Payment.dll"]
