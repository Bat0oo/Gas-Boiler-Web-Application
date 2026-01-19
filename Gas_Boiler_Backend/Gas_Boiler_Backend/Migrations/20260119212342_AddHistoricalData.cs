using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gas_Boiler_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddHistoricalData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BuildingReadings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BuildingId = table.Column<int>(type: "int", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IndoorTemperature = table.Column<double>(type: "float", nullable: false),
                    OutdoorTemperature = table.Column<double>(type: "float", nullable: false),
                    TemperatureDifference = table.Column<double>(type: "float", nullable: false),
                    HeatLossWatts = table.Column<double>(type: "float", nullable: false),
                    RequiredPowerKw = table.Column<double>(type: "float", nullable: false),
                    AvailablePowerKw = table.Column<double>(type: "float", nullable: false),
                    HasSufficientCapacity = table.Column<bool>(type: "bit", nullable: false),
                    DailyCostEur = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuildingReadings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BuildingReadings_BuildingObjects_BuildingId",
                        column: x => x.BuildingId,
                        principalTable: "BuildingObjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BuildingReadings_BuildingId",
                table: "BuildingReadings",
                column: "BuildingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BuildingReadings");
        }
    }
}
