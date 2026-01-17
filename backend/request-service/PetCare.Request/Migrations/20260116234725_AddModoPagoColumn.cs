using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetCare.Request.Migrations
{
    /// <inheritdoc />
    public partial class AddModoPagoColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModoPago",
                table: "Solicitudes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModoPago",
                table: "Solicitudes");
        }
    }
}
