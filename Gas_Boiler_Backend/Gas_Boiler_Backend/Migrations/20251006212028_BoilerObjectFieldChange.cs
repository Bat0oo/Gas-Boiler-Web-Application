using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gas_Boiler_Backend.Migrations
{
    /// <inheritdoc />
    public partial class BoilerObjectFieldChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "GasBoilers");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "GasBoilers");

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "BuildingObjects",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "BuildingObjects",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "BuildingObjects");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "BuildingObjects");

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "GasBoilers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "GasBoilers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
