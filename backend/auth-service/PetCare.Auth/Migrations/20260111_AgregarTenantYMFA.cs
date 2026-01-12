using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetCare.Auth.Migrations
{
    /// <inheritdoc />
    public partial class AgregarTenantYMFA : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Agregar columna para IdentificadorArrendador (Tenant)
            migrationBuilder.AddColumn<string>(
                name: "IdentificadorArrendador",
                table: "AspNetUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            // Actualizar la columna Name a Nombre para consistencia
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "AspNetUsers",
                newName: "Nombre");

            // Agregar soporte para MFA
            migrationBuilder.AddColumn<bool>(
                name: "MFAHabilitado",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ClaveSecretaMFA",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            // Agregar tracking de intentos fallidos
            migrationBuilder.AddColumn<int>(
                name: "IntentosLoginFallidos",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaUltimoIntentoFallido",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            // Agregar bloqueo de cuenta
            migrationBuilder.AddColumn<bool>(
                name: "CuentaBloqueada",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaBloqueo",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            // Renombrar CreatedAt a FechaCreacion
            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "AspNetUsers",
                newName: "FechaCreacion");

            // Crear índice para búsquedas por Tenant
            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_IdentificadorArrendador",
                table: "AspNetUsers",
                column: "IdentificadorArrendador");

            // Crear índice único para Email + Tenant
            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_Email_IdentificadorArrendador",
                table: "AspNetUsers",
                columns: new[] { "Email", "IdentificadorArrendador" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Eliminar índices
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_IdentificadorArrendador",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_Email_IdentificadorArrendador",
                table: "AspNetUsers");

            // Eliminar columnas agregadas
            migrationBuilder.DropColumn(
                name: "IdentificadorArrendador",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "MFAHabilitado",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ClaveSecretaMFA",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IntentosLoginFallidos",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "FechaUltimoIntentoFallido",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CuentaBloqueada",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "FechaBloqueo",
                table: "AspNetUsers");

            // Revertir renombramiento de Nombre a Name
            migrationBuilder.RenameColumn(
                name: "Nombre",
                table: "AspNetUsers",
                newName: "Name");

            // Revertir renombramiento de FechaCreacion a CreatedAt
            migrationBuilder.RenameColumn(
                name: "FechaCreacion",
                table: "AspNetUsers",
                newName: "CreatedAt");
        }
    }
}
