using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetCare.Request.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Solicitudes",
                columns: table => new
                {
                    SolicitudID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClienteID = table.Column<int>(type: "int", nullable: true),
                    CuidadorID = table.Column<int>(type: "int", nullable: true),
                    TipoServicio = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false),
                    FechaHoraInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DuracionHoras = table.Column<int>(type: "int", nullable: false),
                    Ubicacion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaAceptacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaInicioServicio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaFinalizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Solicitudes", x => x.SolicitudID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_ClienteID",
                table: "Solicitudes",
                column: "ClienteID");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_CuidadorID",
                table: "Solicitudes",
                column: "CuidadorID");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_Estado",
                table: "Solicitudes",
                column: "Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_FechaCreacion",
                table: "Solicitudes",
                column: "FechaCreacion");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_FechaHoraInicio",
                table: "Solicitudes",
                column: "FechaHoraInicio");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Solicitudes");
        }
    }
}
