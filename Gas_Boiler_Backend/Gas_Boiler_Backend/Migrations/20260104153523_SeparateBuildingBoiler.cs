using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gas_Boiler_Backend.Migrations
{
    /// <inheritdoc />
    public partial class SeparateBuildingBoiler : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BuildingObjects_GasBoilers_GasBoilerId",
                table: "BuildingObjects");

            migrationBuilder.DropForeignKey(
                name: "FK_GasBoilers_Users_UserId",
                table: "GasBoilers");

            migrationBuilder.DropIndex(
                name: "IX_BuildingObjects_GasBoilerId",
                table: "BuildingObjects");

            migrationBuilder.RenameColumn(
                name: "GasBoilerId",
                table: "BuildingObjects",
                newName: "UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "GasBoilers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<int>(
                name: "BuildingObjectId",
                table: "GasBoilers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "BuildingObjects",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HistoricalData_Timestamp",
                table: "HistoricalData",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_GasBoilers_BuildingObjectId",
                table: "GasBoilers",
                column: "BuildingObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_BuildingObjects_UserId",
                table: "BuildingObjects",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Alarms_IsResolved",
                table: "Alarms",
                column: "IsResolved");

            migrationBuilder.AddForeignKey(
                name: "FK_BuildingObjects_Users_UserId",
                table: "BuildingObjects",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GasBoilers_BuildingObjects_BuildingObjectId",
                table: "GasBoilers",
                column: "BuildingObjectId",
                principalTable: "BuildingObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GasBoilers_Users_UserId",
                table: "GasBoilers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BuildingObjects_Users_UserId",
                table: "BuildingObjects");

            migrationBuilder.DropForeignKey(
                name: "FK_GasBoilers_BuildingObjects_BuildingObjectId",
                table: "GasBoilers");

            migrationBuilder.DropForeignKey(
                name: "FK_GasBoilers_Users_UserId",
                table: "GasBoilers");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Username",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_HistoricalData_Timestamp",
                table: "HistoricalData");

            migrationBuilder.DropIndex(
                name: "IX_GasBoilers_BuildingObjectId",
                table: "GasBoilers");

            migrationBuilder.DropIndex(
                name: "IX_BuildingObjects_UserId",
                table: "BuildingObjects");

            migrationBuilder.DropIndex(
                name: "IX_Alarms_IsResolved",
                table: "Alarms");

            migrationBuilder.DropColumn(
                name: "BuildingObjectId",
                table: "GasBoilers");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "BuildingObjects");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "BuildingObjects",
                newName: "GasBoilerId");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "GasBoilers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.CreateIndex(
                name: "IX_BuildingObjects_GasBoilerId",
                table: "BuildingObjects",
                column: "GasBoilerId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BuildingObjects_GasBoilers_GasBoilerId",
                table: "BuildingObjects",
                column: "GasBoilerId",
                principalTable: "GasBoilers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GasBoilers_Users_UserId",
                table: "GasBoilers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
